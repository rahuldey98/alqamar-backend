import {prisma} from "../../db/prisma";
import {UserRole} from "@prisma/client";
import {createDefaultPassword, hashPassword} from "../../utils/password";
import {AdminRequestDto} from "./schema";
import {publicUserSelect} from "../../common/public-user";

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

export const AdminService = {
    createAdmin,
};
