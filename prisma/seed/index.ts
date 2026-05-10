import "dotenv/config";
import {prisma} from "../../src/db/prisma";
// @ts-ignore
import {seedUsers} from "./user.seed";
// @ts-ignore
import {seedClasses} from "./class.seed";
// @ts-ignore
import {seedCourses} from "./course.seed";

if (process.env.NODE_ENV === "production") {
    console.error("Refusing to seed: NODE_ENV=production. Seeds are dev-only.");
    process.exit(1);
}

export const index = async (): Promise<void> => {
    const users = await seedUsers(prisma);
    await seedCourses(prisma)
    await seedClasses(prisma);

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
