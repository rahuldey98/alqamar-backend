import {prisma} from "../../db/prisma";
import {Prisma, UserRole} from "@prisma/client";
import {AppError} from "../../common/app-error";
import {createDefaultPassword, hashPassword} from "../../utils/password";
import {publicUserSelect} from "../../common/public-user";
import {AdminRequestDto, StudentRequestDto, TeacherRequestDto, UserRequestDto} from "./schema";

const publicTeacherSelect = {
    userId: true,
    meetLink: true,
    user: {select: publicUserSelect},
} satisfies Prisma.TeacherSelect;

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

const getUsers = async () => {
    return prisma.user.findMany({select: publicUserSelect});
};

const getUserById = async (id: string) => {
    const dbUser = await prisma.user.findUnique({
        where: {id: parseInt(id)},
        select: publicUserSelect,
    });
    if (!dbUser) {
        throw new AppError("No user found", 400);
    }
    return dbUser;
};

const getCurrentUser = async (userId: string) => {
    return getUserById(userId);
};

const updateUser = async (id: string, user: Partial<UserRequestDto>) => {
    const {password, meetLink, ...otherData} = user;

    if (meetLink !== undefined) {
        const dbUser = await prisma.user.findUnique({
            where: {id: parseInt(id)},
            select: {role: true},
        });
        if (!dbUser) {
            throw new AppError("No user found", 400);
        }
        if (dbUser.role !== UserRole.TEACHER) {
            throw new AppError("Only teachers can update meet link", 403);
        }
    }

    const updateData = {
        ...otherData,
        ...(password && {password: await hashPassword(password)}),
        // TODO: remove once clients write meetLink via PATCH /users/teachers/:id only
        ...(meetLink !== undefined && {
            meetLink,
            teacher: {update: {meetLink}},
        }),
    };

    return prisma.user.update({
        where: {id: parseInt(id)},
        data: updateData,
        select: publicUserSelect,
    });
};

const updateCurrentUser = async (userId: string, user: Partial<UserRequestDto>) => {
    return updateUser(userId, user);
};

const createAdmin = async (data: AdminRequestDto) => {
    const plainPassword = data.password || createDefaultPassword(data.name);
    const hashedPassword = await hashPassword(plainPassword);

    return prisma.user.create({
        data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: UserRole.ADMIN,
            status: data.status,
            gender: data.gender,
            age: data.age,
        },
        select: publicUserSelect,
    });
};

const createTeacher = async (data: TeacherRequestDto) => {
    const plainPassword = data.password || createDefaultPassword(data.name);
    const hashedPassword = await hashPassword(plainPassword);

    return prisma.user.create({
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
            teacher: {create: {meetLink: data.meetLink}},
        },
        select: {
            ...publicUserSelect,
            teacher: {select: {userId: true, meetLink: true}},
        },
    });
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
    return students.map(student => ({
        ...student,
        name: student.user.name,
        id: student.userId,
    }));
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

export const UserService = {
    getUsers,
    getUserById,
    getCurrentUser,
    updateUser,
    updateCurrentUser,
    createAdmin,
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
};
