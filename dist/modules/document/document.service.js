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
exports.DocumentService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const createDocument = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield prisma_1.default.document.create({
        data: Object.assign(Object.assign({}, payload), { userId }),
    });
    return document;
});
const getAllDocuments = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const documents = yield prisma_1.default.document.findMany({
        where: { userId },
        orderBy: [
            { pinned: 'desc' },
            { lastModified: 'desc' },
        ],
    });
    return documents;
});
const getSingleDocument = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield prisma_1.default.document.findUnique({
        where: { id },
    });
    if (!document) {
        throw new ApiError_1.default(404, 'Document not found');
    }
    if (document.userId !== userId) {
        throw new ApiError_1.default(403, 'You are not authorized to access this document');
    }
    return document;
});
const updateDocument = (id, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield prisma_1.default.document.findUnique({
        where: { id },
    });
    if (!document) {
        throw new ApiError_1.default(404, 'Document not found');
    }
    if (document.userId !== userId) {
        throw new ApiError_1.default(403, 'You are not authorized to update this document');
    }
    const updatedDocument = yield prisma_1.default.document.update({
        where: { id },
        data: Object.assign(Object.assign({}, payload), { lastModified: new Date() }),
    });
    return updatedDocument;
});
const deleteDocument = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield prisma_1.default.document.findUnique({
        where: { id },
    });
    if (!document) {
        throw new ApiError_1.default(404, 'Document not found');
    }
    if (document.userId !== userId) {
        throw new ApiError_1.default(403, 'You are not authorized to delete this document');
    }
    const deletedDocument = yield prisma_1.default.document.delete({
        where: { id },
    });
    return deletedDocument;
});
exports.DocumentService = {
    createDocument,
    getAllDocuments,
    getSingleDocument,
    updateDocument,
    deleteDocument,
};
