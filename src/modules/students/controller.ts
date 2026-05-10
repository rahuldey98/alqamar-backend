import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {StudentService} from "./service";
import {getStudentsQuerySchema} from "./schema";

export const postStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const student = await StudentService.createStudent(req.body);
        sendResponse(res, student);
    } catch (e) {
        next(e);
    }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {limit} = getStudentsQuerySchema.parse(req.query);
        const students = await StudentService.getStudents(limit);
        sendResponse(res, students);
    } catch (e) {
        next(e);
    }
};

export const getStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const student = await StudentService.getStudentById(req.params.id as string);
        sendResponse(res, student);
    } catch (e) {
        next(e);
    }
};

export const patchStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const student = await StudentService.updateStudent(req.params.id as string, req.body);
        sendResponse(res, student);
    } catch (e) {
        next(e);
    }
};
