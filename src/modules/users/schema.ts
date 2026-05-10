import {z} from "zod";
import {Gender, Status, UserRole} from "@prisma/client";

const userBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    role: z.enum(UserRole),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional(),
    meetLink: z.string().optional(),
    feesDate: z.coerce.date().optional(),
    courseId: z.number().int().positive().optional(),
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

export const updateCurrentUserSchema = z.object({
    body: userBodySchema.partial(),
});

export const getUsersQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getUsersQueryRequestSchema = z.object({
    query: getUsersQuerySchema,
});

export type UserRequestDto = z.infer<typeof userBodySchema>
