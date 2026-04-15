import {Request} from "express";

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export interface JwtPayload {
    userId: string;
    role: string;
}