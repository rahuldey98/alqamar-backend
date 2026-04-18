import {NextFunction, Request, Response} from "express";
import {CourseService} from "./service";
import {sendResponse} from "../../common/send-response";

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseService.createCourse(req.body)
        sendResponse(res, course)
    } catch (e) {
        next(e)
    }
}

export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseService.getCourses()
        sendResponse(res, courses)
    } catch (e) {
        next(e)
    }
}

export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedCourse = await CourseService.updateCourse(Number(req.params.id), req.body)
        sendResponse(res, updatedCourse)
    } catch (e) {
        next(e)
    }
}