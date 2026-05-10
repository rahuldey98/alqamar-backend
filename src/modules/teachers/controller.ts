import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {TeacherService} from "./service";
import {getTeachersQuerySchema} from "./schema";

export const postTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await TeacherService.createTeacher(req.body);
        sendResponse(res, teacher);
    } catch (e) {
        next(e);
    }
};

export const getTeachers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {limit} = getTeachersQuerySchema.parse(req.query);
        const teachers = await TeacherService.getTeachers(limit);
        sendResponse(res, teachers);
    } catch (e) {
        next(e);
    }
};

export const getTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await TeacherService.getTeacherById(req.params.id as string);
        sendResponse(res, teacher);
    } catch (e) {
        next(e);
    }
};

export const patchTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await TeacherService.updateTeacher(req.params.id as string, req.body);
        sendResponse(res, teacher);
    } catch (e) {
        next(e);
    }
};
