"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app_error_1 = require("../utils/app-error");
const user_service_1 = require("./user.service");
const JWT_SECRET = process.env.JWT_SECRET || "abc";
const SALT_RADIUS = 10;
const login = async (user) => {
    const dbUser = await user_service_1.UserService.getUserByPhoneInternal(user.phone);
    if (!dbUser) {
        throw new app_error_1.AppError("No user found", 400);
    }
    const isValidPassword = await verifyPassword(user.password, dbUser.password);
    if (!isValidPassword) {
        throw new app_error_1.AppError("Invalid password", 401);
    }
    const accessToken = generateToken({ userId: dbUser.id.toString(), role: dbUser.role });
    return {
        user: user_service_1.UserService.mapUserToUserResponseDto(dbUser),
        accessToken
    };
};
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
const generateToken = (jwtPayload) => {
    if (!JWT_SECRET) {
        throw new app_error_1.AppError("Invalid JWT Secret", 500);
    }
    return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET);
};
const hashPassword = async (password) => {
    return await bcrypt_1.default.hash(password, SALT_RADIUS);
};
const verifyPassword = async (password, passwordHash) => {
    return await bcrypt_1.default.compare(password, passwordHash);
};
exports.AuthService = {
    login,
    verifyToken,
    hashPassword
};
//# sourceMappingURL=auth.service.js.map