"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const service_1 = require("./service");
const getUser = async (req, res) => {
    try {
        const user = await service_1.UserService.getUser();
        res.status(200)
            .json({
            user
        });
    }
    catch (e) {
        throw res.status(500)
            .json({
            error: e?.toString()
        });
    }
};
exports.getUser = getUser;
//# sourceMappingURL=controller.js.map