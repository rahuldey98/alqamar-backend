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
    const updateData: Prisma.UserUpdateInput = {};

    if (user.name !== undefined) updateData.name = user.name;
    if (user.phone !== undefined) updateData.phone = user.phone;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.status !== undefined) updateData.status = user.status;
    if (user.gender !== undefined) updateData.gender = user.gender;
    if (user.age !== undefined) updateData.age = user.age;
    if (user.password !== undefined) {
        updateData.password = await hashPassword(user.password);
    }

    const updatedUser = await prisma.user.update({
        where: {id: parseInt(id)},
        data: updateData,
        select: userSelect,
    });
    return updatedUser
};

const createDefaultPassword = (name: string): string => {
    const base = name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4);
    return `${base || "user"}123`;
};

export const userService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
};
