"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../prisma/prisma");
const app_error_1 = require("../utils/app-error");
const auth_service_1 = require("./auth.service");
const getAllUsers = async () => {
    const dbUsers = await prisma_1.prisma.user.findMany();
    return dbUsers.map(mapUserToUserResponseDto);
};
const getUserById = async (id) => {
    const dbUser = await prisma_1.prisma.user.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    if (!dbUser) {
        throw new app_error_1.AppError("No user found", 400);
    }
    return mapUserToUserResponseDto(dbUser);
};
const getUserByPhoneInternal = async (phone) => {
    return prisma_1.prisma.user.findUnique({
        where: {
            phone: phone
        }
    });
};
const createUser = async (user) => {
    const plainPassword = user.password || createDefaultPassword(user.name);
    const hashedPassword = await auth_service_1.AuthService.hashPassword(plainPassword);
    const createdUser = await prisma_1.prisma.user.create({
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
};
const updateUser = async (id, user) => {
    const updateData = {};
    if (user.name !== undefined)
        updateData.name = user.name;
    if (user.phone !== undefined)
        updateData.phone = user.phone;
    if (user.email !== undefined)
        updateData.email = user.email;
    if (user.role !== undefined)
        updateData.role = user.role;
    if (user.status !== undefined)
        updateData.status = user.status;
    if (user.password !== undefined) {
        updateData.password = await auth_service_1.AuthService.hashPassword(user.password);
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData
    });
    return mapUserToUserResponseDto(updatedUser);
};
const createDefaultPassword = (name) => {
    const base = name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4);
    return `${base || "user"}123`;
};
const mapUserToUserResponseDto = (user) => {
    return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
    };
};
exports.UserService = {
    getAllUsers,
    getUserById,
    getUserByPhoneInternal,
    createUser,
    updateUser,
    mapUserToUserResponseDto
};
//# sourceMappingURL=user.service.js.map