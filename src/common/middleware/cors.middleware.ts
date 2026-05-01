import type {NextFunction, Request, Response} from "express";

const allowedOrigins = new Set([
    "https://app.alqamarquraanacademy.com",
    "https://admin.alqamarquraanacademy.com",
]);

export const allowAccessControl = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
};
