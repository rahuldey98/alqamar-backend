import {Prisma, Status, UserRole} from "@prisma/client";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {MarkAttendanceRequest} from "@rahuldey98/alqamar-models/dist/attendance/mark-attendance";
import {GetAttendanceRequest} from "@rahuldey98/alqamar-models/dist/attendance/get-attendance";


const markAttendance = async (userId: number, role: UserRole, data: MarkAttendanceRequest) => {
    const dbClass = await prisma.class.findUnique({
        where: {id: data.classId},
        select: {
            id: true,
            status: true,
            teacher: {select: {userId: true}},
        },
    });

    if (!dbClass || dbClass.status !== Status.ACTIVE) {
        throw new AppError("No active class found", 404);
    }

    if (role === UserRole.TEACHER) {
        if (dbClass.teacher.userId !== userId) {
            throw new AppError("Forbidden: you can only mark attendance for your own class", 403);
        }
    } else if (role === UserRole.STUDENT) {
        const enrolled = await prisma.student.findFirst({
            where: {userId, classId: data.classId},
        });
        if (!enrolled) {
            throw new AppError("Forbidden: you are not enrolled in this class", 403);
        }
    } else {
        throw new AppError("Forbidden: insufficient role permissions", 403);
    }

    const record = await prisma.attendance.upsert({
        where: {
            classId_userId_date: {
                classId: data.classId,
                userId,
                date: data.date,
            },
        },
        update: {},
        create: {
            classId: data.classId,
            userId,
            date: data.date,
        },
    });

    return {role, ...record};
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

    const attendances = await prisma.attendance.findMany({
        where: {
            userId,
            ...(dateFilter && {date: dateFilter}),
            class: {status: Status.ACTIVE},
        },
        include: {
            class: {
                include: {
                    course: {select: {id: true, title: true}},
                    teacher: {include: {user: {select: {id: true, name: true}}}},
                },
            },
        },
        orderBy: [{date: "desc"}, {classId: "asc"}],
    });

    return attendances.map(record => ({
        classId: record.classId,
        date: record.date,
        present: true,
        course: {
            courseId: record.class.course.id,
            courseTitle: record.class.course.title,
        },
        teacher: {
            teacherId: record.class.teacher.user.id,
            teacherName: record.class.teacher.user.name,
        },
    }));
};

export const AttendanceService = {
    markAttendance,
    getAttendanceLog
};
