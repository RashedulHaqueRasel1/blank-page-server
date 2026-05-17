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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const auth = (...requiredRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = req.headers.authorization;
        if (!token) {
            throw new ApiError_1.default(401, 'You are not authorized');
        }
        // Handle standard "Bearer <token>" prefix
        if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
            token = token.slice(7);
        }
        console.log('DEBUG: JWT_SECRET in auth:', config_1.default.jwt_secret);
        console.log('DEBUG: Token in auth:', token);
        const verifiedUser = jsonwebtoken_1.default.verify(token, config_1.default.jwt_secret);
        if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
            throw new ApiError_1.default(403, 'Forbidden');
        }
        req.user = verifiedUser;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = auth;
