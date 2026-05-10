import jwt from "jsonwebtoken";
import type {JwtPayload} from "../common/auth-request";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
}

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, jwtSecret) as JwtPayload;
};

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, jwtSecret);
};
