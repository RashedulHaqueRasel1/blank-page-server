import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/client';

type CreateTypingSessionPayload = {
  ownerId: string;
  accountUserId?: string | null;
  authorId?: string | null;
  language: string;
  duration: number;
  mode: 'time' | 'words';
  wordTarget?: number | null;
  targetText: string;
  targetWordCount: number;
  source: 'ai' | 'database' | 'fallback';
};

type CompleteTypingSessionPayload = {
  sessionId: string;
  ownerId: string;
  typedText: string;
  elapsedSeconds: number;
  result: Record<string, unknown>;
};

const createSession = async (payload: CreateTypingSessionPayload) => {
  return prisma.typingTestSession.create({
    data: {
      ownerId: payload.ownerId,
      accountUserId: payload.accountUserId || null,
      authorId: payload.authorId || null,
      language: payload.language,
      duration: payload.duration,
      mode: payload.mode,
      wordTarget: payload.wordTarget ?? null,
      targetText: payload.targetText,
      targetWordCount: payload.targetWordCount,
      source: payload.source,
    },
  });
};

const completeSession = async (payload: CompleteTypingSessionPayload) => {
  const session = await prisma.typingTestSession.findFirst({
    where: {
      id: payload.sessionId,
      ownerId: payload.ownerId,
    },
  });

  if (!session) {
    return null;
  }

  return prisma.typingTestSession.update({
    where: { id: session.id },
    data: {
      typedText: payload.typedText,
      elapsedSeconds: payload.elapsedSeconds,
      result: payload.result as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
  });
};

const getRandomSavedText = async ({
  language,
  duration,
  wordTarget,
}: {
  language: string;
  duration: number;
  wordTarget?: number | null;
}) => {
  const sessions = await prisma.typingTestSession.findMany({
    where: {
      language,
      targetText: {
        not: '',
      },
      ...(wordTarget
        ? {
            OR: [
              { wordTarget },
              {
                wordTarget: null,
                duration,
              },
            ],
          }
        : {
            duration,
          }),
    },
    select: {
      id: true,
      language: true,
      duration: true,
      mode: true,
      wordTarget: true,
      targetText: true,
      targetWordCount: true,
      source: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  if (sessions.length === 0) {
    return null;
  }

  const selected = sessions[Math.floor(Math.random() * sessions.length)];

  return {
    id: selected.id,
    language: selected.language,
    duration: selected.duration,
    mode: selected.mode,
    wordTarget: selected.wordTarget,
    text: selected.targetText,
    wordCount: selected.targetWordCount,
    source: selected.source,
  };
};

export const TypingTestService = {
  createSession,
  completeSession,
  getRandomSavedText,
};
