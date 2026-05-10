import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {postAdmin} from "./controller";
import {createAdminSchema} from "./schema";

const router = Router();

router.use(requireAuth);

router.post("/",
    requireRole(UserRole.ADMIN),
    validateRequest(createAdminSchema),
    postAdmin,
);

export default router;
