"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authUser);
router.get("/", user_controller_1.getUsers);
router.get("/:id", user_controller_1.getUser);
router.post("/", (0, validate_middleware_1.validateRequest)(user_validator_1.createUserSchema), user_controller_1.postUser);
router.patch("/:id", (0, validate_middleware_1.validateRequest)(user_validator_1.updateUserSchema), user_controller_1.patchUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map