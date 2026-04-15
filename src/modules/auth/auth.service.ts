import {LoginRequestDto, LoginResponseDto} from "@rahuldey98/alqamar-models";
import {generateToken} from "../../utils/jwt";
import {verifyPassword} from "../../utils/password";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {mapUserToUserResponseDto} from "../users/user.mapper";

const login = async (user: LoginRequestDto): Promise<LoginResponseDto> => {
    const dbUser = await prisma.user.findUnique({
        where: {phone: user.phone},
    });

    if (!dbUser) {
        throw new AppError("No user found", 400);
    }

    const isValidPassword = await verifyPassword(user.password, dbUser.password);

    if (!isValidPassword) {
        throw new AppError("Invalid password", 401);
    }

    const accessToken = generateToken({userId: dbUser.id.toString(), role: dbUser.role});
    return {
        user: mapUserToUserResponseDto(dbUser),
        accessToken,
    };
};

export const authService = {
    login,
};
