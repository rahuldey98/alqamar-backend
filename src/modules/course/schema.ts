import {number, z} from "zod"


const courseSchema = z.object({
    title: z.string(),
    enTitle: z.string().nullable(),
    durationMonths: number()
})

export const createCourseSchema = z.object({
    body: courseSchema
})

export const updateCourseSchema = z.object({
    body: courseSchema.partial(),
    params: z.object({
        id: z.number()
    })
})

export type CourseRequestDto = z.infer<typeof courseSchema>