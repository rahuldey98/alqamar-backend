import {Router} from "express";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {loginUser} from "./auth.controller";
import {loginSchema} from "./auth.validator";

const router = Router();

router.post("/login", validateRequest(loginSchema), loginUser);

export default router;
