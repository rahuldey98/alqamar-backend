"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("./controller");
const userRouter = express_1.default.Router();
userRouter.get('/', controller_1.getUser);
exports.default = userRouter;
//# sourceMappingURL=routes.js.map