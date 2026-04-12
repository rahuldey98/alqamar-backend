"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./controller");
const express_1 = __importDefault(require("express"));
const authRouter = express_1.default.Router();
authRouter.post("/login", controller_1.login);
exports.default = authRouter;
