import "dotenv/config";
import {prisma} from "../../src/db/prisma";
// @ts-ignore
import {seedUsers} from "./user.seed";

export const index = async (): Promise<void> => {
    const users = await seedUsers(prisma);

    console.log("Seeded users successfully.");
    console.log(`Admin login: ${users.admin.phone} / rahu123`);
    console.log(`Teacher login: ${users.teacher.phone} / teacher123`);
    console.log(`Student login: ${users.student.phone} / student123`);
};

index()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
