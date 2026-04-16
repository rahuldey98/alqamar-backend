import type {NextFunction, Request, Response} from "express";
import {UserRequestDto} from "@rahuldey98/alqamar-models";
import {sendResponse} from "../../common/send-response";
import {userService} from "./service";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getAllUsers();
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
        const user = await userService.createUser(req.body as UserRequestDto);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};

export const patchUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUser(req.params.id as string, req.body as Partial<UserRequestDto>);
        sendResponse(res, user);
    } catch (e) {
        next(e);
    }
};
