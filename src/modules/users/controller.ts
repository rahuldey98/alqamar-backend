import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {UserService} from "./service";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserService.getUsers();
        sendResponse(res, users);
    } catch (e) {
        next(e);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getUserById(req.params.id as string);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};

export const postUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.createUser(req.body);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};

export const patchUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.updateUser(req.params.id as string, req.body);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};
