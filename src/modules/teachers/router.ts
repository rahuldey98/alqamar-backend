import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getTeacher, getTeachers, patchTeacher, postTeacher} from "./controller";
import {createTeacherSchema, getTeachersQueryRequestSchema, updateTeacherSchema} from "./schema";

const router = Router();

router.use(requireAuth);

router.post("/",
    requireRole(UserRole.ADMIN),
    validateRequest(createTeacherSchema),
    postTeacher,
);

router.get("/",
    validateRequest(getTeachersQueryRequestSchema),
    getTeachers,
);

router.get("/:id", getTeacher);

router.patch("/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateTeacherSchema),
    patchTeacher,
);

export default router;
