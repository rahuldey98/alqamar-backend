"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validator_1 = require("../validators/auth.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.post("/login", (0, validate_middleware_1.validateRequest)(auth_validator_1.loginSchema), auth_controller_1.loginUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map