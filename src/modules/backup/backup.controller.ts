import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../errors/ApiError';
import { BackupService } from './backup.service';

const syncBackup = catchAsync(async (req: Request, res: Response) => {
  const { email, backupToken, documents, isEnabled } = req.body;

  if (!email || typeof email !== 'string') {
    throw new ApiError(400, 'Valid email is required');
  }

  if (!backupToken || typeof backupToken !== 'string') {
    throw new ApiError(400, 'Backup token is required');
  }

  if (!Array.isArray(documents)) {
    throw new ApiError(400, 'Documents must be an array');
  }

  const result = await BackupService.syncBackup(email, backupToken, documents, isEnabled !== false);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Backup synced successfully',
    data: {
      email: result.email,
      isEnabled: result.isEnabled,
      lastSyncedAt: result.lastSyncedAt,
      documentCount: Array.isArray(result.documents) ? result.documents.length : 0,
    },
  });
});

const getBackupStatus = catchAsync(async (req: Request, res: Response) => {
  const email = String(req.query.email || '');
  const backupToken = String(req.query.backupToken || '');

  if (!email || !backupToken) {
    throw new ApiError(400, 'Email and backup token are required');
  }

  const result = await BackupService.getBackupStatus(email, backupToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Backup status retrieved successfully',
    data: result,
  });
});

export const BackupController = {
  syncBackup,
  getBackupStatus,
};
