import express from 'express';
import { BackupController } from './backup.controller';

const router = express.Router();

router.post('/sync', BackupController.syncBackup);
router.get('/status', BackupController.getBackupStatus);

export default router;
