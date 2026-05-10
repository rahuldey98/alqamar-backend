import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {
    getCurrentUser,
    getStudent,
    getStudents,
    getTeacher,
    getTeachers,
    getUser,
    getUsers,
    patchCurrentUser,
    patchStudent,
    patchTeacher,
    patchUser,
    postAdmin,
    postStudent,
    postTeacher,
} from "./controller";
import {
    createAdminSchema,
    createStudentSchema,
    createTeacherSchema,
    limitQueryRequestSchema,
    updateCurrentUserSchema,
    updateStudentSchema,
    updateTeacherSchema,
    updateUserSchema,
} from "./schema";

const router = Router();

router.use(requireAuth);

router.post("/admins",
    requireRole(UserRole.ADMIN),
    validateRequest(createAdminSchema),
    postAdmin,
);

router.post("/teachers",
    requireRole(UserRole.ADMIN),
    validateRequest(createTeacherSchema),
    postTeacher,
);
router.get("/teachers",
    validateRequest(limitQueryRequestSchema),
    getTeachers,
);
router.get("/teachers/:id", getTeacher);
router.patch("/teachers/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateTeacherSchema),
    patchTeacher,
);

router.post("/students",
    requireRole(UserRole.ADMIN),
    validateRequest(createStudentSchema),
    postStudent,
);
router.get("/students",
    validateRequest(limitQueryRequestSchema),
    getStudents,
);
router.get("/students/:id", getStudent);
router.patch("/students/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateStudentSchema),
    patchStudent,
);

router.get("/",
    requireRole(UserRole.ADMIN),
    getUsers,
);

router.get("/me", getCurrentUser);

router.patch("/me",
    validateRequest(updateCurrentUserSchema),
    patchCurrentUser,
);

router.get("/:id", getUser);

router.patch("/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateUserSchema),
    patchUser,
);

export default router;
