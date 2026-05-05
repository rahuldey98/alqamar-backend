import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {getOverview} from "./controller";

const router = Router();

router.use(requireAuth);

router.get("/overview", requireRole(UserRole.ADMIN), getOverview);

export default router;
