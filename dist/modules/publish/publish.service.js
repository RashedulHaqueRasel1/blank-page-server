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
exports.PublishService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
// Strip HTML tags to get plain text
const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();
// Compute a simple word-level diff between old and new content
const computeDiff = (oldContent, newContent) => {
    const oldWords = stripHtml(oldContent).split(/\s+/).filter(Boolean);
    const newWords = stripHtml(newContent).split(/\s+/).filter(Boolean);
    const oldSet = new Set(oldWords);
    const newSet = new Set(newWords);
    const added = newWords.filter((w) => !oldSet.has(w)).join(' ');
    const removed = oldWords.filter((w) => !newSet.has(w)).join(' ');
    return { added, removed };
};
const publishPage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.customUrl || data.customUrl.trim().length < 4) {
        throw new ApiError_1.default(400, 'Custom URL must be at least 4 characters long');
    }
    const normalizedUrl = data.customUrl.trim().toLowerCase();
    const existingPage = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
    });
    if (existingPage) {
        throw new ApiError_1.default(400, 'Custom URL is already taken');
    }
    let expiresAt = null;
    if (data.expiresHours && data.expiresHours > 0) {
        expiresAt = new Date(Date.now() + data.expiresHours * 60 * 60 * 1000);
    }
    const newPage = yield prisma_1.default.publishedPage.create({
        data: {
            customUrl: normalizedUrl,
            title: data.title || 'Untitled',
            content: data.content,
            isEditable: data.isEditable,
            expiresAt,
            password: data.password || null,
            oneTimeView: data.oneTimeView || false,
            authorId: data.authorId || null,
            authorIp: data.authorIp || null,
            authorVisits: 0,
            viewerLog: [],
            editorLog: [],
            authorEditsLog: [],
            userId: data.userId || null,
            isDeleted: false,
        },
    });
    return newPage;
});
const getPageByUrl = (customUrl_1, viewerIp_1, ...args_1) => __awaiter(void 0, [customUrl_1, viewerIp_1, ...args_1], void 0, function* (customUrl, viewerIp, bypassPasswordProtection = false) {
    const normalizedUrl = customUrl.trim().toLowerCase();
    const page = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
    });
    if (!page || page.isDeleted) {
        throw new ApiError_1.default(404, 'Page not found');
    }
    if (page.expiresAt && page.expiresAt < new Date()) {
        yield prisma_1.default.publishedPage.update({
            where: { id: page.id },
            data: { isDeleted: true },
        });
        throw new ApiError_1.default(404, 'Page not found');
    }
    // Password Protection Logic
    if (page.password && !bypassPasswordProtection) {
        return {
            isProtected: true,
            title: page.title,
            customUrl: page.customUrl,
            isEditable: page.isEditable,
            expiresAt: page.expiresAt,
            pinned: page.pinned,
        };
    }
    // Track viewer IP with visit count
    if (viewerIp) {
        const now = new Date().toISOString();
        const viewerLog = page.viewerLog || [];
        const existingEntry = viewerLog.find((e) => e.ip === viewerIp);
        let updatedViewerLog;
        if (existingEntry) {
            updatedViewerLog = viewerLog.map((e) => e.ip === viewerIp
                ? Object.assign(Object.assign({}, e), { visitCount: e.visitCount + 1, lastVisit: now }) : e);
        }
        else {
            updatedViewerLog = [...viewerLog, { ip: viewerIp, visitCount: 1, lastVisit: now }];
        }
        // Also increment authorVisits if this viewer is the author
        const isAuthor = page.authorIp && page.authorIp === viewerIp;
        yield prisma_1.default.publishedPage.update({
            where: { id: page.id },
            data: Object.assign({ viewerLog: updatedViewerLog }, (isAuthor ? { authorVisits: { increment: 1 } } : {})),
        });
    }
    // One-Time View: soft-delete after first successful view (author bypasses this)
    if (page.oneTimeView && !bypassPasswordProtection) {
        yield prisma_1.default.publishedPage.update({
            where: { id: page.id },
            data: { isDeleted: true },
        });
    }
    return page;
});
const updatePageContent = (customUrl, content, editorIp) => __awaiter(void 0, void 0, void 0, function* () {
    const page = yield getPageByUrl(customUrl);
    if (!page.isEditable) {
        throw new ApiError_1.default(400, 'This page is view-only and cannot be edited');
    }
    const now = new Date().toISOString();
    const editorLog = page.editorLog || [];
    // Compute diff: only store what changed, not the full content
    const diff = computeDiff(page.content, content);
    const newEdit = { added: diff.added, removed: diff.removed, editedAt: now };
    let updatedEditorLog;
    if (editorIp) {
        const existingEntry = editorLog.find((e) => e.ip === editorIp);
        if (existingEntry) {
            updatedEditorLog = editorLog.map((e) => e.ip === editorIp
                ? Object.assign(Object.assign({}, e), { visitCount: e.visitCount + 1, edits: [...e.edits, newEdit] }) : e);
        }
        else {
            updatedEditorLog = [...editorLog, { ip: editorIp, visitCount: 1, edits: [newEdit] }];
        }
    }
    else {
        updatedEditorLog = editorLog;
    }
    const updatedPage = yield prisma_1.default.publishedPage.update({
        where: { id: page.id },
        data: {
            content,
            editorLog: updatedEditorLog,
        },
    });
    return updatedPage;
});
const softDeletePage = (customUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedUrl = customUrl.trim().toLowerCase();
    const page = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
    });
    if (!page) {
        throw new ApiError_1.default(404, 'Page not found');
    }
    const updatedPage = yield prisma_1.default.publishedPage.update({
        where: { id: page.id },
        data: { isDeleted: true },
    });
    return updatedPage;
});
const getAllPagesAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.publishedPage.findMany({
        orderBy: { createdAt: 'desc' },
    });
});
const getPagesByAuthor = (authorId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.publishedPage.findMany({
        where: {
            authorId,
            isDeleted: false,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        },
        select: {
            customUrl: true,
            isEditable: true,
            expiresAt: true,
            title: true,
            pinned: true,
            oneTimeView: true,
        },
        orderBy: [
            { pinned: 'desc' },
            { createdAt: 'desc' }
        ],
    });
});
const updatePageByAuthor = (customUrl, authorId, updates, editorIp) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedUrl = customUrl.trim().toLowerCase();
    const page = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
    });
    if (!page) {
        throw new ApiError_1.default(404, 'Published page not found');
    }
    // Security verification
    if (page.authorId !== authorId) {
        throw new ApiError_1.default(403, 'You do not have permission to update this page');
    }
    const now = new Date().toISOString();
    const currentAuthorEditsLog = page.authorEditsLog || [];
    const stateChange = { editedAt: now, ip: editorIp || 'unknown' };
    if (updates.title !== undefined && updates.title !== page.title) {
        stateChange.oldTitle = page.title;
        stateChange.newTitle = updates.title;
    }
    if (updates.content !== undefined && updates.content !== page.content) {
        const diff = computeDiff(page.content, updates.content);
        stateChange.diff = { added: diff.added, removed: diff.removed };
        stateChange.contentLength = updates.content.length;
    }
    if (updates.pinned !== undefined && updates.pinned !== page.pinned) {
        stateChange.pinnedState = updates.pinned;
    }
    const updatedPage = yield prisma_1.default.publishedPage.update({
        where: { id: page.id },
        data: {
            title: updates.title !== undefined ? updates.title : page.title,
            content: updates.content !== undefined ? updates.content : page.content,
            pinned: updates.pinned !== undefined ? updates.pinned : page.pinned,
            authorEditsLog: [...currentAuthorEditsLog, stateChange],
        },
    });
    return updatedPage;
});
const verifyPagePassword = (customUrl, passwordAttempt, viewerIp) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedUrl = customUrl.trim().toLowerCase();
    const page = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
    });
    if (!page || page.isDeleted) {
        throw new ApiError_1.default(404, 'Page not found');
    }
    if (!page.password) {
        return yield getPageByUrl(customUrl, viewerIp, true);
    }
    if (page.password !== passwordAttempt) {
        throw new ApiError_1.default(401, 'Incorrect password');
    }
    return yield getPageByUrl(customUrl, viewerIp, true);
});
const fetchPageByAuthor = (customUrl, authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedUrl = customUrl.trim().toLowerCase();
    const page = yield prisma_1.default.publishedPage.findUnique({
        where: { customUrl: normalizedUrl },
    });
    if (!page || page.isDeleted) {
        throw new ApiError_1.default(404, 'Page not found');
    }
    if (page.authorId !== authorId) {
        throw new ApiError_1.default(403, 'You do not have permission to fetch this page');
    }
    // Bypass password protection for the original author
    return yield getPageByUrl(customUrl, undefined, true);
});
exports.PublishService = {
    publishPage,
    getPageByUrl,
    updatePageContent,
    softDeletePage,
    getAllPagesAdmin,
    getPagesByAuthor,
    updatePageByAuthor,
    verifyPagePassword,
    fetchPageByAuthor,
};
