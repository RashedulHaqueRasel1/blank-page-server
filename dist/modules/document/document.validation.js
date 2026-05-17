"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentValidation = void 0;
const zod_1 = require("zod");
const createDocument = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ message: 'Title is required' }),
        content: zod_1.z.string({ message: 'Content is required' }),
        pinned: zod_1.z.boolean().optional(),
        wasRenamed: zod_1.z.boolean().optional(),
    }),
});
const updateDocument = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        pinned: zod_1.z.boolean().optional(),
        wasRenamed: zod_1.z.boolean().optional(),
    }),
});
exports.DocumentValidation = {
    createDocument,
    updateDocument,
};
