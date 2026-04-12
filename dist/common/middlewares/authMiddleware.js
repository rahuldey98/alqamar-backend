"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        return res.status(401)
            .json({ error: "No authorization header provided" });
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
        return res.status(401)
            .json({ error: "Invalid authorization format" });
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, '');
        next();
    }
    catch {
    }
};
exports.authMiddleware = authMiddleware;
