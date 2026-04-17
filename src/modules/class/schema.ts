import { number, z } from "zod"
import { DayOfWeek } from "@prisma/client";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM")

const classScheduleSchema = z.object({
    dayOfWeek: z.enum(DayOfWeek),
    startTime: timeSchema,
    endTime: timeSchema,
})

export const createClassesSchema = z.object({
    body: z.object({
        courseId: z.number(),
        teacherId: z.number(),
        studentIds: z.array(number()).min(1),
        meetingLink: z.string().nullable().optional(),
        schedules: z.array(classScheduleSchema).min(1)
    })
})


export type ClassesPostRequestDto = z.infer<typeof createClassesSchema>["body"]
