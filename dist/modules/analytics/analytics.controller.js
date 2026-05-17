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
exports.AnalyticsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const analytics_service_1 = require("./analytics.service");
const trackVisit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { d } = req.body;
    let decryptedPayload = {};
    if (d) {
        try {
            const decodedString = Buffer.from(d, 'base64').toString('ascii');
            decryptedPayload = JSON.parse(decodedString);
        }
        catch (err) {
            // Fail silently if tampering occurs
        }
    }
    const bodyIp = decryptedPayload.ip;
    const referrer = decryptedPayload.referrer;
    // Extract client IP robustly, taking body, proxies, and socket into account
    const forwarded = req.headers['x-forwarded-for'];
    const ip = bodyIp || (typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket.remoteAddress || req.ip || '127.0.0.1');
    const userAgent = req.headers['user-agent'] || 'Unknown';
    // Perform visitor tracking in database
    yield analytics_service_1.AnalyticsService.trackVisit(ip, userAgent, referrer);
    // Return HTTP 204 No Content with absolutely NO body for absolute stealth in Network tab
    res.status(204).send();
}));
const getStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield analytics_service_1.AnalyticsService.getStats();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Analytics statistics retrieved successfully',
        data: result,
    });
}));
exports.AnalyticsController = {
    trackVisit,
    getStats,
};
