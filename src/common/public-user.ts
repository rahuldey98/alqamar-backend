import {Prisma} from "@prisma/client";

export const publicUserSelect = {
    id: true,
    name: true,
    phone: true,
    email: true,
    meetLink: true,
    role: true,
    gender: true,
    age: true,
    status: true,
    feesDate: true,
    course: {
        select: {id: true, title: true, enTitle: true},
    },
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;