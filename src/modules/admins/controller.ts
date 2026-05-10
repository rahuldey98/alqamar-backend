import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {AdminService} from "./service";

export const postAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await AdminService.createAdmin(req.body);
        sendResponse(res, admin);
    } catch (e) {
        next(e);
    }
};
