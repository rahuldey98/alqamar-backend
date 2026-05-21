import {Router} from "express";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {authRateLimiter} from "../../common/middleware/rate-limit.middleware";
import {loginUser} from "./controller";
import {loginSchema} from "./schema";

const router = Router();

router.post("/login", authRateLimiter, validateRequest(loginSchema), loginUser);

export default router;
