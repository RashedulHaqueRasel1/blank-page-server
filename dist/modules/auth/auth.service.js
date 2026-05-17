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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const hashHelper_1 = require("../../utils/hashHelper");
const jwtHelper_1 = require("../../utils/jwtHelper");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (isExist) {
        throw new ApiError_1.default(400, 'User already exists with this email');
    }
    // Hash password
    payload.password = yield hashHelper_1.hashHelper.hashPassword(payload.password);
    const newUser = yield prisma_1.default.user.create({
        data: payload,
    });
    const { password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
    return userWithoutPassword;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, 'User not found');
    }
    // Verify password
    const isPasswordMatch = yield hashHelper_1.hashHelper.comparePassword(payload.password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError_1.default(401, 'Invalid password');
    }
    const now = new Date();
    const updateData = {
        lastLogin: now,
        loginCount: { increment: 1 },
    };
    if (!user.firstLogin) {
        updateData.firstLogin = now;
    }
    // Update user login metrics in the database
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: user.id },
        data: updateData,
    });
    // Generate tokens
    const token = jwtHelper_1.jwtHelper.generateToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }, config_1.default.jwt_secret, '30d' // Token valid for 30 days
    );
    return {
        token,
        user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
        },
    };
});
const getProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, 'User not found');
    }
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return userWithoutPassword;
});
exports.AuthService = {
    registerUser,
    loginUser,
    getProfile,
};
