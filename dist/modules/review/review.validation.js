"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidation = void 0;
const zod_1 = require("zod");
const createReview = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Name is required' }),
        email: zod_1.z
            .string({ message: 'Email is required' })
            .email('Invalid email address'),
        rating: zod_1.z
            .number({ message: 'Rating is required' })
            .int()
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        comment: zod_1.z.string({ message: 'Comment is required' }),
    }),
});
exports.ReviewValidation = {
    createReview,
};
