import {CourseRequestDto} from "./schema";
import {prisma} from "../../db/prisma";

const createCourse = async (course: CourseRequestDto) => {
    return prisma.course.create({
        data: {
            title: course.title,
            enTitle: course.enTitle,
            durationMonths: course.durationMonths
        }
    })
}

const updateCourse = async (id: number, course: Partial<CourseRequestDto>) => {
    return prisma.course.update({
        where: {id: id},
        data: {
            title: course.title,
            enTitle: course.enTitle,
            durationMonths: course.durationMonths
        }
    })
}


const getCourses = async () => {
    return prisma.course.findMany()
}

export const CourseService = {
    getCourses,
    createCourse,
    updateCourse
}