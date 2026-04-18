import {ClassesRequestDto} from "./schema";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";

const createClasses = async (data: ClassesRequestDto) => {
    return prisma.class.create({
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
    });
}

const getClasses = () => {
    return prisma.class.findMany();
}

const getClassesById = async (id: number) => {
    const classes = await prisma.class.findUnique({
        where: {id: id},
        include: {
            schedules: true,
            students: true
        }
    });
    if (!classes) {
        throw new AppError("No Class found", 400);
    }
    return classes
}

const updateClasses = async (id: number, data: Partial<ClassesRequestDto>) => {
    return prisma.class.update({
        where: {id: id},
        data: {
            courseId: data.courseId,
            teacherId: data.teacherId,
            meetLink: data.meetingLink,

            schedules: data.schedules ? {
                deleteMany: {},
                create: data.schedules.map(schedule => ({
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime
                }))
            } : undefined,

            students: data.studentIds ? {
                deleteMany: {},
                create: data.studentIds.map((id) => ({
                    studentId: id
                }))
            } : undefined
        },
        include: {
            schedules: true,
            students: true
        }
    })
}

export const ClassService = {
    createClasses,
    getClasses,
    updateClasses,
    getClassesById
}