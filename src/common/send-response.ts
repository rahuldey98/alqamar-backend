import {ApiSuccessResponse} from "@rahuldey98/alqamar-models";
import {Response} from "express";

export const sendResponse = <T>(
    res: Response,
    data: T,
) => {
    const response: ApiSuccessResponse<T> = {
        status: "success",
        message: undefined,
        data,
    };
    return res.status(200).json(response);
};
