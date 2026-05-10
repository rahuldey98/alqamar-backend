import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getCurrentUser, getUser, getUsers, patchCurrentUser, patchUser} from "./controller";
import {updateCurrentUserSchema, updateUserSchema} from "./schema";
import teacherRoutes from "../teachers/router";
import studentRoutes from "../students/router";

const router = Router();

router.use(requireAuth);

router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);

router.get("/",
    requireRole(UserRole.ADMIN),
    getUsers
)

router.get("/me", getCurrentUser);

router.get("/:id", getUser);

router.patch("/me",
    validateRequest(updateCurrentUserSchema),
    patchCurrentUser
);

router.patch("/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateUserSchema),
    patchUser
);


export default router;
