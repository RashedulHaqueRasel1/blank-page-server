"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const app = (0, express_1.default)();
// Parsers
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Application routes
app.use('/api/v1', routes_1.default);
// Testing route (as requested by user)
app.get('/', (req, res) => {
    res.send('blank page server runing susseefully');
});
// Global error handler
app.use(globalErrorHandler_1.default);
// Not Found handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Not Found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'API Not Found',
            },
        ],
    });
});
exports.default = app;
