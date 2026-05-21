import {NextFunction, Request, Response} from "express";
import {logger} from "../logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()

    res.on("finish", () => {
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: Date.now() - startTime,
            userAgent: req.get("user-agent"),
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