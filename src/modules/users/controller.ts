import type {NextFunction, Request, Response} from "express";
import type {AuthRequest} from "../../common/auth-request";
import {sendResponse} from "../../common/send-response";
import {AppError} from "../../common/app-error";
import {UserService} from "./service";
import {UserRole} from "@prisma/client";

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
        const teachers = await UserService.getTeachers();
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
        const students = await UserService.getStudents();
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

export const getStudentsByTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = parseInt(req.user!.userId);
        if (req.user!.role === UserRole.TEACHER && req.user!.userId !== String(teacherId)) {
            throw new AppError("Forbidden", 403);
        }
        const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
        const students = await UserService.getStudentsByTeacher(teacherId, courseId);
        sendResponse(res, students);
    } catch (e) {
        next(e);
    }
};

export const createTeacherByStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = parseInt(req.user!.userId)
        const studentData = {
            ...req.body,
            teacherId
        }
        const student = await UserService.createStudent(studentData)
        sendResponse(res, student)
    } catch (e) {
        next(e)
    }
}

export const updateStudentByTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = parseInt(req.user!.userId)
        const studentId = parseInt((req.params.id as string))
        const student = await UserService.getStudentById(String(studentId))
        if (student.teacherId !== teacherId) {
            throw new AppError("Forbidden: You do not manage this student", 403);
        }
        const updatedStudent = await UserService.updateStudent(String(studentId), req.body);
        sendResponse(res, updatedStudent);
    } catch (e) {
        next(e)
    }
}
