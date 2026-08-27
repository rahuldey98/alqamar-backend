import {ClassAttendanceStatus, Prisma, Status, UserRole} from "@prisma/client";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {publicUserSelect} from "../../common/public-user";
import {getCurrentISTTime, getTodayDateIST} from "../../utils/date";
import {CreateClassV2Dto, MarkAttendanceDto, UpdateClassV2Dto} from "./schema";

const studentSelect = {
    include: {
        user: {select: publicUserSelect},
        course: {select: {id: true, title: true, enTitle: true}},
    },
} as const;

const teacherSelect = {
    include: {
        user: {select: publicUserSelect},
    },
} as const;

/**
 * 1. Create a daily ad-hoc class for today in IST
 */
const createClass = async (teacherId: number, data: CreateClassV2Dto) => {
    const targetDate = data.date ?? getTodayDateIST();
    const effectiveTeacherId = data.teacherId ?? teacherId;

    // Verify teacher exists and is active
    const teacher = await prisma.teacher.findUnique({
        where: {userId: effectiveTeacherId},
        include: {user: true},
    });
    if (!teacher || teacher.user.status !== Status.ACTIVE) {
        throw new AppError("Teacher not found or inactive", 400);
    }

    // Verify student exists and is active
    const student = await prisma.student.findUnique({
        where: {userId: data.studentId},
        include: {user: true},
    });
    if (!student || student.user.status !== Status.ACTIVE) {
        throw new AppError("Student not found or inactive", 400);
    }

    // Prevent overlapping classes for teacher or student today
    const conflict = await prisma.classV2.findFirst({
        where: {
            date: targetDate,
            status: Status.ACTIVE,
            OR: [{teacherId: effectiveTeacherId}, {studentId: data.studentId}],
            AND: [
                {startTime: {lt: data.endTime}},
                {endTime: {gt: data.startTime}},
            ],
        },
    });

    if (conflict) {
        throw new AppError(
            "A class is already scheduled during this time slot today for the teacher or student",
            409
        );
    }

    return prisma.classV2.create({
        data: {
            teacherId: effectiveTeacherId,
            studentId: data.studentId,
            date: targetDate,
            startTime: data.startTime,
            endTime: data.endTime,
            meetLink: data.meetLink ?? teacher.meetLink,
            attendanceStatus: ClassAttendanceStatus.PENDING,
        },
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });
};

/**
 * 2. Get active/upcoming classes for today in IST (filtering out expired classes where endTime is exceeded)
 */
const getActiveOrUpcomingClasses = async (userId: number, role: UserRole) => {
    const todayIST = getTodayDateIST();
    const currentISTTime = getCurrentISTTime();

    const where: Prisma.ClassV2WhereInput = {
        date: todayIST,
        status: Status.ACTIVE,
        endTime: {
            gt: currentISTTime, // Exclude classes where end time has passed
        },
        ...(role === UserRole.TEACHER ? {teacherId: userId} : {}),
        ...(role === UserRole.STUDENT ? {studentId: userId} : {}),
    };

    const classes = await prisma.classV2.findMany({
        where,
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
        orderBy: {
            startTime: "asc",
        },
    });

    return classes.map((cls) => {
        const isOngoing = cls.startTime <= currentISTTime && cls.endTime > currentISTTime;
        return {
            id: cls.id,
            date: cls.date,
            startTime: cls.startTime,
            endTime: cls.endTime,
            isOngoing,
            meetLink: cls.meetLink ?? cls.teacher.meetLink,
            teacher: {
                id: cls.teacher.user.id,
                name: cls.teacher.user.name,
            },
            student: {
                id: cls.student.user.id,
                name: cls.student.user.name,
                course: cls.student.course?.title ?? null,
            },
            attendance: {
                status: cls.attendanceStatus,
                teacherAttended: cls.teacherAttended,
                studentAttended: cls.studentAttended,
                teacherJoinedAt: cls.teacherJoinedAt,
                studentJoinedAt: cls.studentJoinedAt,
            },
        };
    });
};

/**
 * 3. Mark attendance atomically on class_v2
 */
