"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return (req, res, next) => {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers
        });
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.middleware.js.map