import {z} from "zod";
import {UserRole, Status, Gender} from "@prisma/client";

const userBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    role: z.enum(UserRole),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional()
})

export const createUserSchema = z.object({
    body: userBodySchema
});

export const updateUserSchema = z.object({
    body: userBodySchema.partial(),
    params: z.object({
        id: z.string(),
    }),
});

export const getStudentsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getStudentsSchema = z.object({
    query: getStudentsQuerySchema,
});

export type UserRequestDto = z.infer<typeof userBodySchema>
