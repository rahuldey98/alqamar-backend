import {Router} from "express";
import {loginUser} from "../controllers/auth.controller";
import {loginSchema} from "../validators/auth.validator";
import {validateRequest} from "../middleware/validate.middleware";

const router = Router()

router.post("/login", validateRequest(loginSchema), loginUser)

export default router