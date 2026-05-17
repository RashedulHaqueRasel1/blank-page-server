import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';
import { PublishedPage } from '@prisma/client';

type PublishPageData = {
  customUrl: string;
  content: string;
  isEditable: boolean;
  expiresHours?: number;
  userId?: string;
  authorId?: string;
  authorIp?: string;
};

// Viewer log entry shape: { ip, visitCount, lastVisit }
type ViewerEntry = { ip: string; visitCount: number; lastVisit: string };
// Editor log entry shape: { ip, visitCount, edits: [{added, removed, editedAt}] }
type EditRecord = { added: string; removed: string; editedAt: string };
type EditorEntry = { ip: string; visitCount: number; edits: EditRecord[] };

// Strip HTML tags to get plain text
const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, '').trim();

// Compute a simple word-level diff between old and new content
const computeDiff = (oldContent: string, newContent: string): { added: string; removed: string } => {
  const oldWords = stripHtml(oldContent).split(/\s+/).filter(Boolean);
  const newWords = stripHtml(newContent).split(/\s+/).filter(Boolean);

  const oldSet = new Set(oldWords);
  const newSet = new Set(newWords);

  const added = newWords.filter((w) => !oldSet.has(w)).join(' ');
  const removed = oldWords.filter((w) => !newSet.has(w)).join(' ');

  return { added, removed };
};

const publishPage = async (data: PublishPageData): Promise<PublishedPage> => {
  if (!data.customUrl || data.customUrl.trim().length < 4) {
    throw new ApiError(400, 'Custom URL must be at least 4 characters long');
  }

  const normalizedUrl = data.customUrl.trim().toLowerCase();

  const existingPage = await prisma.publishedPage.findUnique({
    where: { customUrl: normalizedUrl },
  });

  if (existingPage) {
    throw new ApiError(400, 'Custom URL is already taken');
  }

  let expiresAt: Date | null = null;
  if (data.expiresHours && data.expiresHours > 0) {
    expiresAt = new Date(Date.now() + data.expiresHours * 60 * 60 * 1000);
  }

  const newPage = await prisma.publishedPage.create({
    data: {
      customUrl: normalizedUrl,
      content: data.content,
      isEditable: data.isEditable,
      expiresAt,
      authorId: data.authorId || null,
      authorIp: data.authorIp || null,
      authorVisits: 0,
      viewerLog: [],
      editorLog: [],
      userId: data.userId || null,
      isDeleted: false,
    },
  });

  return newPage;
};

const getPageByUrl = async (customUrl: string, viewerIp?: string): Promise<PublishedPage> => {
  const normalizedUrl = customUrl.trim().toLowerCase();

  const page = await prisma.publishedPage.findUnique({
    where: { customUrl: normalizedUrl },
  });

  if (!page || page.isDeleted) {
    throw new ApiError(404, 'Page not found');
  }

  if (page.expiresAt && page.expiresAt < new Date()) {
    await prisma.publishedPage.update({
      where: { id: page.id },
      data: { isDeleted: true },
    });
    throw new ApiError(404, 'Page not found');
  }

  // Track viewer IP with visit count
  if (viewerIp) {
    const now = new Date().toISOString();
    const viewerLog = (page.viewerLog as ViewerEntry[]) || [];
    const existingEntry = viewerLog.find((e) => e.ip === viewerIp);

    let updatedViewerLog: ViewerEntry[];
    if (existingEntry) {
      updatedViewerLog = viewerLog.map((e) =>
        e.ip === viewerIp
          ? { ...e, visitCount: e.visitCount + 1, lastVisit: now }
          : e
      );
    } else {
      updatedViewerLog = [...viewerLog, { ip: viewerIp, visitCount: 1, lastVisit: now }];
    }

    // Also increment authorVisits if this viewer is the author
    const isAuthor = page.authorIp && page.authorIp === viewerIp;

    await prisma.publishedPage.update({
      where: { id: page.id },
      data: {
        viewerLog: updatedViewerLog as any,
        ...(isAuthor ? { authorVisits: { increment: 1 } } : {}),
      },
    });
  }

  return page;
};

const updatePageContent = async (
  customUrl: string,
  content: string,
  editorIp?: string
): Promise<PublishedPage> => {
  const page = await getPageByUrl(customUrl);

  if (!page.isEditable) {
    throw new ApiError(400, 'This page is view-only and cannot be edited');
  }

  const now = new Date().toISOString();
  const editorLog = (page.editorLog as EditorEntry[]) || [];

  // Compute diff: only store what changed, not the full content
  const diff = computeDiff(page.content, content);
  const newEdit: EditRecord = { added: diff.added, removed: diff.removed, editedAt: now };

  let updatedEditorLog: EditorEntry[];
  if (editorIp) {
    const existingEntry = editorLog.find((e) => e.ip === editorIp);
    if (existingEntry) {
      updatedEditorLog = editorLog.map((e) =>
        e.ip === editorIp
          ? { ...e, visitCount: e.visitCount + 1, edits: [...e.edits, newEdit] }
          : e
      );
    } else {
      updatedEditorLog = [...editorLog, { ip: editorIp, visitCount: 1, edits: [newEdit] }];
    }
  } else {
    updatedEditorLog = editorLog;
  }

  const updatedPage = await prisma.publishedPage.update({
    where: { id: page.id },
    data: {
      content,
      editorLog: updatedEditorLog as any,
    },
  });

  return updatedPage;
};

const softDeletePage = async (customUrl: string): Promise<PublishedPage> => {
  const normalizedUrl = customUrl.trim().toLowerCase();

  const page = await prisma.publishedPage.findUnique({
    where: { customUrl: normalizedUrl },
  });

  if (!page) {
    throw new ApiError(404, 'Page not found');
  }

  const updatedPage = await prisma.publishedPage.update({
    where: { id: page.id },
    data: { isDeleted: true },
  });

  return updatedPage;
};

const getAllPagesAdmin = async (): Promise<PublishedPage[]> => {
  return prisma.publishedPage.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const PublishService = {
  publishPage,
  getPageByUrl,
  updatePageContent,
  softDeletePage,
  getAllPagesAdmin,
};
