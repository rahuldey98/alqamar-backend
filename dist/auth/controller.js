"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const service_1 = require("./service");
const login = async (req, res) => {
    try {
        const { phone, password } = req.body || {};
        if (!phone || !password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const user = await service_1.AuthService.getUser(phone, password);
        res.status(200).json({ userName: user?.name });
    }
    catch (e) {
        return res.status(400).json({ error: e?.toString() });
    }
};
exports.login = login;
