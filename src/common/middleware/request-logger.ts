import {NextFunction, Request, Response} from "express";
import {logger} from "../logger";
import type {AuthRequest} from "../auth-request";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()

    res.on("finish", () => {
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            userId: (req as AuthRequest).user?.userId,
            duration: Date.now() - startTime,
            userAgent: req.get("user-agent"),
            ip: req.ip,
            query: Object.keys(req.query).length ? req.query : undefined,
            body: Object.keys(req.body || {}).length ? req.body : undefined,
        }

        if (res.statusCode >= 400) {
            logger.error("Request failed", logData);
        } else {
            logger.info("Request completed", logData);
        }
    })

    next()
}