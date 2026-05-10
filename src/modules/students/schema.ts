import {z} from "zod";
import {Gender, Status} from "@prisma/client";

const studentBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional(),
    feesDate: z.coerce.date().optional(),
    courseId: z.number().int().positive().optional(),
    classId: z.number().int().positive().optional(),
})

export const createStudentSchema = z.object({
    body: studentBodySchema,
});

export const updateStudentSchema = z.object({
    body: studentBodySchema.partial(),
    params: z.object({
        id: z.string(),
    }),
});

export const getStudentsQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getStudentsQueryRequestSchema = z.object({
    query: getStudentsQuerySchema,
});

export type StudentRequestDto = z.infer<typeof studentBodySchema>
