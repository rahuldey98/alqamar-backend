import type {NextFunction, Request, Response} from "express";
import type {AuthRequest} from "../../common/auth-request";
import {sendResponse} from "../../common/send-response";
import {UserService} from "./service";
import {limitQuerySchema} from "./schema";

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

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getCurrentUser(req.user!.userId);
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

export const postAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin = await UserService.createAdmin(req.body);
        sendResponse(res, admin);
    } catch (e) {
        next(e);
    }
};

export const postTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await UserService.createTeacher(req.body);
        sendResponse(res, teacher);
    } catch (e) {
        next(e);
    }
};

export const getTeachers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {limit} = limitQuerySchema.parse(req.query);
        const teachers = await UserService.getTeachers(limit);
        sendResponse(res, teachers);
    } catch (e) {
        next(e);
    }
};

export const getTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await UserService.getTeacherById(req.params.id as string);
        sendResponse(res, teacher);
    } catch (e) {
        next(e);
    }
};

export const patchTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await UserService.updateTeacher(req.params.id as string, req.body);
        sendResponse(res, teacher);
    } catch (e) {
        next(e);
    }
};

export const postStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const student = await UserService.createStudent(req.body);
        sendResponse(res, student);
    } catch (e) {
        next(e);
    }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {limit} = limitQuerySchema.parse(req.query);
        const students = await UserService.getStudents(limit);
        sendResponse(res, students);
    } catch (e) {
        next(e);
    }
};

export const getStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const student = await UserService.getStudentById(req.params.id as string);
        sendResponse(res, student);
    } catch (e) {
        next(e);
    }
};

export const patchStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const student = await UserService.updateStudent(req.params.id as string, req.body);
        sendResponse(res, student);
    } catch (e) {
        next(e);
    }
};
