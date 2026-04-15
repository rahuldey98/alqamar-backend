import type {NextFunction, Response} from "express";
import {verifyToken} from "../../utils/jwt";
import {AppError} from "../app-error";
import type {AuthRequest} from "../auth-request";

export const authUser = (req: AuthRequest, res: Response, next: NextFunction) => {
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
