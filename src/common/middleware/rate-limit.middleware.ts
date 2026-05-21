import {rateLimit} from "express-rate-limit";
import {AppError} from "../app-error";

const minutes = (n: number) => n * 60 * 1000;

export const apiRateLimiter = rateLimit({
    windowMs: minutes(15),
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError("Too many requests, please try again later", 429));
    },
});

export const authRateLimiter = rateLimit({
    windowMs: minutes(15),
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res, next) => {
        next(new AppError("Too many login attempts, please try again later", 429));
    },
});
