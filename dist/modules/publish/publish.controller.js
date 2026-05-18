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
exports.PublishController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const publish_service_1 = require("./publish.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const publishPage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl, content, isEditable, expiresHours, authorId, ip, title, password, oneTimeView } = req.body;
    // Extract user ID from token if logged in (optional guest support)
    let userId = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        }
        catch (err) {
            // Ignore token verification failure, treat as guest publish
        }
    }
    // Fallback chain for IP detection
    const clientIp = (ip || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '');
    // If user is a guest, set userId to the random authorId (persistent username)
    const finalUserId = userId || authorId || null;
    const result = yield publish_service_1.PublishService.publishPage({
        customUrl,
        content,
        isEditable,
        expiresHours: expiresHours ? Number(expiresHours) : undefined,
        userId: finalUserId || undefined,
        authorId,
        authorIp: clientIp,
        title,
        password,
        oneTimeView: oneTimeView === true || oneTimeView === 'true',
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Page published successfully',
        data: result,
    });
}));
const getPageByUrl = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl } = req.params;
    // Extract client IP (viewer's IP) from request headers or body
    const clientIp = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '');
    const result = yield publish_service_1.PublishService.getPageByUrl(customUrl, clientIp);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Published page retrieved successfully',
        data: result,
    });
}));
const updatePageContent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl } = req.params;
    const { content } = req.body;
    // Extract client IP (editor's IP) from request headers or body
    const clientIp = (req.body.ip || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '');
    const result = yield publish_service_1.PublishService.updatePageContent(customUrl, content, clientIp);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Published page content updated successfully',
        data: result,
    });
}));
const softDeletePage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl } = req.params;
    yield publish_service_1.PublishService.softDeletePage(customUrl);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Published page deleted successfully',
    });
}));
const getAllPagesAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield publish_service_1.PublishService.getAllPagesAdmin();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All published pages retrieved successfully',
        data: result,
    });
}));
const getPagesByAuthor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorId } = req.params;
    const result = yield publish_service_1.PublishService.getPagesByAuthor(authorId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Author published pages retrieved successfully',
        data: result,
    });
}));
const updatePageByAuthor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl } = req.params;
    const { authorId, title, content, pinned, ip } = req.body;
    if (!authorId) {
        throw new ApiError_1.default(400, 'Author ID is required to perform this update');
    }
    const clientIp = (ip || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '');
    const result = yield publish_service_1.PublishService.updatePageByAuthor(customUrl, authorId, { title, content, pinned }, clientIp);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Page updated by author successfully',
        data: result,
    });
}));
const verifyPagePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl } = req.params;
    const { password } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '');
    const result = yield publish_service_1.PublishService.verifyPagePassword(customUrl, password, clientIp);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password verified, page retrieved successfully',
        data: result,
    });
}));
const fetchPageByAuthor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customUrl } = req.params;
    const { authorId } = req.body;
    if (!authorId) {
        throw new ApiError_1.default(400, 'Author ID is required');
    }
    const result = yield publish_service_1.PublishService.fetchPageByAuthor(customUrl, authorId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Page fetched securely by author',
        data: result,
    });
}));
exports.PublishController = {
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
