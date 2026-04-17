import {ClassSubject, DayOfWeek, PrismaClient, Status} from "@prisma/client";
import type {SeedUsersResult} from "./user.seed";

export const seedClasses = async (prisma: PrismaClient, users: SeedUsersResult): Promise<void> => {
    const arabicClass = await prisma.class.upsert({
        where: {id: 1},
        update: {
            name: "Arabic Foundation",
            subject: ClassSubject.ARABIC,
            teacherId: users.teacher.id,
            meetLink: "https://meet.example.com/arabic-foundation",
            description: "Introductory Arabic class for local development index data.",
            status: Status.ACTIVE,
        },
        create: {
            id: 1,
            name: "Arabic Foundation",
            subject: ClassSubject.ARABIC,
            teacherId: users.teacher.id,
            meetLink: "https://meet.example.com/arabic-foundation",
            description: "Introductory Arabic class for local development index data.",
            status: Status.ACTIVE,
        },
    });

    const urduClass = await prisma.class.upsert({
        where: {id: 2},
        update: {
            name: "Urdu Basics",
            subject: ClassSubject.URDU,
            teacherId: users.teacher.id,
            meetLink: "https://meet.example.com/urdu-basics",
            description: "Basic Urdu class for local development index data.",
            status: Status.ACTIVE,
        },
        create: {
            id: 2,
            name: "Urdu Basics",
            subject: ClassSubject.URDU,
            teacherId: users.teacher.id,
            meetLink: "https://meet.example.com/urdu-basics",
            description: "Basic Urdu class for local development index data.",
            status: Status.ACTIVE,
        },
    });

    await prisma.classStudent.upsert({
        where: {
            classId_studentId: {
                classId: arabicClass.id,
                studentId: users.student.id,
            },
        },
        update: {
            userId: users.student.id,
        },
        create: {
            classId: arabicClass.id,
            studentId: users.student.id,
            userId: users.student.id,
        },
    });

    await prisma.classStudent.upsert({
        where: {
            classId_studentId: {
                classId: urduClass.id,
                studentId: users.student.id,
            },
        },
        update: {
            userId: users.student.id,
        },
        create: {
            classId: urduClass.id,
            studentId: users.student.id,
            userId: users.student.id,
        },
    });

    await prisma.classSchedule.deleteMany({
        where: {
            classId: {
                in: [arabicClass.id, urduClass.id],
            },
        },
    });

    await prisma.classSchedule.createMany({
        data: [
            {
                classId: arabicClass.id,
                dayOfWeek: DayOfWeek.MONDAY,
                startTime: new Date("1970-01-01T10:00:00.000Z"),
                endTime: new Date("1970-01-01T11:00:00.000Z"),
                status: Status.ACTIVE,
            },
            {
                classId: arabicClass.id,
                dayOfWeek: DayOfWeek.WEDNESDAY,
                startTime: new Date("1970-01-01T10:00:00.000Z"),
                endTime: new Date("1970-01-01T11:00:00.000Z"),
                status: Status.ACTIVE,
            },
            {
                classId: urduClass.id,
                dayOfWeek: DayOfWeek.TUESDAY,
                startTime: new Date("1970-01-01T12:00:00.000Z"),
                endTime: new Date("1970-01-01T13:00:00.000Z"),
                status: Status.ACTIVE,
            },
            {
                classId: urduClass.id,
                dayOfWeek: DayOfWeek.THURSDAY,
                startTime: new Date("1970-01-01T12:00:00.000Z"),
                endTime: new Date("1970-01-01T13:00:00.000Z"),
                status: Status.ACTIVE,
            },
        ],
    });
};
