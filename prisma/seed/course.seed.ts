import {PrismaClient} from "@prisma/client";

export const seedCourses = async (prisma: PrismaClient): Promise<void> => {
    await prisma.course.create({
        data: {
            id: 1,
            title: "Qaida Course",
            durationMonths: 5
        }
    })
    await prisma.course.create({
        data: {
            id: 2,
            title: "Nazrah Qur’aan Course",
            enTitle: "Qur’an Reading Course",
            durationMonths: 12
        }
    })
    await prisma.course.create({
        data: {
            id: 3,
            title: "Qur’an Hifz Course",
            enTitle: "Qur’an Memorization Course",
            durationMonths: 36
        }
    })
    await prisma.course.create({
        data: {
            id: 4,
            title: "Tarjuma Quran Course",
            enTitle: "Qur’an Translation Course",
            durationMonths: 12
        }
    })
}