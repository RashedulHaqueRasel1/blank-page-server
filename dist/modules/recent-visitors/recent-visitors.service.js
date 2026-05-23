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
exports.RecentVisitorsService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getRecentVisitors = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [visitors, total] = yield Promise.all([
        prisma_1.default.visitor.findMany({
            orderBy: { lastVisit: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.default.visitor.count(),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: visitors,
    };
});
const getVisitorById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.visitor.findUnique({ where: { id } });
});
const deleteVisitor = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.visitor.delete({ where: { id } });
});
exports.RecentVisitorsService = {
    getRecentVisitors,
    getVisitorById,
    deleteVisitor,
};
