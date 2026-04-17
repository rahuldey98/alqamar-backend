import {DayOfWeek, PrismaClient} from "@prisma/client";

export const seedClasses = async (prisma: PrismaClient): Promise<void> => {
    await prisma.class.create({
        data: {
            id: 1,
            courseId: 1,
            teacherId: 2,
            meetLink: "https://meet.example.com/arabic-foundation"
        }
    })

    await prisma.classStudent.create({
        data: {
            id: 1,
            classId: 1,
            studentId: 3
        }
    })

    await prisma.classSchedule.createMany({
        data: [
            {
                id: 1,
                classId: 1,
                dayOfWeek: DayOfWeek.MONDAY,
                startTime: "16:00",
                endTime: "17:00",

            },
            {
                id: 2,
                classId: 1,
                dayOfWeek: DayOfWeek.TUESDAY,
                startTime: "16:00",
                endTime: "17:00"

            },
            {
                id: 3,
                classId: 1,
                dayOfWeek: DayOfWeek.WEDNESDAY,
                startTime: "16:00",
                endTime: "17:00"
            }
        ]
    })
}
