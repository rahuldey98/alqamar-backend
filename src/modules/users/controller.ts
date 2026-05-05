import type {NextFunction, Request, Response} from "express";
import type {AuthRequest} from "../../common/auth-request";
import {sendResponse} from "../../common/send-response";
import {UserService} from "./service";
import {getUsersQuerySchema} from "./schema";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserService.getUsers();
        sendResponse(res, users);
    } catch (e) {
        next(e);
    }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {limit} = getUsersQuerySchema.parse(req.query);
        const students = await UserService.getStudents(limit);
        sendResponse(res, students);
    } catch (e) {
        next(e);
    }
};

export const getTeachers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {limit} = getUsersQuerySchema.parse(req.query);
        const teachers = await UserService.getTeachers(limit);
        sendResponse(res, teachers);
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

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getCurrentUser(req.user!.userId);
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

export const patchCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.updateCurrentUser(req.user!.userId, req.body);
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