const markAttendance = async (
    classId: number,
    userId: number,
    role: UserRole,
    data?: MarkAttendanceDto
) => {
    const cls = await prisma.classV2.findUnique({
        where: {id: classId},
    });

    if (!cls || cls.status !== Status.ACTIVE) {
        throw new AppError("Class not found or inactive", 404);
    }

    const now = new Date();
    let updateData: Prisma.ClassV2UpdateInput = {};

    if (role === UserRole.TEACHER || role === UserRole.ADMIN) {
        if (role === UserRole.TEACHER && cls.teacherId !== userId) {
            throw new AppError("Forbidden: You are not the teacher for this class", 403);
        }

        const isPresent = data?.status ? data.status === "PRESENT" : true;
        const studentPresent = cls.studentAttended;

        let newStatus: ClassAttendanceStatus = ClassAttendanceStatus.PENDING;
        if (isPresent && studentPresent) newStatus = ClassAttendanceStatus.ALL_PRESENT;
        else if (isPresent) newStatus = ClassAttendanceStatus.TEACHER_PRESENT;
        else if (studentPresent) newStatus = ClassAttendanceStatus.STUDENT_PRESENT;
        else newStatus = data?.status === "ABSENT" ? ClassAttendanceStatus.ABSENT : ClassAttendanceStatus.PENDING;

        updateData = {
            teacherAttended: isPresent,
            teacherJoinedAt: isPresent ? (cls.teacherJoinedAt ?? now) : null,
            attendanceStatus: newStatus,
        };
    } else if (role === UserRole.STUDENT) {
        if (cls.studentId !== userId) {
            throw new AppError("Forbidden: You are not enrolled in this class", 403);
        }

        const studentAttended = true;
        const teacherPresent = cls.teacherAttended;

        updateData = {
            studentAttended,
            studentJoinedAt: cls.studentJoinedAt ?? now,
            attendanceStatus: teacherPresent
                ? ClassAttendanceStatus.ALL_PRESENT
                : ClassAttendanceStatus.STUDENT_PRESENT,
        };
    } else {
        throw new AppError("Forbidden: insufficient role permissions", 403);
    }

    return prisma.classV2.update({
        where: {id: classId},
        data: updateData,
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });
};

/**
 * 4. Get attendance records filtered by specific date in IST
 */
const getAttendanceByDate = async (
    userId: number,
    role: UserRole,
    queryDate?: string
) => {
    const targetDate = queryDate || getTodayDateIST();

    const where: Prisma.ClassV2WhereInput = {
        date: targetDate,
        status: Status.ACTIVE,
        ...(role === UserRole.TEACHER ? {teacherId: userId} : {}),
        ...(role === UserRole.STUDENT ? {studentId: userId} : {}),
    };

    const records = await prisma.classV2.findMany({
        where,
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
        orderBy: {
            startTime: "asc",
        },
    });

    return {
        date: targetDate,
        timezone: "IST",
        totalClasses: records.length,
        classes: records.map((cls) => ({
            classId: cls.id,
            courseTitle: cls.student.course?.title ?? null,
            startTime: cls.startTime,
            endTime: cls.endTime,
            attendanceStatus: cls.attendanceStatus,
            teacher: {
                id: cls.teacher.user.id,
                name: cls.teacher.user.name,
                attended: cls.teacherAttended,
                joinedAt: cls.teacherJoinedAt,
            },
            student: {
                id: cls.student.user.id,
                name: cls.student.user.name,
                attended: cls.studentAttended,
                joinedAt: cls.studentJoinedAt,
            },
        })),
    };
};

/**
 * 5. Get a specific ClassV2 by ID
 */
const getClassById = async (id: number) => {
    const cls = await prisma.classV2.findUnique({
        where: {id},
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });

    if (!cls) {
        throw new AppError("Class not found", 404);
    }

    return cls;
};

/**
 * 6. Update a ClassV2
 */
