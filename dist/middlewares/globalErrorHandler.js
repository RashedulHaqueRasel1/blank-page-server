"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const client_1 = require("../generated/client");
const globalErrorHandler = (err, req, res, next) => {
    var _a;
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorMessages = [];
    if (err instanceof ApiError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
        errorMessages = [
            {
                path: '',
                message: err.message,
            },
        ];
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        errorMessages = err.issues.map((issue) => ({
            path: String(issue.path[issue.path.length - 1]),
            message: issue.message,
        }));
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handling Prisma specific known request errors (like P2002 Unique Constraint violation)
        if (err.code === 'P2002') {
            statusCode = 409;
            message = 'Conflict Error';
            const target = (_a = err.meta) === null || _a === void 0 ? void 0 : _a.target;
            errorMessages = [
                {
                    path: typeof target === 'string' ? target : 'database',
                    message: `${target || 'Unique constraint'} already exists.`,
                },
            ];
        }
        else {
            statusCode = 400;
            message = err.message;
            errorMessages = [
                {
                    path: '',
                    message: err.message,
                },
            ];
        }
    }
    else if (err instanceof Error) {
        message = err.message;
        errorMessages = [
            {
                path: '',
                message: err.message,
            },
        ];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: process.env.NODE_ENV === 'development' ? err === null || err === void 0 ? void 0 : err.stack : undefined,
    });
};
exports.default = globalErrorHandler;
