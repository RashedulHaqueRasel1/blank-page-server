"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    ip_geolocation_api_url: process.env.IP_GEOLOCATION_API_URL,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: Number(process.env.SMTP_PORT) || 587,
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS,
    smtp_from_name: process.env.SMTP_FROM_NAME || 'Blank Page',
    smtp_from_email: process.env.SMTP_FROM_EMAIL,
    server_url: process.env.SERVER_URL || 'http://localhost:5000',
};
