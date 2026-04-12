"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchUser = exports.postUser = exports.getUser = exports.getUsers = void 0;
const send_response_1 = require("../utils/send-response");
const user_service_1 = require("../services/user.service");
const getUsers = async (req, res, next) => {
    try {
        const users = await user_service_1.UserService.getAllUsers();
        (0, send_response_1.sendResponse)(res, users);
    }
    catch (e) {
        next(e);
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res, next) => {
    try {
        const user = await user_service_1.UserService.getUserById(req.params.id);
        (0, send_response_1.sendResponse)(res, user);
    }
    catch (e) {
        next(e);
    }
};
exports.getUser = getUser;
const postUser = async (req, res, next) => {
    try {
        const user = await user_service_1.UserService.createUser(req.body);
        (0, send_response_1.sendResponse)(res, user);
    }
    catch (e) {
        next(e);
    }
};
exports.postUser = postUser;
const patchUser = async (req, res, next) => {
    try {
        const user = await user_service_1.UserService.updateUser(req.params.id, req.body);
        (0, send_response_1.sendResponse)(res, user);
    }
    catch (e) {
        next(e);
    }
};
exports.patchUser = patchUser;
//# sourceMappingURL=user.controller.js.map