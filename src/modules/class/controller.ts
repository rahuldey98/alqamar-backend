import {Request, Response, NextFunction} from "express"
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
        if (!req.user) {
            next(new AppError("Unauthorized", 401));
            return;
        }
        const classes = await ClassService.getClasses(Number(req.user.userId), req.user.role)
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

export const getHomeClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            next(new AppError("Unauthorized", 401));
            return;
        }
        const classes = await ClassService.getHomeClasses(Number(req.user.userId), req.user.role)
        sendResponse(res, classes)
    } catch (e) {
        next(e)
    }
}
