import {DayOfWeek, Status, UserRole} from "@prisma/client";
import {ClassesRequestDto} from "./schema";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {publicUserSelect} from "../../common/public-user";

const createClasses = async (data: ClassesRequestDto) => {
    return prisma.class.create({
        data: {
            courseId: data.courseId,
            teacherId: data.teacherId,
            meetLink: data.meetLink,
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

const getClasses = (userId: number, role: UserRole) => {
    if (role === UserRole.ADMIN) {
        return prisma.class.findMany();
    }

    const where = role === UserRole.TEACHER
        ? {teacherId: userId}
        : {students: {some: {studentId: userId}}};

    return prisma.class.findMany({
        where,
        include: {
            students: true,
            schedules: true
        }
    });
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
            meetLink: data.meetLink,

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

const getCurrentDayOfWeek = (): DayOfWeek => {
    const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
    }).format(new Date()).toUpperCase();

    return DayOfWeek[dayName as keyof typeof DayOfWeek];
};

const getSchedules = async (userId: number, role: UserRole) => {
    const classes = await prisma.class.findMany({
        where: {
            status: Status.ACTIVE,
            ...(role === UserRole.TEACHER
                ? {teacherId: userId}
                : {students: {some: {studentId: userId}}})
        },
        include: {
            course: true,
            teacher: {
                select: publicUserSelect
            },
            schedules: {
                where: {
                    status: Status.ACTIVE
                }
            }
        }
    });

    const allSchedules = classes.flatMap(({schedules, ...cls}) =>
        schedules.map(schedule => ({
                ...schedule,
                classId: cls.id,
                course: cls.course,
                teacherName: cls.teacher.name,
                meetLink: cls.meetLink,
            })
        )
    )

    const groupedScheduleMap = new Map<DayOfWeek, typeof allSchedules>();
    for (const schedule of allSchedules) {
        const group = groupedScheduleMap.get(schedule.dayOfWeek) ?? []
        group.push(schedule)
        groupedScheduleMap.set(schedule.dayOfWeek, group)
    }

    return Array.from(groupedScheduleMap, ([dayOfWeek, schedules]) => ({
        dayOfWeek,
        schedules
    }))
}

const getTodayClasses = async (userId: number, role: UserRole) => {
    const today = getCurrentDayOfWeek();

    const classes = await prisma.class.findMany({
        where: {
            status: Status.ACTIVE,
            ...(role === UserRole.TEACHER
                ? {teacherId: userId}
                : {students: {some: {studentId: userId}}})
        },
        include: {
            course: true,
            teacher: {
                select: publicUserSelect
            },
            students: {
                include: {
                    student: {
                        select: publicUserSelect
                    }
                }
            },
            schedules: {
                where: {
                    status: Status.ACTIVE,
                    dayOfWeek: today
                },
                orderBy: {
                    startTime: "asc"
                }
            }
        }
    });

    return classes
        .flatMap(cls =>
            cls.schedules.map(schedule => {
                return {
                    ...schedule,
                    course: cls.course,
                    teacherName: cls.teacher.name,
                    meetLink: cls.meetLink,
                };
            })
        )
        .sort((firstClass, secondClass) => {
            return firstClass.startTime.localeCompare(secondClass.startTime);
        });
}

export const ClassService = {
    createClasses,
    getClasses,
    updateClasses,
    getClassesById,
    getSchedules,
    getTodayClasses
}
