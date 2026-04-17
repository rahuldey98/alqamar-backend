import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {authService} from "./service";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loginResult = await authService.login(req.body);
        sendResponse(res, loginResult);
    } catch (error) {
        next(error);
    }
};
