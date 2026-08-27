import {z} from "zod";
import {getCurrentISTTime, getTodayDateIST, isValidTimeFormat} from "../../utils/date";

export const timeSchema = z
    .string()
    .refine(isValidTimeFormat, {
        message: "Invalid time format. Use HH:MM in 24-hour format (e.g. 14:30)",
    });

export const classV2BodySchema = z
    .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
        studentId: z.number({message: "studentId is required"}).int().positive(),
        teacherId: z.number().int().positive().optional(),
        startTime: timeSchema,
        endTime: timeSchema,
        meetLink: z.string().url("Invalid URL for meetLink").nullable().optional(),
    })
    .refine((data) => {
        if (data.date) {
            return data.date === getTodayDateIST();
        }
        return true;
    }, {
        message: `Classes can only be scheduled for today in IST (${getTodayDateIST()})`,
        path: ["date"],
    })
    .refine((data) => data.endTime > data.startTime, {
        message: "endTime must be strictly after startTime",
        path: ["endTime"],
    })
    .refine((data) => data.endTime > getCurrentISTTime(), {
        message: "Cannot create a class in the past. The endTime has already passed for today in IST.",
        path: ["endTime"],
    });

export const createClassV2Schema = z.object({
    body: classV2BodySchema,
});

export const markAttendanceSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Class ID must be a number"),
    }),
    body: z.object({
        status: z.enum(["PRESENT", "ABSENT"]).optional(),
    })
});

export const getAttendanceSchema = z.object({
    query: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    }),
});

export const updateClassV2BodySchema = z
    .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
        studentId: z.number().int().positive().optional(),
        teacherId: z.number().int().positive().optional(),
        startTime: timeSchema.optional(),
        endTime: timeSchema.optional(),
        meetLink: z.string().url("Invalid URL for meetLink").nullable().optional(),
    })
    .refine((data) => {
        if (data.startTime && data.endTime) {
            return data.endTime > data.startTime;
        }
        return true;
    }, {
        message: "endTime must be strictly after startTime",
        path: ["endTime"],
    });

export const updateClassV2Schema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Class ID must be a number"),
    }),
    body: updateClassV2BodySchema,
});

export const deleteClassV2Schema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Class ID must be a number"),
    }),
});

export type CreateClassV2Dto = z.infer<typeof classV2BodySchema>;
export type UpdateClassV2Dto = z.infer<typeof updateClassV2BodySchema>;
export type MarkAttendanceDto = z.infer<typeof markAttendanceSchema>["body"];