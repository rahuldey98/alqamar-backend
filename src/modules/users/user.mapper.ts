import type {User as PrismaUser} from "@prisma/client";
import type {UserResponseDto} from "@rahuldey98/alqamar-models";

export const mapUserToUserResponseDto = (user: PrismaUser): UserResponseDto => {
    return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
    };
};
