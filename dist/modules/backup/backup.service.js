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
exports.BackupService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const normalizeEmail = (email) => email.trim().toLowerCase();
const verifyBackupAccess = (email, backupToken) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedEmail = normalizeEmail(email);
    const subscriber = yield prisma_1.default.subscriber.findUnique({
        where: { email: normalizedEmail },
    });
    if (!subscriber || !subscriber.isVerified) {
        throw new ApiError_1.default(403, 'Email must be verified before backup can be enabled');
    }
    if (!subscriber.backupToken || subscriber.backupToken !== backupToken) {
        throw new ApiError_1.default(403, 'Invalid backup token');
    }
    return normalizedEmail;
});
const syncBackup = (email_1, backupToken_1, documents_1, ...args_1) => __awaiter(void 0, [email_1, backupToken_1, documents_1, ...args_1], void 0, function* (email, backupToken, documents, isEnabled = true) {
    const normalizedEmail = yield verifyBackupAccess(email, backupToken);
    if (!isEnabled) {
        return prisma_1.default.userBackup.upsert({
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
    return prisma_1.default.userBackup.upsert({
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
});
const getBackupStatus = (email, backupToken) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedEmail = yield verifyBackupAccess(email, backupToken);
    const backup = yield prisma_1.default.userBackup.findUnique({
        where: { email: normalizedEmail },
    });
    const documents = Array.isArray(backup === null || backup === void 0 ? void 0 : backup.documents) ? backup.documents : [];
    return {
        email: normalizedEmail,
        isEnabled: (backup === null || backup === void 0 ? void 0 : backup.isEnabled) || false,
        lastSyncedAt: (backup === null || backup === void 0 ? void 0 : backup.lastSyncedAt) || null,
        documentCount: documents.length,
        documents,
    };
});
exports.BackupService = {
    syncBackup,
    getBackupStatus,
};
