"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        phone: zod_1.z.string(),
        role: zod_1.z.enum(client_1.UserRole),
        password: zod_1.z.string().min(6).optional(),
        email: zod_1.z.string().optional(),
        status: zod_1.z.enum(client_1.UserStatus).optional()
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(client_1.UserRole).optional(),
        password: zod_1.z.string().min(6).optional(),
        email: zod_1.z.string().optional(),
        status: zod_1.z.enum(client_1.UserStatus).optional()
    }),
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
//# sourceMappingURL=user.validator.js.map