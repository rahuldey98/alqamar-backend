import {prisma} from "../../db/prisma";
import {Prisma, UserRole} from "@prisma/client";
import {AppError} from "../../common/app-error";
import {createDefaultPassword, hashPassword} from "../../utils/password";
import {TeacherRequestDto} from "./schema";
import {publicUserSelect} from "../../common/public-user";

const publicTeacherSelect = {
    userId: true,
    meetLink: true,
    user: {select: publicUserSelect},
} satisfies Prisma.TeacherSelect;

const createTeacher = async (data: TeacherRequestDto) => {
    const plainPassword = data.password || createDefaultPassword(data.name);
    const hashedPassword = await hashPassword(plainPassword);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: UserRole.TEACHER,
            status: data.status,
            gender: data.gender,
            age: data.age,
            // TODO: remove once clients read meetLink from Teacher only
            meetLink: data.meetLink,
            teacher: {
                create: {
                    meetLink: data.meetLink,
                },
            },
        },
        select: {
            ...publicUserSelect,
            teacher: {select: {userId: true, meetLink: true}},
        },
    });

    return user;
};

const getTeachers = async (limit: number) => {
    return prisma.teacher.findMany({
        orderBy: {user: {name: "asc"}},
        take: limit,
        select: publicTeacherSelect,
    });
};

const getTeacherById = async (id: string) => {
    const teacher = await prisma.teacher.findUnique({
        where: {userId: parseInt(id)},
        select: publicTeacherSelect,
    });
    if (!teacher) {
        throw new AppError("No teacher found", 400);
    }
    return teacher;
};

const updateTeacher = async (id: string, data: Partial<TeacherRequestDto>) => {
    const {meetLink, password, name, phone, email, status, gender, age} = data;

    const userData: Prisma.UserUpdateInput = {
        ...(name !== undefined && {name}),
        ...(phone !== undefined && {phone}),
        ...(email !== undefined && {email}),
        ...(status !== undefined && {status}),
        ...(gender !== undefined && {gender}),
        ...(age !== undefined && {age}),
        ...(password && {password: await hashPassword(password)}),
        // TODO: remove once clients read meetLink from Teacher only
        ...(meetLink !== undefined && {meetLink}),
    };

    const teacherData: Prisma.TeacherUpdateInput = {
        ...(meetLink !== undefined && {meetLink}),
    };

    return prisma.teacher.update({
        where: {userId: parseInt(id)},
        data: {
            ...teacherData,
            ...(Object.keys(userData).length > 0 && {user: {update: userData}}),
        },
        select: publicTeacherSelect,
    });
};

export const TeacherService = {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
};
