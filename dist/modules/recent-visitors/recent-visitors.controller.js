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
exports.RecentVisitorsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const recent_visitors_service_1 = require("./recent-visitors.service");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const getRecentVisitors = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = yield recent_visitors_service_1.RecentVisitorsService.getRecentVisitors(page, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Recent visitors retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getVisitorById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const visitor = yield recent_visitors_service_1.RecentVisitorsService.getVisitorById(id);
    if (!visitor) {
        throw new ApiError_1.default(404, 'Visitor not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visitor retrieved successfully',
        data: visitor,
    });
}));
const deleteVisitor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    yield recent_visitors_service_1.RecentVisitorsService.deleteVisitor(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visitor deleted successfully',
    });
}));
exports.RecentVisitorsController = {
    getRecentVisitors,
    getVisitorById,
    deleteVisitor,
};
