"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, data) => {
    const response = {
        status: 'success',
        message: undefined,
        data
    };
    return res.status(200).json(response);
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=send-response.js.map