import {Prisma} from "@prisma/client";

export const publicUserSelect = {
    id: true,
    name: true,
    phone: true,
    email: true,
    role: true,
    gender: true,
    age: true,
    status: true,
    // TODO: remove once all clients read meetLink from Teacher
    meetLink: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;
