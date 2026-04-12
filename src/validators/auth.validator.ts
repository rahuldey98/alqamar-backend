import {z} from "zod"

export const loginSchema = z.object({
    body: z.object({
        phone: z.string(),
        password: z.string().min(6),
    }),
});