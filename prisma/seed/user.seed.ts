import {PrismaClient, Status, UserRole, type User} from "@prisma/client";
import {hashPassword} from "../../src/utils/password";

export type SeedUsersResult = {
    admin: User;
    teacher: User;
    student: User;
};

export const seedUsers = async (prisma: PrismaClient): Promise<SeedUsersResult> => {
    const adminPassword = await hashPassword("admin123");
    const teacherPassword = await hashPassword("teacher123");
    const studentPassword = await hashPassword("student123");

    const admin = await prisma.user.upsert({
        where: {phone: "9000000001"},
        update: {
            name: "Admin User",
            email: "admin@alqamar.local",
            password: adminPassword,
            role: UserRole.ADMIN,
            status: Status.ACTIVE,
        },
        create: {
            name: "Admin User",
            phone: "9000000001",
            email: "admin@alqamar.local",
            password: adminPassword,
            role: UserRole.ADMIN,
            status: Status.ACTIVE,
        },
    });

    const teacher = await prisma.user.upsert({
        where: {phone: "9000000002"},
        update: {
            name: "Teacher User",
            email: "teacher@alqamar.local",
            password: teacherPassword,
            role: UserRole.TEACHER,
            status: Status.ACTIVE,
        },
        create: {
            name: "Teacher User",
            phone: "9000000002",
            email: "teacher@alqamar.local",
            password: teacherPassword,
            role: UserRole.TEACHER,
            status: Status.ACTIVE,
        },
    });

    const student = await prisma.user.upsert({
        where: {phone: "9000000003"},
        update: {
            name: "Student User",
            email: "student@alqamar.local",
            password: studentPassword,
            role: UserRole.STUDENT,
            status: Status.ACTIVE,
        },
        create: {
            name: "Student User",
            phone: "9000000003",
            email: "student@alqamar.local",
            password: studentPassword,
            role: UserRole.STUDENT,
            status: Status.ACTIVE,
        },
    });

    return {admin, teacher, student};
};
