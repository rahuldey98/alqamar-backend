import {NextFunction, Request, Response} from "express"
import {ClassService} from "./service";
import {sendResponse} from "../../common/send-response";
import {AuthRequest} from "../../common/auth-request";
import {AppError} from "../../common/app-error";

export const createClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdClasses = await ClassService.createClasses(req.body)
        sendResponse(res, createdClasses)
    } catch (e) {
        next(e)
    }
}

export const getClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const classes = await ClassService.getClasses(Number(req.user!.userId), req.user!.role)
        sendResponse(res, classes)
    } catch (e) {
        next(e)
    }
}

export const updateClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classes = await ClassService.updateClasses(Number(req.params.id), req.body)
        sendResponse(res, classes)
    } catch (e) {
        next(e)
    }
}

export const getClassesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classes = await ClassService.getClassesById(Number(req.params.id))
        sendResponse(res, classes)
    } catch (e) {
        next(e)
    }
}

export const getTodayClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        throw new AppError("Please update to the latest app version from the Play Store.", 410);
    } catch (e) {
        next(e)
    }
}

export const getSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        throw new AppError("Please update to the latest app version from the Play Store.", 410);
    } catch (e) {
        next(e)
    }
}

export const getClassAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ClassService.getClassAttendance(req.query.date as string)
        sendResponse(res, result)
    } catch (e) {
        next(e)
    }
}
