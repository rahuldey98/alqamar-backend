import {DayOfWeek, Status, UserRole} from "@prisma/client";
import {ClassesRequestDto} from "./schema";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {publicUserSelect} from "../../common/public-user";
import {getCurrentDayOfWeek} from "../../utils/date";

const teacherInclude = {
    teacher: {include: {user: {select: publicUserSelect}}},
} as const;

const studentInclude = {
    students: {include: {user: {select: publicUserSelect}}},
} as const;

const createClasses = async (data: ClassesRequestDto) => {
    return prisma.$transaction(async (tx) => {
        const created = await tx.class.create({
            data: {
                courseId: data.courseId,
                teacherId: Number(data.teacherId),
                meetLink: data.meetLink,
                schedules: {
                    create: data.schedules.map(schedule => ({
                        dayOfWeek: schedule.dayOfWeek,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                    })),
                },
            },
            include: {schedules: true},
        });

        await tx.student.updateMany({
            where: {userId: {in: data.studentIds}},
            data: {classId: created.id},
        });

        return tx.class.findUnique({
            where: {id: created.id},
            include: {
                schedules: true,
                ...studentInclude,
            },
        });
    });
}

const getClasses = (userId: number, role: UserRole) => {
    if (role === UserRole.ADMIN) {
        return prisma.class.findMany();
    }

    const where = role === UserRole.TEACHER
        ? {teacher: {userId}}
        : {students: {some: {userId}}};

    return prisma.class.findMany({
        where,
        include: {
            ...teacherInclude,
            ...studentInclude,
            schedules: true,
        },
    });
}

const getClassesById = async (id: number) => {
    const classes = await prisma.class.findUnique({
        where: {id: id},
        include: {
            ...teacherInclude,
            schedules: true,
            ...studentInclude,
        },
    });
    if (!classes) {
        throw new AppError("No Class found", 400);
    }
    return classes
}

const updateClasses = async (id: number, data: Partial<ClassesRequestDto>) => {
    return prisma.$transaction(async (tx) => {
        const updated = await tx.class.update({
            where: {id: id},
            data: {
                ...(data.courseId !== undefined && {courseId: data.courseId}),
                ...(data.teacherId !== undefined && {teacherId: Number(data.teacherId)}),
                ...(data.meetLink !== undefined && {meetLink: data.meetLink}),

                schedules: data.schedules ? {
                    deleteMany: {},
                    create: data.schedules.map(schedule => ({
                        dayOfWeek: schedule.dayOfWeek,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                    })),
                } : undefined,
            },
            include: {schedules: true},
        });

        if (data.studentIds) {
            await tx.student.updateMany({
                where: {classId: id},
                data: {classId: null},
            });
            await tx.student.updateMany({
                where: {userId: {in: data.studentIds}},
                data: {classId: id},
            });
        }

        return tx.class.findUnique({
            where: {id: updated.id},
            include: {
                schedules: true,
                ...studentInclude,
            },
        });
    });
}

const getSchedules = async (userId: number, role: UserRole) => {
    const classes = await prisma.class.findMany({
        where: {
            status: Status.ACTIVE,
            ...(role === UserRole.TEACHER
                ? {teacher: {userId}}
                : {students: {some: {userId}}}),
        },
        include: {
            course: true,
            ...teacherInclude,
            ...studentInclude,
            schedules: {
                where: {status: Status.ACTIVE},
            },
        },
    });

    const allSchedules = classes.flatMap(({schedules, ...cls}) =>
        schedules.map(schedule => ({
            ...schedule,
            classId: cls.id,
            course: cls.course,
            teacherName: cls.teacher.user.name,
            studentNames: cls.students.map((student) => student.user.name),
            meetLink: cls.teacher.meetLink,
        }))
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
                ? {teacher: {userId}}
                : {students: {some: {userId}}}),
        },
        include: {
            course: true,
            ...teacherInclude,
            ...studentInclude,
            schedules: {
                where: {
                    status: Status.ACTIVE,
                    dayOfWeek: today,
                },
                orderBy: {startTime: "asc"},
            },
        },
    });

    return classes
        .flatMap(cls =>
            cls.schedules.map(schedule => {
                return {
                    ...schedule,
                    course: cls.course,
                    teacherName: cls.teacher.user.name,
                    studentNames: cls.students.map((student) => student.user.name),
                    meetLink: cls.teacher.meetLink,
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
