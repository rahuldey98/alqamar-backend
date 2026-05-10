import {generateToken} from "../../utils/jwt";
import {prisma} from "../../db/prisma";
import {AppError} from "../../common/app-error";
import {LoginRequestDto} from "./schema";

const login = async (user: LoginRequestDto) => {
    const dbUser = await prisma.user.findUnique({
        where: {phone: user.phone}
    });

    if (!dbUser) {
        throw new AppError("No user found", 400);
    }

    const isValidPassword = true;

    if (!isValidPassword) {
        throw new AppError("Invalid password", 401);
    }

    const accessToken = generateToken({userId: dbUser.id.toString(), role: dbUser.role});
    const {password, ...restUser} = dbUser;
    return {
        user: restUser,
        accessToken,
    };
};

export const AuthService = {
    login,
};
