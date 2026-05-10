import {PrismaClient, Status, UserRole, type User} from "@prisma/client";
import {hashPassword} from "../../src/utils/password";

export type SeedUsersResult = {
    admin: User;
    teacher: User;
    student: User;
};

export const seedUsers = async (prisma: PrismaClient): Promise<SeedUsersResult> => {
    const adminPassword = await hashPassword("rahul123");
    const teacherPassword = await hashPassword("teacher123");
    const studentPassword = await hashPassword("student123");

    const admin = await prisma.user.upsert({
        where: {id: 1},
        update: {},
        create: {
            id: 1,
            name: "Admin User",
            phone: "7992632090",
            email: "admin@alqamar.local",
            password: adminPassword,
            role: UserRole.ADMIN,
            status: Status.ACTIVE,
        },
    });

    const teacher = await prisma.user.upsert({
        where: {id: 2},
        update: {},
        create: {
            id: 2,
            name: "Teacher User",
            phone: "9000000001",
            email: "teacher@alqamar.local",
            password: teacherPassword,
            role: UserRole.TEACHER,
            status: Status.ACTIVE,
            teacher: {
                create: {},
            },
        },
    });

    const student = await prisma.user.upsert({
        where: {id: 3},
        update: {},
        create: {
            id: 3,
            name: "Student User",
            phone: "9000000002",
            email: "student@alqamar.local",
            password: studentPassword,
            role: UserRole.STUDENT,
            status: Status.ACTIVE,
            student: {
                create: {},
            },
        },
    });

    return {admin, teacher, student};
};
