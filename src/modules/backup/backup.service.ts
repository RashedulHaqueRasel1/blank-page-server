import prisma from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

type BackupDocument = {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  pinned?: boolean;
  wasRenamed?: boolean;
  publishedUrl?: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const verifyBackupAccess = async (email: string, backupToken: string) => {
  const normalizedEmail = normalizeEmail(email);
  const subscriber = await prisma.subscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (!subscriber || !subscriber.isVerified) {
    throw new ApiError(403, 'Email must be verified before backup can be enabled');
  }

  if (!subscriber.backupToken || subscriber.backupToken !== backupToken) {
    throw new ApiError(403, 'Invalid backup token');
  }

  return normalizedEmail;
};

const syncBackup = async (
  email: string,
  backupToken: string,
  documents: BackupDocument[],
  isEnabled: boolean = true
) => {
  const normalizedEmail = await verifyBackupAccess(email, backupToken);

  if (!isEnabled) {
    return prisma.userBackup.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        documents: [],
        isEnabled: false,
        lastSyncedAt: new Date(),
      },
      update: {
        documents: [],
        isEnabled: false,
        lastSyncedAt: new Date(),
      },
    });
  }

  const sanitizedDocuments = documents.map((doc) => ({
    id: String(doc.id),
    title: String(doc.title || 'Untitled'),
    content: String(doc.content || ''),
    lastModified: Number(doc.lastModified || Date.now()),
    pinned: Boolean(doc.pinned),
    wasRenamed: Boolean(doc.wasRenamed),
    publishedUrl: doc.publishedUrl ? String(doc.publishedUrl) : null,
  }));

  return prisma.userBackup.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      documents: sanitizedDocuments,
      isEnabled,
      lastSyncedAt: new Date(),
    },
    update: {
      documents: sanitizedDocuments,
      isEnabled,
      lastSyncedAt: new Date(),
    },
  });
};

const getBackupStatus = async (email: string, backupToken: string) => {
  const normalizedEmail = await verifyBackupAccess(email, backupToken);
  const backup = await prisma.userBackup.findUnique({
    where: { email: normalizedEmail },
  });
  const documents = Array.isArray(backup?.documents) ? backup.documents : [];

  return {
    email: normalizedEmail,
    isEnabled: backup?.isEnabled || false,
    lastSyncedAt: backup?.lastSyncedAt || null,
    documentCount: documents.length,
    documents,
  };
};

export const BackupService = {
  syncBackup,
  getBackupStatus,
};
