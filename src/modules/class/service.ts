import {DayOfWeek, Status, UserRole} from "@prisma/client";
import {ClassesRequestDto} from "./schema";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {publicUserSelect} from "../../common/public-user";
import {getCurrentDayOfWeek, getDayOfWeekFromDate} from "../../utils/date";

export enum ClassAttendanceStatus {
    NOT_PRESENT = "not present",
    TEACHER_PRESENT = "teacher present",
    STUDENT_PRESENT = "student present",
    ALL_PRESENT = "all present",
}

const resolveStatus = (teacherPresent: boolean, studentPresent: boolean): ClassAttendanceStatus => {
    if (teacherPresent && studentPresent) return ClassAttendanceStatus.ALL_PRESENT;
    if (teacherPresent) return ClassAttendanceStatus.TEACHER_PRESENT;
    if (studentPresent) return ClassAttendanceStatus.STUDENT_PRESENT;
    return ClassAttendanceStatus.NOT_PRESENT;
};

const teacherInclude = {
    teacher: {include: {user: {select: publicUserSelect}}},
} as const;

const studentInclude = {
    students: {
        include: {
            user: {select: publicUserSelect},
            course: {select: {id: true, title: true, enTitle: true}},
        },
    },
} as const;

const createClasses = async (data: ClassesRequestDto) => {
    return prisma.$transaction(async (tx) => {
        const created = await tx.class.create({
            data: {
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
            course: cls.students[0]?.course ?? null,
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
                    course: cls.students[0]?.course ?? null,
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

const getClassAttendance = async (date: string) => {
    const dayOfWeek = getDayOfWeekFromDate(date);

    const classes = await prisma.class.findMany({
        where: {
            status: Status.ACTIVE,
            schedules: {some: {status: Status.ACTIVE, dayOfWeek}},
        },
        include: {
            teacher: {include: {user: {select: {id: true, name: true}}}},
            students: {
                include: {
                    user: {select: {id: true, name: true}},
                    course: {select: {title: true, enTitle: true}},
                },
                orderBy: {userId: "asc"},
            },
            // date is a timestamp string ("2026-06-10 05:00:14.987"); match by day prefix
            attendances: {where: {date: {startsWith: date}}},
            schedules: {
                where: {status: Status.ACTIVE, dayOfWeek},
                orderBy: {startTime: "asc"},
                select: {startTime: true, endTime: true},
            },
        },
        orderBy: {id: "asc"},
    });

    return classes.map(cls => {
        const firstStudent = cls.students[0];
        const schedule = cls.schedules[0];
        const teacherPresent = cls.attendances.some(a => a.userId === cls.teacherId);
        const studentPresent = !!firstStudent && cls.attendances.some(a => a.userId === firstStudent.userId);
        return {
            classId: cls.id,
            className: firstStudent?.course?.title ?? null,
            teacherName: cls.teacher.user.name,
            studentName: firstStudent?.user.name ?? null,
            date,
            startTime: schedule?.startTime ?? null,
            endTime: schedule?.endTime ?? null,
            attendanceStatus: resolveStatus(teacherPresent, studentPresent),
        };
    });
};

export const ClassService = {
    createClasses,
    getClasses,
    updateClasses,
    getClassesById,
    getSchedules,
    getTodayClasses,
    getClassAttendance
}
