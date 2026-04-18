import e, {Request, Response, NextFunction} from "express"
import {ClassService} from "./service";
import {sendResponse} from "../../common/send-response";

export const createClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdClasses = await ClassService.createClasses(req.body)
        sendResponse(res, createdClasses)
    } catch (e) {
        next(e)
    }
}

export const getClasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classes = await ClassService.getClasses()
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