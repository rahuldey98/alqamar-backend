"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../prisma/prisma");
class UserService {
    static async getUser() {
        return prisma_1.prisma.users.findMany();
    }
}
exports.UserService = UserService;
//# sourceMappingURL=service.js.map