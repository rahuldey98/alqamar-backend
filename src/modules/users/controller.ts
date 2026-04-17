import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {userService} from "./service";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getUsers();
        sendResponse(res, users);
    } catch (e) {
        next(e);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserById(req.params.id as string);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};

export const postUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.createUser(req.body);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};

export const patchUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUser(req.params.id as string, req.body);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};
