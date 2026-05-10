import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getStudent, getStudents, patchStudent, postStudent} from "./controller";
import {createStudentSchema, getStudentsQueryRequestSchema, updateStudentSchema} from "./schema";

const router = Router();

router.use(requireAuth);

router.post("/",
    requireRole(UserRole.ADMIN),
    validateRequest(createStudentSchema),
    postStudent,
);

router.get("/",
    validateRequest(getStudentsQueryRequestSchema),
    getStudents,
);

router.get("/:id", getStudent);

router.patch("/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateStudentSchema),
    patchStudent,
);

export default router;
