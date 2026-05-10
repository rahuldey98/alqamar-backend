import {z} from "zod";
import {Gender, Status} from "@prisma/client";

const adminBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional(),
})

export const createAdminSchema = z.object({
    body: adminBodySchema,
});

export type AdminRequestDto = z.infer<typeof adminBodySchema>
