import {NextFunction, Request, Response} from "express"
import {ClassService} from "./service";
import {sendResponse} from "../../common/send-response";
import {AuthRequest} from "../../common/auth-request";

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

export const getTodayClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const classes = await ClassService.getTodayClasses(Number(req.user!.userId), req.user!.role)
        sendResponse(res, classes)
    } catch (e) {
        next(e)
    }
}

export const getSchedules = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const schedules = await ClassService.getSchedules(Number(req.user!.userId), req.user!.role)
        sendResponse(res, schedules)
    } catch (e) {
        next(e)
    }
}
