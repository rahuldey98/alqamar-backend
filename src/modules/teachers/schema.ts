import {z} from "zod";
import {Gender, Status} from "@prisma/client";

const teacherBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional(),
    meetLink: z.string().optional(),
})

export const createTeacherSchema = z.object({
    body: teacherBodySchema,
});

export const updateTeacherSchema = z.object({
    body: teacherBodySchema.partial(),
    params: z.object({
        id: z.string(),
    }),
});

export const getTeachersQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getTeachersQueryRequestSchema = z.object({
    query: getTeachersQuerySchema,
});

export type TeacherRequestDto = z.infer<typeof teacherBodySchema>
