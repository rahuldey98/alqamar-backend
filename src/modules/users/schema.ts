import {z} from "zod";
import {Gender, Status} from "@prisma/client";

const baseUserBody = z.object({
    name: z.string(),
    phone: z.string(),
    password: z.string().min(6).optional(),
    email: z.string().optional(),
    status: z.enum(Status).optional(),
    gender: z.enum(Gender).optional(),
    age: z.number().optional(),
});

const adminBodySchema = baseUserBody;

const teacherBodySchema = baseUserBody.extend({
    meetLink: z.string().optional(),
});

const studentBodySchema = baseUserBody.extend({
    feesDate: z.coerce.date().optional(),
    courseId: z.number().int().positive().optional(),
    classId: z.number().int().positive().optional(),
});

const userBodySchema = baseUserBody.extend({
    // TODO: remove once clients write meetLink via PATCH /users/teachers/:id only
    meetLink: z.string().optional(),
});

export const createAdminSchema = z.object({body: adminBodySchema});

export const createTeacherSchema = z.object({body: teacherBodySchema});
export const updateTeacherSchema = z.object({
    body: teacherBodySchema.partial(),
    params: z.object({id: z.string()}),
});

export const createStudentSchema = z.object({body: studentBodySchema});
export const updateStudentSchema = z.object({
    body: studentBodySchema.partial(),
    params: z.object({id: z.string()}),
});

export const updateUserSchema = z.object({
    body: userBodySchema.partial(),
    params: z.object({id: z.string()}),
});
export const updateCurrentUserSchema = z.object({body: userBodySchema.partial()});

export const limitQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
});
export const limitQueryRequestSchema = z.object({query: limitQuerySchema});

export type AdminRequestDto = z.infer<typeof adminBodySchema>;
export type TeacherRequestDto = z.infer<typeof teacherBodySchema>;
export type StudentRequestDto = z.infer<typeof studentBodySchema>;
export type UserRequestDto = z.infer<typeof userBodySchema>;
