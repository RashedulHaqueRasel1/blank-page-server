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
exports.TypingTestService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const createSession = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return prisma_1.default.typingTestSession.create({
        data: {
            ownerId: payload.ownerId,
            accountUserId: payload.accountUserId || null,
            authorId: payload.authorId || null,
            language: payload.language,
            duration: payload.duration,
            mode: payload.mode,
            wordTarget: (_a = payload.wordTarget) !== null && _a !== void 0 ? _a : null,
            targetText: payload.targetText,
            targetWordCount: payload.targetWordCount,
            source: payload.source,
        },
    });
});
const completeSession = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield prisma_1.default.typingTestSession.findFirst({
        where: {
            id: payload.sessionId,
            ownerId: payload.ownerId,
        },
    });
    if (!session) {
        return null;
    }
    return prisma_1.default.typingTestSession.update({
        where: { id: session.id },
        data: {
            typedText: payload.typedText,
            elapsedSeconds: payload.elapsedSeconds,
            result: payload.result,
            completedAt: new Date(),
        },
    });
});
const getRandomSavedText = (_a) => __awaiter(void 0, [_a], void 0, function* ({ language, duration, wordTarget, }) {
    const sessions = yield prisma_1.default.typingTestSession.findMany({
        where: Object.assign({ language, targetText: {
                not: '',
            } }, (wordTarget
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
            })),
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
});
exports.TypingTestService = {
    createSession,
    completeSession,
    getRandomSavedText,
};
