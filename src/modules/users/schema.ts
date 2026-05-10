import {z} from "zod";
import {Gender, Status} from "@prisma/client";

const userBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional(),
    // TODO: remove once clients write meetLink via PATCH /users/teachers/:id only
    meetLink: z.string().optional(),
})

export const updateUserSchema = z.object({
    body: userBodySchema.partial(),
    params: z.object({
        id: z.string(),
    }),
});

export const updateCurrentUserSchema = z.object({
    body: userBodySchema.partial(),
});

export type UserRequestDto = z.infer<typeof userBodySchema>
