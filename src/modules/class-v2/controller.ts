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

export const updateClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const classId = Number(req.params.id);
        const userId = Number(req.user!.userId);
        const role = req.user!.role;
        const updated = await ClassV2Service.updateClass(classId, userId, role, req.body);
        sendResponse(res, updated);
    } catch (e) {
        next(e);
    }
};

export const deleteClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const classId = Number(req.params.id);
        const userId = Number(req.user!.userId);
        const role = req.user!.role;
        const deleted = await ClassV2Service.deleteClass(classId, userId, role);
        sendResponse(res, deleted);
    } catch (e) {
        next(e);
    }
};

export const getAttendanceSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.user!.userId);
        const role = req.user!.role;
        const month = req.query.month as string;
        const teacherId = req.query.teacherId ? Number(req.query.teacherId) : undefined;
        const result = await ClassV2Service.getAttendanceSummary(userId, role, month, teacherId);
        sendResponse(res, result);
    } catch (e) {
        next(e);
    }
};

export const reconcileAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const count = await ClassV2Service.reconcileUnattendedClasses();
        sendResponse(res, {
            message: "Attendance reconciled successfully",
            markedAbsentCount: count,
        });
    } catch (e) {
        next(e);
    }
};