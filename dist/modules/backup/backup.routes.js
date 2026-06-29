"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const backup_controller_1 = require("./backup.controller");
const router = express_1.default.Router();
router.post('/sync', backup_controller_1.BackupController.syncBackup);
router.get('/status', backup_controller_1.BackupController.getBackupStatus);
exports.default = router;
