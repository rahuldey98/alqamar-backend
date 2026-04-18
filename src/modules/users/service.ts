import {prisma} from "../../db/prisma";
import type {Prisma} from "@prisma/client";
import {hashPassword} from "../../utils/password";
import {AppError} from "../../common/app-error";
import {UserRequestDto} from "./schema";

const userSelect = {
    id: true,
    name: true,
    phone: true,
    email: true,
    role: true,
    gender: true,
    age: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

const getUsers = async () => {
    return prisma.user.findMany({
        select: userSelect,
    });
};

const getUserById = async (id: string) => {
    const dbUser = await prisma.user.findUnique({
        where: {id: parseInt(id)},
        select: userSelect,
    });
    if (!dbUser) {
        throw new AppError("No user found", 400);
    }
    return dbUser
};

const createUser = async (user: UserRequestDto) => {
    const plainPassword = user.password || createDefaultPassword(user.name);
    const hashedPassword = await hashPassword(plainPassword);

    return prisma.user.create({
        data: {
            name: user.name,
            phone: user.phone,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            status: user.status,
            gender: user.gender,
            age: user.age,
        },
        select: userSelect,
    });
};

const updateUser = async (id: string, user: Partial<UserRequestDto>) => {
    const {password, ...otherData} = user
    const updateData = {
        ...otherData,
        ...(password && {password: await hashPassword(password)})
    }

    return prisma.user.update({
        where: {id: parseInt(id)},
        data: updateData,
        select: userSelect,
    });
};

const createDefaultPassword = (name: string): string => {
    const base = name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4);
    return `${base || "user"}123`;
};

export const UserService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
};
