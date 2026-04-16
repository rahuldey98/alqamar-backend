import type {NextFunction, Request, Response} from "express";
import {LoginRequestDto} from "@rahuldey98/alqamar-models";
import {sendResponse} from "../../common/send-response";
import {authService} from "./service";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loginResult = await authService.login(req.body as LoginRequestDto);
        sendResponse(res, loginResult);
    } catch (error) {
        next(error);
    }
};
