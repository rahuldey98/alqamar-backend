import jwt from "jsonwebtoken";
import {AppError} from "../common/app-error";
import type {JwtPayload} from "../common/auth-request";

const jwtSecret = process.env.JWT_SECRET ?? "abc";

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, jwtSecret) as JwtPayload;
};

export const generateToken = (payload: JwtPayload): string => {
    if (!jwtSecret) {
        throw new AppError("Invalid JWT Secret", 500);
    }

    return jwt.sign(payload, jwtSecret);
};
