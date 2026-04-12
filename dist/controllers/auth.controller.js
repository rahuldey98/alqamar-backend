"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const send_response_1 = require("../utils/send-response");
const auth_service_1 = require("../services/auth.service");
const loginUser = async (req, res, next) => {
    try {
        const loginResult = await auth_service_1.AuthService.login(req.body);
        (0, send_response_1.sendResponse)(res, loginResult);
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.controller.js.map