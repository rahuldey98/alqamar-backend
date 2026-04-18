import type {NextFunction, Response} from "express";
import type {UserRole} from "@prisma/client";
import {verifyToken} from "../../utils/jwt";
import {AppError} from "../app-error";
import type {AuthRequest} from "../auth-request";

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        throw new AppError("No authorization header provided", 401);
    }
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
        throw new AppError("Invalid authorization format", 401);
    }

    req.user = verifyToken(token);
    next();
};

export const requireRole = (...allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const currentUserRole = req.user?.role;

        if (!req.user || !currentUserRole) {
            throw new AppError("Unauthorized", 401);
        }

        if (!allowedRoles.includes(currentUserRole)) {
            throw new AppError("Forbidden: insufficient role permissions", 403);
        }

        next();
    };
};
