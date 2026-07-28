import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import prisma from './lib/prisma';

type CollaborativeOperation = {
  opId: string;
  customUrl: string;
  baseVersion: number;
  index: number;
  deleteCount: number;
  insertText: string;
};

type AppliedOperation = Omit<CollaborativeOperation, 'customUrl' | 'baseVersion'> & {
  version: number;
};

type PageSession = {
  content: string;
  version: number;
  history: AppliedOperation[];
  saveTimer?: NodeJS.Timeout;
};

const pageSessions = new Map<string, PageSession>();
let ioInstance: SocketIOServer | null = null;

export const updateSocketPageSession = (customUrl: string, content: string) => {
  const normalizedUrl = customUrl.trim().toLowerCase();
  const session = pageSessions.get(normalizedUrl);
  if (session) {
    if (session.saveTimer) clearTimeout(session.saveTimer);
    session.content = content;
    session.version += 1;
    session.history = [];
  } else {
    pageSessions.set(normalizedUrl, {
      content,
      version: 1,
      history: [],
    });
  }

  if (ioInstance) {
    ioInstance.to(normalizedUrl).emit('page-updated', content);
  }
};

export const clearSocketPageSession = (customUrl: string) => {
  const normalizedUrl = customUrl.trim().toLowerCase();
  const session = pageSessions.get(normalizedUrl);
  if (session?.saveTimer) clearTimeout(session.saveTimer);
  pageSessions.delete(normalizedUrl);
};

const clampOperation = (operation: CollaborativeOperation, contentLength: number): CollaborativeOperation => ({
  ...operation,
  index: Math.max(0, Math.min(Number(operation.index) || 0, contentLength)),
  deleteCount: Math.max(0, Math.min(Number(operation.deleteCount) || 0, contentLength - Math.max(0, Number(operation.index) || 0))),
  insertText: String(operation.insertText || ''),
});

const applyOperation = (content: string, operation: Pick<CollaborativeOperation, 'index' | 'deleteCount' | 'insertText'>) => {
  const safeOperation = clampOperation({ ...operation, opId: '', customUrl: '', baseVersion: 0 }, content.length);
  return `${content.slice(0, safeOperation.index)}${safeOperation.insertText}${content.slice(safeOperation.index + safeOperation.deleteCount)}`;
};

const transformOperation = (operation: CollaborativeOperation, applied: AppliedOperation): CollaborativeOperation => {
  const transformed = { ...operation };
  const appliedStart = applied.index;
  const appliedEnd = applied.index + applied.deleteCount;
  const appliedDelta = applied.insertText.length - applied.deleteCount;

  if (transformed.index > appliedEnd) {
    transformed.index += appliedDelta;
  } else if (transformed.index >= appliedStart) {
    transformed.index = appliedStart + applied.insertText.length;
  }

  return transformed;
};

const getPageSession = async (customUrl: string): Promise<PageSession> => {
  const normalizedUrl = customUrl.trim().toLowerCase();
  const cached = pageSessions.get(normalizedUrl);
  if (cached) return cached;

  const page = await prisma.publishedPage.findUnique({
    where: { customUrl: normalizedUrl },
    select: { content: true },
  });

  const session: PageSession = {
    content: page?.content || '',
    version: 0,
    history: [],
  };
  pageSessions.set(normalizedUrl, session);
  return session;
};

const schedulePersist = (customUrl: string, session: PageSession) => {
  if (session.saveTimer) clearTimeout(session.saveTimer);

  session.saveTimer = setTimeout(async () => {
    try {
      await prisma.publishedPage.update({
        where: { customUrl },
        data: { content: session.content },
      });
    } catch (error) {
      console.error('Failed to persist collaborative page content:', error);
    }
  }, 800);
};

export const initSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join-page', async (customUrl: string) => {
      const normalizedUrl = customUrl.trim().toLowerCase();
      socket.join(normalizedUrl);
      console.log(`🔌 Socket ${socket.id} joined page: ${normalizedUrl}`);

      try {
        const session = await getPageSession(normalizedUrl);
        socket.emit('collab-state', {
          customUrl: normalizedUrl,
          content: session.content,
          version: session.version,
        });
      } catch (error) {
        console.error('Failed to initialize collaborative page session:', error);
      }
    });

    socket.on('edit-page', async (data: { customUrl: string; content: string }) => {
      try {
        const normalizedUrl = data.customUrl.trim().toLowerCase();
        const page = await prisma.publishedPage.findUnique({
          where: { customUrl: normalizedUrl },
          select: { isEditable: true, isDeleted: true },
        });

        if (!page || page.isDeleted || !page.isEditable) {
          socket.emit('collab-rejected', { message: 'This page cannot be edited' });
          return;
        }

        updateSocketPageSession(normalizedUrl, data.content);
        socket.to(normalizedUrl).emit('page-updated', data.content);

        const session = await getPageSession(normalizedUrl);
        if (session) {
          schedulePersist(normalizedUrl, session);
        }
      } catch (error) {
        console.error('Failed to apply edit-page:', error);
      }
    });

    socket.on('collab-operation', async (operation: CollaborativeOperation) => {
      try {
        const normalizedUrl = operation.customUrl.trim().toLowerCase();
        const page = await prisma.publishedPage.findUnique({
          where: { customUrl: normalizedUrl },
          select: { isEditable: true, isDeleted: true },
        });

        if (!page || page.isDeleted || !page.isEditable) {
          socket.emit('collab-rejected', { opId: operation.opId, message: 'This page cannot be edited' });
          return;
        }

        const session = await getPageSession(normalizedUrl);
        const missedOperations = session.history.filter((item) => item.version > operation.baseVersion);
        const transformedOperation = missedOperations.reduce(
          (nextOperation, appliedOperation) => transformOperation(nextOperation, appliedOperation),
          clampOperation(operation, session.content.length)
        );

        const acceptedOperation: AppliedOperation = {
          opId: transformedOperation.opId,
          index: transformedOperation.index,
          deleteCount: transformedOperation.deleteCount,
          insertText: transformedOperation.insertText,
          version: session.version + 1,
        };

        session.content = applyOperation(session.content, acceptedOperation);
        session.version = acceptedOperation.version;
        session.history = [...session.history, acceptedOperation].slice(-100);
        schedulePersist(normalizedUrl, session);

        io.to(normalizedUrl).emit('collab-operation-applied', {
          ...acceptedOperation,
          customUrl: normalizedUrl,
          content: session.content,
        });
      } catch (error) {
        console.error('Failed to apply collaborative operation:', error);
        socket.emit('collab-rejected', { opId: operation.opId, message: 'Could not apply edit' });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};
