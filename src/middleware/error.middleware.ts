import {ErrorRequestHandler} from "express";
import {AppError} from "../utils/app-error";
import {ZodError} from "zod";
import { ApiErrorResponse } from "@rahuldey98/alqamar-models";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors: Record<string, string> | undefined = undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    } else if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errors = err.issues.reduce<Record<string, string>>((acc, issue) => {
            const fieldName = issue.path.join(".");
            acc[fieldName] = `${fieldName}, ${issue.message}`;
            return acc;
        }, {});
    }

    const response: ApiErrorResponse = {
        status: "error",
        message,
        errors,
        stack: err.stack
    };

    res.status(statusCode).json(response);
}