const updateClass = async (
    classId: number,
    userId: number,
    role: UserRole,
    data: UpdateClassV2Dto
) => {
    const cls = await prisma.classV2.findUnique({
        where: {id: classId},
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });

    if (!cls || cls.status !== Status.ACTIVE) {
        throw new AppError("Class not found or inactive", 404);
    }

    if (role === UserRole.TEACHER) {
        if (cls.teacherId !== userId) {
            throw new AppError("Forbidden: You are not the teacher for this class", 403);
        }
        if (data.teacherId && data.teacherId !== userId) {
            throw new AppError("Forbidden: Teachers cannot reassign classes to other teachers", 403);
        }
    } else if (role !== UserRole.ADMIN) {
        throw new AppError("Forbidden: insufficient role permissions", 403);
    }

    const targetDate = data.date ?? cls.date;
    const effectiveStartTime = data.startTime ?? cls.startTime;
    const effectiveEndTime = data.endTime ?? cls.endTime;
    const effectiveTeacherId = (role === UserRole.ADMIN && data.teacherId) ? data.teacherId : cls.teacherId;
    const effectiveStudentId = data.studentId ?? cls.studentId;

    if (effectiveEndTime <= effectiveStartTime) {
        throw new AppError("endTime must be strictly after startTime", 400);
    }

    const todayIST = getTodayDateIST();
    const currentISTTime = getCurrentISTTime();
    if (targetDate === todayIST && effectiveEndTime <= currentISTTime) {
        throw new AppError("Cannot set class endTime to a time that has already passed today in IST", 400);
    }

    if (data.studentId && data.studentId !== cls.studentId) {
        if (cls.attendanceStatus !== ClassAttendanceStatus.PENDING || cls.studentAttended || cls.teacherAttended) {
            throw new AppError("Cannot change student after attendance has been recorded", 400);
        }
    }

    if (data.teacherId && data.teacherId !== cls.teacherId) {
        const teacher = await prisma.teacher.findUnique({
            where: {userId: effectiveTeacherId},
            include: {user: true},
        });
        if (!teacher || teacher.user.status !== Status.ACTIVE) {
            throw new AppError("Teacher not found or inactive", 400);
        }
    }

    if (data.studentId && data.studentId !== cls.studentId) {
        const student = await prisma.student.findUnique({
            where: {userId: effectiveStudentId},
            include: {user: true},
        });
        if (!student || student.user.status !== Status.ACTIVE) {
            throw new AppError("Student not found or inactive", 400);
        }
    }

    const timingOrParticipantsChanged =
        targetDate !== cls.date ||
        effectiveStartTime !== cls.startTime ||
        effectiveEndTime !== cls.endTime ||
        effectiveTeacherId !== cls.teacherId ||
        effectiveStudentId !== cls.studentId;

    if (timingOrParticipantsChanged) {
        const conflict = await prisma.classV2.findFirst({
            where: {
                id: {not: classId},
                date: targetDate,
                status: Status.ACTIVE,
                OR: [{teacherId: effectiveTeacherId}, {studentId: effectiveStudentId}],
                AND: [
                    {startTime: {lt: effectiveEndTime}},
                    {endTime: {gt: effectiveStartTime}},
                ],
            },
        });

        if (conflict) {
            throw new AppError(
                "A class is already scheduled during this time slot today for the teacher or student",
                409
            );
        }
    }

    return prisma.classV2.update({
        where: {id: classId},
        data: {
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            meetLink: data.meetLink !== undefined ? data.meetLink : undefined,
            teacherId: role === UserRole.ADMIN ? data.teacherId : undefined,
            studentId: data.studentId,
        },
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });
};

/**
 * 7. Soft-delete a ClassV2 (set status to INACTIVE)
 */
const deleteClass = async (classId: number, userId: number, role: UserRole) => {
    const cls = await prisma.classV2.findUnique({
        where: {id: classId},
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });

    if (!cls || cls.status !== Status.ACTIVE) {
        throw new AppError("Class not found or already inactive", 404);
    }

    if (role === UserRole.TEACHER) {
        if (cls.teacherId !== userId) {
            throw new AppError("Forbidden: You are not the teacher for this class", 403);
        }
        if (cls.attendanceStatus !== ClassAttendanceStatus.PENDING || cls.teacherAttended || cls.studentAttended) {
            throw new AppError("Cannot delete class after attendance has been recorded", 400);
        }
    } else if (role !== UserRole.ADMIN) {
        throw new AppError("Forbidden: insufficient role permissions", 403);
    }

    return prisma.classV2.update({
        where: {id: classId},
        data: {
            status: Status.INACTIVE,
        },
        include: {
            teacher: teacherSelect,
            student: studentSelect,
        },
    });
};

export const ClassV2Service = {
    createClass,
    getActiveOrUpcomingClasses,
    markAttendance,
    getAttendanceByDate,
    getClassById,
    updateClass,
    deleteClass,
};