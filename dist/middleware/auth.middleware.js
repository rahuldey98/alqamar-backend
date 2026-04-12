"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const app_error_1 = require("../utils/app-error");
const auth_service_1 = require("../services/auth.service");
const authUser = (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        throw new app_error_1.AppError("No authorization header provided", 401);
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
        throw new app_error_1.AppError("Invalid authorization format", 401);
    }
    req.user = auth_service_1.AuthService.verifyToken(token);
    next();
};
exports.authUser = authUser;
//# sourceMappingURL=auth.middleware.js.map