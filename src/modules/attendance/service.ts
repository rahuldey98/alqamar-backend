import {Prisma, Status, UserRole} from "@prisma/client";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {MarkAttendanceRequest} from "@rahuldey98/alqamar-models/dist/attendance/mark-attendance";
import {GetAttendanceRequest} from "@rahuldey98/alqamar-models/dist/attendance/get-attendance";


const markAttendance = async (userId: number, role: UserRole, data: MarkAttendanceRequest) => {
    const dbClass = await prisma.class.findUnique({
        where: {
            id: data.classId,
        },
        select: {
            id: true,
            teacherId: true,
            status: true,
        },
    });

    if (!dbClass || dbClass.status !== Status.ACTIVE) {
        throw new AppError("No active class found", 404);
    }

    if (role === UserRole.TEACHER) {
        if (dbClass.teacherId !== userId) {
            throw new AppError("Forbidden: you can only mark attendance for your own class", 403);
        }

        const record = await prisma.teacherAttendance.upsert({
            where: {
                classId_teacherId_date: {
                    classId: data.classId,
                    teacherId: userId,
                    date: data.date,
                },
            },
            update: {},
            create: {
                classId: data.classId,
                teacherId: userId,
                date: data.date,
            },
        });

        return {role, userId, ...record};
    }

    if (role === UserRole.STUDENT) {
        const isEnrolled = await prisma.classStudent.findUnique({
            where: {
                classId_studentId: {
                    classId: data.classId,
                    studentId: userId,
                },
            },
        });

        if (!isEnrolled) {
            throw new AppError("Forbidden: you are not enrolled in this class", 403);
        }

        const record = await prisma.studentAttendance.upsert({
            where: {
                classId_studentId_date: {
                    classId: data.classId,
                    studentId: userId,
                    date: data.date,
                },
            },
            update: {},
            create: {
                classId: data.classId,
                studentId: userId,
                date: data.date,
            },
        });

        return {role, userId, ...record};
    }

    throw new AppError("Forbidden: insufficient role permissions", 403);
};

const buildDateFilter = (data: { fromDate?: string; toDate?: string }) => {
    const {fromDate, toDate} = data;
    if (!fromDate && !toDate) return undefined;

    const filter: Prisma.StringFilter = {};
    if (fromDate) filter.gte = fromDate;
    if (toDate) filter.lte = toDate;

    return filter;
};

const getAttendanceLog = async (userId: number, role: UserRole, data: GetAttendanceRequest) => {
    const dateFilter = buildDateFilter(data);

    const attendanceModel = role === UserRole.TEACHER
        ? prisma.teacherAttendance
        : prisma.studentAttendance;

    const whereClause: any = {
        ...(dateFilter && {date: dateFilter}),
        class: {status: Status.ACTIVE},
    };

    if (role === UserRole.TEACHER) {
        whereClause.teacherId = userId;
    } else {
        whereClause.studentId = userId;
    }

    const attendances = await (attendanceModel as any).findMany({
        where: whereClause,
        include: {
            class: {
                include: {
                    course: {select: {id: true, title: true}},
                    teacher: {select: {id: true, name: true}},
                },
            },
        },
        orderBy: [{date: "desc"}, {classId: "asc"}],
    });

    return attendances.map((record: any) => ({
        classId: record.classId,
        date: record.date,
        present: true,
        course: {
            courseId: record.class.course.id,
            courseTitle: record.class.course.title,
        },
        teacher: {
            teacherId: record.class.teacher.id,
            teacherName: record.class.teacher.name,
        },
    }));
};

export const AttendanceService = {
    markAttendance,
    getAttendanceLog
};
