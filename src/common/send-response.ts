import {Response} from "express";

interface ApiSuccessResponse<T> {
    status: "success";
    message?: string;
    data: T;
}

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
