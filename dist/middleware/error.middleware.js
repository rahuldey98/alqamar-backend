"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_error_1 = require("../utils/app-error");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = undefined;
    if (err instanceof app_error_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errors = err.issues.reduce((acc, issue) => {
            const fieldName = issue.path.join(".");
            acc[fieldName] = `${fieldName}, ${issue.message}`;
            return acc;
        }, {});
    }
    const response = {
        status: "error",
        message,
        errors,
        stack: err.stack
    };
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map