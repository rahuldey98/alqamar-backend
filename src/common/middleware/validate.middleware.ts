import type {NextFunction, Request, Response} from "express";
import {ZodObject} from "zod";

export const validateRequest = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
        });
        next();
    };
};
