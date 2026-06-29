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
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("./lib/prisma"));
const pageSessions = new Map();
const clampOperation = (operation, contentLength) => (Object.assign(Object.assign({}, operation), { index: Math.max(0, Math.min(Number(operation.index) || 0, contentLength)), deleteCount: Math.max(0, Math.min(Number(operation.deleteCount) || 0, contentLength - Math.max(0, Number(operation.index) || 0))), insertText: String(operation.insertText || '') }));
const applyOperation = (content, operation) => {
    const safeOperation = clampOperation(Object.assign(Object.assign({}, operation), { opId: '', customUrl: '', baseVersion: 0 }), content.length);
    return `${content.slice(0, safeOperation.index)}${safeOperation.insertText}${content.slice(safeOperation.index + safeOperation.deleteCount)}`;
};
const transformOperation = (operation, applied) => {
    const transformed = Object.assign({}, operation);
    const appliedStart = applied.index;
    const appliedEnd = applied.index + applied.deleteCount;
    const appliedDelta = applied.insertText.length - applied.deleteCount;
    if (transformed.index > appliedEnd) {
        transformed.index += appliedDelta;
    }
    else if (transformed.index >= appliedStart) {
        transformed.index = appliedStart + applied.insertText.length;
    }
    return transformed;
};
const getPageSession = (customUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedUrl = customUrl.trim().toLowerCase();
    const cached = pageSessions.get(normalizedUrl);
    if (cached)
        return cached;
    const page = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
        select: { content: true },
    });
    const session = {
        content: (page === null || page === void 0 ? void 0 : page.content) || '',
        version: 0,
        history: [],
    };
    pageSessions.set(normalizedUrl, session);
    return session;
});
const schedulePersist = (customUrl, session) => {
    if (session.saveTimer)
        clearTimeout(session.saveTimer);
    session.saveTimer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield prisma_1.default.publishedPage.update({
                where: { customUrl },
                data: { content: session.content },
            });
        }
        catch (error) {
            console.error('Failed to persist collaborative page content:', error);
        }
    }), 800);
};
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);
        socket.on('join-page', (customUrl) => __awaiter(void 0, void 0, void 0, function* () {
            const normalizedUrl = customUrl.trim().toLowerCase();
            socket.join(normalizedUrl);
            console.log(`🔌 Socket ${socket.id} joined page: ${normalizedUrl}`);
            try {
                const session = yield getPageSession(normalizedUrl);
                socket.emit('collab-state', {
                    customUrl: normalizedUrl,
                    content: session.content,
                    version: session.version,
                });
            }
            catch (error) {
                console.error('Failed to initialize collaborative page session:', error);
            }
        }));
        socket.on('edit-page', (data) => {
            // Broadcast to all OTHER clients in the room
            socket.to(data.customUrl.trim().toLowerCase()).emit('page-updated', data.content);
        });
        socket.on('collab-operation', (operation) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const normalizedUrl = operation.customUrl.trim().toLowerCase();
                const page = yield prisma_1.default.publishedPage.findUnique({
                    where: { customUrl: normalizedUrl },
                    select: { isEditable: true, isDeleted: true },
                });
                if (!page || page.isDeleted || !page.isEditable) {
                    socket.emit('collab-rejected', { opId: operation.opId, message: 'This page cannot be edited' });
                    return;
                }
                const session = yield getPageSession(normalizedUrl);
                const missedOperations = session.history.filter((item) => item.version > operation.baseVersion);
                const transformedOperation = missedOperations.reduce((nextOperation, appliedOperation) => transformOperation(nextOperation, appliedOperation), clampOperation(operation, session.content.length));
                const acceptedOperation = {
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
                io.to(normalizedUrl).emit('collab-operation-applied', Object.assign(Object.assign({}, acceptedOperation), { customUrl: normalizedUrl, content: session.content }));
            }
            catch (error) {
                console.error('Failed to apply collaborative operation:', error);
                socket.emit('collab-rejected', { opId: operation.opId, message: 'Could not apply edit' });
            }
        }));
        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
