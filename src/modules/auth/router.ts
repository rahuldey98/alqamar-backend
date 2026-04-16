import {Router} from "express";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {loginUser} from "./controller";
import {loginSchema} from "./schema";

const router = Router();

router.post("/login", validateRequest(loginSchema), loginUser);

export default router;
