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
exports.TypingTestController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const typing_test_service_1 = require("./typing-test.service");
const createSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ownerId, accountUserId, authorId, language, duration, mode, wordTarget, targetText, targetWordCount, source, } = req.body;
    if (!ownerId || !targetText || !language) {
        throw new ApiError_1.default(400, 'ownerId, language and targetText are required');
    }
    const result = yield typing_test_service_1.TypingTestService.createSession({
        ownerId,
        accountUserId,
        authorId,
        language,
        duration: Number(duration),
        mode: mode === 'words' ? 'words' : 'time',
        wordTarget: typeof wordTarget === 'number' ? wordTarget : wordTarget ? Number(wordTarget) : null,
        targetText,
        targetWordCount: Number(targetWordCount) || 0,
        source: source === 'database' ? 'database' : source === 'fallback' ? 'fallback' : 'ai',
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Typing test session saved',
        data: {
            id: result.id,
        },
    });
}));
const completeSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const { ownerId, typedText, elapsedSeconds, result } = req.body;
    if (!ownerId || typeof typedText !== 'string' || !result) {
        throw new ApiError_1.default(400, 'ownerId, typedText and result are required');
    }
    const updated = yield typing_test_service_1.TypingTestService.completeSession({
        sessionId: String(sessionId),
        ownerId,
        typedText,
        elapsedSeconds: Number(elapsedSeconds) || 0,
        result,
    });
    if (!updated) {
        throw new ApiError_1.default(404, 'Typing test session not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Typing test result saved',
        data: {
            id: updated.id,
            completedAt: updated.completedAt,
        },
    });
}));
const getRandomSavedText = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const language = String(req.query.language || '');
    const duration = Number(req.query.duration) || 30;
    const rawWordTarget = req.query.wordTarget;
    const wordTarget = rawWordTarget ? Number(rawWordTarget) : null;
    if (!language) {
        throw new ApiError_1.default(400, 'language is required');
    }
    const result = yield typing_test_service_1.TypingTestService.getRandomSavedText({
        language,
        duration,
        wordTarget,
    });
    if (!result) {
        throw new ApiError_1.default(404, 'No saved typing text found for this language');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Saved typing text retrieved',
        data: result,
    });
}));
exports.TypingTestController = {
    createSession,
    completeSession,
    getRandomSavedText,
};
