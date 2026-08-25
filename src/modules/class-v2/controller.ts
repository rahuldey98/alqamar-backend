import {NextFunction, Response} from "express";
import {AuthRequest} from "../../common/auth-request";
import {sendResponse} from "../../common/send-response";
import {ClassV2Service} from "./service";

export const createClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacherId = Number(req.user!.userId);
        const created = await ClassV2Service.createClass(teacherId, req.body);
        sendResponse(res, created);
    } catch (e) {
        next(e);
    }
};

export const getActiveClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.user!.userId);
        const role = req.user!.role;
        const classes = await ClassV2Service.getActiveOrUpcomingClasses(userId, role);
        sendResponse(res, classes);
    } catch (e) {
        next(e);
    }
};

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const classId = Number(req.params.id);
        const userId = Number(req.user!.userId);
        const role = req.user!.role;
        const result = await ClassV2Service.markAttendance(classId, userId, role, req.body);
        sendResponse(res, result);
    } catch (e) {
        next(e);
    }
};

export const getAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.user!.userId);
        const role = req.user!.role;
        const date = req.query.date as string | undefined;
        const records = await ClassV2Service.getAttendanceByDate(userId, role, date);
        sendResponse(res, records);
    } catch (e) {
        next(e);
    }
};

export const getClassById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const classId = Number(req.params.id);
        const cls = await ClassV2Service.getClassById(classId);
        sendResponse(res, cls);
    } catch (e) {
        next(e);
    }
};