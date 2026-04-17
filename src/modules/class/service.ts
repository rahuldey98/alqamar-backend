import {ClassesPostRequestDto} from "./schema";
import {prisma} from "../../db/prisma";

const createClasses = async (data: ClassesPostRequestDto) => {
    const newClass = await prisma.class.create({
        data: {
            courseId: data.courseId,
            teacherId: data.teacherId,
            meetLink: data.meetingLink,
            schedules: {
                create: data.schedules.map(schedule => ({
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime
                }))
            },
            students: {
                create: data.studentIds.map((id) => ({
                    studentId: id
                }))
            }
        },
        include: {
            schedules: true,
            students: true
        }
    })
    return newClass
}

export const classService = {
    createClasses
}