import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../utils/send-response";
import {AuthService} from "../services/auth.service";
import { LoginRequestDto } from "@rahuldey98/alqamar-models";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loginResult = await AuthService.login(req.body as LoginRequestDto)
        sendResponse(res, loginResult)
    } catch (error) {
        next(error)
    }
}
