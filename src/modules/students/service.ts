import {prisma} from "../../db/prisma";
import {Prisma, UserRole} from "@prisma/client";
import {AppError} from "../../common/app-error";
import {createDefaultPassword, hashPassword} from "../../utils/password";
import {StudentRequestDto} from "./schema";
import {publicUserSelect} from "../../common/public-user";

const publicStudentSelect = {
    userId: true,
    feesDate: true,
    course: {select: {id: true, title: true, enTitle: true}},
    class: {
        select: {
            id: true,
            meetLink: true,
            status: true,
            startDate: true,
            course: {select: {id: true, title: true, enTitle: true}},
        },
    },
    user: {select: publicUserSelect},
} satisfies Prisma.StudentSelect;

const createStudent = async (data: StudentRequestDto) => {
    const plainPassword = data.password || createDefaultPassword(data.name);
    const hashedPassword = await hashPassword(plainPassword);

    return prisma.user.create({
        data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: UserRole.STUDENT,
            status: data.status,
            gender: data.gender,
            age: data.age,
            student: {
                create: {
                    feesDate: data.feesDate,
                    courseId: data.courseId,
                    classId: data.classId,
                },
            },
        },
        select: {
            ...publicUserSelect,
            student: {
                select: {
                    userId: true,
                    feesDate: true,
                    course: {select: {id: true, title: true, enTitle: true}},
                    classId: true,
                },
            },
        },
    });
};

const getStudents = async (limit: number) => {
    const students = await prisma.student.findMany({
        orderBy: {user: {name: "asc"}},
        take: limit,
        select: publicStudentSelect,
    });
    return students.map(student=>({
        ...student,
        //TODO: remove this after app is migrated
        name: student.user.name,
        id: student.userId
    }))
};

const getStudentById = async (id: string) => {
    const student = await prisma.student.findUnique({
        where: {userId: parseInt(id)},
        select: publicStudentSelect,
    });
    if (!student) {
        throw new AppError("No student found", 400);
    }
    return student;
};

const updateStudent = async (id: string, data: Partial<StudentRequestDto>) => {
    const {feesDate, courseId, classId, password, name, phone, email, status, gender, age} = data;

    const userData: Prisma.UserUpdateInput = {
        ...(name !== undefined && {name}),
        ...(phone !== undefined && {phone}),
        ...(email !== undefined && {email}),
        ...(status !== undefined && {status}),
        ...(gender !== undefined && {gender}),
        ...(age !== undefined && {age}),
        ...(password && {password: await hashPassword(password)}),
    };

    const studentData: Prisma.StudentUpdateInput = {
        ...(feesDate !== undefined && {feesDate}),
        ...(courseId !== undefined && {course: courseId === null ? {disconnect: true} : {connect: {id: courseId}}}),
        ...(classId !== undefined && {class: classId === null ? {disconnect: true} : {connect: {id: classId}}}),
    };

    return prisma.student.update({
        where: {userId: parseInt(id)},
        data: {
            ...studentData,
            ...(Object.keys(userData).length > 0 && {user: {update: userData}}),
        },
        select: publicStudentSelect,
    });
};

export const StudentService = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
};
