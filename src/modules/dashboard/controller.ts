import type {NextFunction, Request, Response} from "express";
import {sendResponse} from "../../common/send-response";
import {DashboardService} from "./service";

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const overview = await DashboardService.getOverview();
        sendResponse(res, overview);
    } catch (e) {
        next(e);
    }
};
