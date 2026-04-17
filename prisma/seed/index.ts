import "dotenv/config";
import {prisma} from "../../src/db/prisma";
import {seedUsers} from "./user.seed";
import {seedClasses} from "./class.seed";

export const index = async (): Promise<void> => {
    const users = await seedUsers(prisma);
    await seedClasses(prisma, users);

    console.log("Seeded users, classes, and enrollments successfully.");
    console.log(`Admin login: ${users.admin.phone} / admin123`);
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
