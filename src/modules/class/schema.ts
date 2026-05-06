import {number, z} from "zod"
import {DayOfWeek} from "@prisma/client";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM")

const classScheduleSchema = z.object({
    dayOfWeek: z.enum(DayOfWeek),
    startTime: timeSchema,
    endTime: timeSchema,
})

const classSchema = z.object({
    courseId: z.number(),
    teacherId: z.string(),
    studentIds: z.array(number()).min(1),
    meetLink: z.string().nullable().optional(),
    schedules: z.array(classScheduleSchema).min(1)
})

export const createClassesSchema = z.object({
    body: classSchema
})

export const updateClassesSchema = z.object({
    body: classSchema.partial(),
    params: z.object({
        id: z.string()
    })
})


export type ClassesRequestDto = z.infer<typeof classSchema>
