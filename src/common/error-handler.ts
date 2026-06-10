import {ErrorRequestHandler} from "express";
import {AppError} from "./app-error";
import {ZodError} from "zod";
import {Prisma} from "@prisma/client";

interface ApiErrorResponse {
    status: "error";
    message: string;
    errors?: Record<string, string>;
    stack?: string;
}

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
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = 409;
            const target = (err.meta?.target as string[])?.join(", ") || "field";
            message = `Unique constraint failed: a record with this ${target} already exists.`;
        } else if (err.code === "P2025") {
            statusCode = 404;
            message = "Record to update or delete not found";
        }
    }

    const response: ApiErrorResponse = {
        status: "error",
        message,
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };

    res.status(statusCode).json(response);
};
