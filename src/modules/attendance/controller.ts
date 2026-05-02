import type {NextFunction, Response} from "express";
import {AuthRequest} from "../../common/auth-request";
import {sendResponse} from "../../common/send-response";
import {AttendanceService} from "./service";
import {UserRole} from "@prisma/client";
import {GetAttendanceRequest} from "@rahuldey98/alqamar-models/dist/attendance/get-attendance";

export const postAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const attendance = await AttendanceService.markAttendance(
            Number(req.user!.userId),
            req.user!.role,
            req.body,
        );
        sendResponse(res, attendance);
    } catch (e) {
        next(e);
    }
};

export const getTeacherAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const attendance = await AttendanceService.getAttendanceLog(
            Number(req.params.id),
            UserRole.TEACHER,
            req.query as unknown as GetAttendanceRequest,
        );
        sendResponse(res, attendance);
    } catch (e) {
        next(e);
    }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const attendance = await AttendanceService.getAttendanceLog(
            Number(req.params.id),
            UserRole.STUDENT,
            req.query as unknown as GetAttendanceRequest,
        );
        sendResponse(res, attendance);
    } catch (e) {
        next(e);
    }
};
