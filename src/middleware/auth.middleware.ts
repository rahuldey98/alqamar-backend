import {NextFunction, Response} from "express";
import {AppError} from "../utils/app-error";
import {AuthRequest} from "../types/auth.type";
import {AuthService} from "../services/auth.service";

export const authUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req?.headers?.authorization
    if (!authHeader) {
        throw new AppError("No authorization header provided", 401)
    }
    const [type, token] = authHeader.split(' ')
    if (type !== 'Bearer') {
        throw new AppError("Invalid authorization format", 401)
    }

    req.user = AuthService.verifyToken(token)
    next()
}