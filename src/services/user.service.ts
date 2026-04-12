import {prisma} from "../prisma/prisma";
import type {Prisma, User as PrismaUser} from "@prisma/client";
import {AppError} from "../utils/app-error";
import {AuthService} from "./auth.service";
import {UserRequestDto, UserResponseDto } from "@rahuldey98/alqamar-models";

const getAllUsers = async (): Promise<UserResponseDto[]> => {
    const dbUsers = await prisma.user.findMany();
    return dbUsers.map(mapUserToUserResponseDto);
}

const getUserById = async (id: string): Promise<UserResponseDto> => {
    const dbUser = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dbUser) {
        throw new AppError("No user found", 400)
    }
    return mapUserToUserResponseDto(dbUser);
}

const getUserByPhoneInternal = async (phone: string) => {
    return prisma.user.findUnique({
        where: {
            phone: phone
        }
    });
}

const createUser = async (user: UserRequestDto): Promise<UserResponseDto> => {
    const plainPassword = user.password || createDefaultPassword(user.name);
    const hashedPassword = await AuthService.hashPassword(plainPassword);

    const createdUser = await prisma.user.create({
        data: {
            name: user.name,
            phone: user.phone,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            status: user.status
        }
    });
    return mapUserToUserResponseDto(createdUser);
}

const updateUser = async (id: string, user: Partial<UserRequestDto>): Promise<UserResponseDto> => {
    const updateData: Prisma.UserUpdateInput = {};

    if (user.name !== undefined) updateData.name = user.name;
    if (user.phone !== undefined) updateData.phone = user.phone;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.status !== undefined) updateData.status = user.status;
    if (user.password !== undefined) {
        updateData.password = await AuthService.hashPassword(user.password);
    }

    const updatedUser = await prisma.user.update({
        where: {id: parseInt(id)},
        data: updateData
    });
    return mapUserToUserResponseDto(updatedUser);
}

const createDefaultPassword = (name: string): string => {
    const base = name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4);
    return `${base || "user"}123`;
}

const mapUserToUserResponseDto = (user: PrismaUser): UserResponseDto => {
    return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
    }
};

export const UserService = {
    getAllUsers,
    getUserById,
    getUserByPhoneInternal,
    createUser,
    updateUser,
    mapUserToUserResponseDto
}
