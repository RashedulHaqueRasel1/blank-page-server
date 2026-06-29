"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const backup_service_1 = require("./backup.service");
const syncBackup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, backupToken, documents, isEnabled } = req.body;
    if (!email || typeof email !== 'string') {
        throw new ApiError_1.default(400, 'Valid email is required');
    }
    if (!backupToken || typeof backupToken !== 'string') {
        throw new ApiError_1.default(400, 'Backup token is required');
    }
    if (!Array.isArray(documents)) {
        throw new ApiError_1.default(400, 'Documents must be an array');
    }
    const result = yield backup_service_1.BackupService.syncBackup(email, backupToken, documents, isEnabled !== false);
    (0, sendResponse_1.default)(res, {
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
}));
const getBackupStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = String(req.query.email || '');
    const backupToken = String(req.query.backupToken || '');
    if (!email || !backupToken) {
        throw new ApiError_1.default(400, 'Email and backup token are required');
    }
    const result = yield backup_service_1.BackupService.getBackupStatus(email, backupToken);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Backup status retrieved successfully',
        data: result,
    });
}));
exports.BackupController = {
    syncBackup,
    getBackupStatus,
};
