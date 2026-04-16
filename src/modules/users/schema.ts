import {z} from "zod";
import {UserRole, Status} from "@prisma/client";

export const createUserSchema = z.object({
    body: z.object({
        name: z.string(),
        phone: z.string(),
        role: z.enum(UserRole),
        password: z.string().min(6).optional(),
        email: z.string().optional(),
        status: z.enum(Status).optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        role: z.enum(UserRole).optional(),
        password: z.string().min(6).optional(),
        email: z.string().optional(),
        status: z.enum(Status).optional(),
    }),
    params: z.object({
        id: z.string(),
    }),
});
