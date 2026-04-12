import {prisma} from "../prisma/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {AppError} from "../utils/app-error";
import {JwtPayload} from "../types/auth.type";
import {UserService} from "./user.service";
import {LoginRequestDto, LoginResponseDto} from "@rahuldey98/alqamar-models";

const JWT_SECRET = process.env.JWT_SECRET || "abc"
const SALT_RADIUS = 10

const login = async (user: LoginRequestDto): Promise<LoginResponseDto> => {
    const dbUser = await UserService.getUserByPhoneInternal(user.phone)

    if (!dbUser) {
        throw new AppError("No user found", 400)
    }

    const isValidPassword = await verifyPassword(user.password, dbUser.password)

    if (!isValidPassword) {
        throw new AppError("Invalid password", 401)
    }

    const accessToken = generateToken({userId: dbUser.id.toString(), role: dbUser.role})
    return {
        user: UserService.mapUserToUserResponseDto(dbUser),
        accessToken
    }
}

const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
}

const generateToken = (jwtPayload: JwtPayload): string => {
    if (!JWT_SECRET) {
        throw new AppError("Invalid JWT Secret", 500)
    }
    return jwt.sign(jwtPayload, JWT_SECRET)
}

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, SALT_RADIUS)
}

const verifyPassword = async (
    password: string,
    passwordHash: string
) => {
    return await bcrypt.compare(password, passwordHash)
}

export const AuthService = {
    login,
    verifyToken,
    hashPassword
}
