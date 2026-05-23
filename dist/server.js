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
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const openapi_1 = __importDefault(require("./openapi"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Generate OpenAPI docs
            yield (0, openapi_1.default)();
            yield prisma_1.default.$connect();
            console.log('🗄️  Database connected successfully');
            const server = http_1.default.createServer(app_1.default);
            (0, socket_1.initSocket)(server);
            server.listen(config_1.default.port, () => {
                console.log(`🚀 Server is running on port ${config_1.default.port}`);
                console.log(`📄 API Reference docs available at /docs`);
            });
        }
        catch (error) {
            console.error('Failed to connect to database or start server', error);
        }
    });
}
main();
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    prisma_1.default.$disconnect();
});
