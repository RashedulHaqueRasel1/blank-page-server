"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const register = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ message: 'Email is required' })
            .email('Invalid email address'),
        password: zod_1.z
            .string({ message: 'Password is required' })
            .min(6, 'Password must be at least 6 characters long'),
        role: zod_1.z
            .string({ message: 'Role is required' })
            .optional(),
    }),
});
const login = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ message: 'Email is required' })
            .email('Invalid email address'),
        password: zod_1.z
            .string({ message: 'Password is required' }),
    }),
});
exports.AuthValidation = {
    register,
    login,
};
