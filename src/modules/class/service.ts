import {DayOfWeek, Prisma, Status, UserRole} from "@prisma/client";
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

const dayOfWeekOrder: Record<DayOfWeek, number> = {
    [DayOfWeek.SUNDAY]: 0,
    [DayOfWeek.MONDAY]: 1,
    [DayOfWeek.TUESDAY]: 2,
    [DayOfWeek.WEDNESDAY]: 3,
    [DayOfWeek.THURSDAY]: 4,
    [DayOfWeek.FRIDAY]: 5,
    [DayOfWeek.SATURDAY]: 6,
};

const ensureStudentsAreActive = async (
    tx: Prisma.TransactionClient,
    studentIds: number[],
) => {
    const inactiveStudents = await tx.student.findMany({
        where: {
            userId: {in: studentIds},
            user: {status: Status.INACTIVE},
        },
        select: {userId: true},
    });

    if (inactiveStudents.length > 0) {
        throw new AppError(
            `Inactive students cannot be assigned to active classes: ${inactiveStudents.map(s => s.userId).join(", ")}`,
            400,
        );
    }
};

const createClasses = async (data: ClassesRequestDto) => {
    return prisma.$transaction(async (tx) => {
        await ensureStudentsAreActive(tx, data.studentIds);

        const conflicting = await tx.student.findMany({
            where: {
                userId: {in: data.studentIds},
                classId: {not: null},
                class: {status: Status.ACTIVE},
            },
            select: {userId: true, classId: true},
        });
        if (conflicting.length > 0) {
            const conflictingClassIds = [...new Set(conflicting.map(student => student.classId).filter((classId): classId is number => classId !== null))];

            if (conflictingClassIds.length !== 1) {
                throw new AppError(
                    `Students already assigned to an active class: ${conflicting.map(s => s.userId).join(", ")}`,
                    400,
                );
            }

            const [targetClassId] = conflictingClassIds;
            const incomingDays = data.schedules.map(schedule => schedule.dayOfWeek);
            const existingClass = await tx.class.findFirst({
                where: {
                    id: targetClassId,
                    status: Status.ACTIVE,
                },
                include: {schedules: true},
            });

            if (!existingClass) {
                throw new AppError("No active class found for conflicting students", 400);
            }

            await tx.classSchedule.deleteMany({
                where: {
                    classId: targetClassId,
                    dayOfWeek: {in: incomingDays},
                },
            });

            await tx.classSchedule.createMany({
                data: data.schedules.map(schedule => ({
                    classId: targetClassId,
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                })),
            });

            return tx.class.findUnique({
                where: {id: targetClassId},
                include: {
                    schedules: true,
                    ...studentInclude,
                },
            });
        }

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
        // exclude orphaned classes that have no students; they crash the client
        return prisma.class.findMany({where: {students: {some: {}}}});
    }

    const where = role === UserRole.TEACHER
        ? {teacher: {userId}, students: {some: {}}}
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
            await ensureStudentsAreActive(tx, data.studentIds);

            const conflicting = await tx.student.findMany({
                where: {
                    userId: {in: data.studentIds},
                    AND: [{classId: {not: null}}, {classId: {not: id}}],
                    class: {status: Status.ACTIVE},
                },
                select: {userId: true, classId: true},
            });
            if (conflicting.length > 0) {
                throw new AppError(
                    `Students already assigned to an active class: ${conflicting.map(s => s.userId).join(", ")}`,
                    400,
                );
            }

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
            students: {
                some: role === UserRole.STUDENT ? {userId} : {},
                none: {user: {status: Status.INACTIVE}},
            },
            ...(role === UserRole.TEACHER
                ? {teacher: {userId}}
                : {}),
        },
        include: {
            ...teacherInclude,
            ...studentInclude,
            schedules: {
                where: {status: Status.ACTIVE},
                orderBy: {startTime: "asc"},
            },
        },
        orderBy: {id: "asc"},
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
    })).sort((firstDay, secondDay) => {
        return dayOfWeekOrder[firstDay.dayOfWeek] - dayOfWeekOrder[secondDay.dayOfWeek];
    })
}

const getTodayClasses = async (userId: number, role: UserRole) => {
    const today = getCurrentDayOfWeek();

    const classes = await prisma.class.findMany({
        where: {
            status: Status.ACTIVE,
            students: {
                some: role === UserRole.STUDENT ? {userId} : {},
                none: {user: {status: Status.INACTIVE}},
            },
            ...(role === UserRole.TEACHER
                ? {teacher: {userId}}
                : {}),
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
            students: {some: {}},
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
