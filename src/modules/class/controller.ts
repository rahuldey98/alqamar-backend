import {Request, Response, NextFunction} from "express"
import {classService} from "./service";
import {sendResponse} from "../../common/send-response";

export const createClasses = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const createdClasses = await classService.createClasses(req.body)
        sendResponse(res, createdClasses)
    }catch (e) {
        next(e)
    }
}