import {prisma} from "../../db/prisma";
import {UserRole} from "@prisma/client";
import {hashPassword} from "../../utils/password";
import {AppError} from "../../common/app-error";
import {UserRequestDto} from "./schema";
import {publicUserSelect} from "../../common/public-user";

const getUsers = async () => {
    return prisma.user.findMany({
        select: publicUserSelect,
    });
};

const getUserById = async (id: string) => {
    const dbUser = await prisma.user.findUnique({
        where: {id: parseInt(id)},
        select: publicUserSelect,
    });
    if (!dbUser) {
        throw new AppError("No user found", 400);
    }
    return dbUser
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

export const UserService = {
    getUsers,
    getUserById,
    getCurrentUser,
    updateCurrentUser,
    updateUser,
};
