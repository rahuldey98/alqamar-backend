import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {
    createTeacherByStudent,
    getCurrentUser,
    getStudent,
    getStudents,
    getStudentsByTeacher,
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
    updateStudentByTeacher,
} from "./controller";
import {
    createAdminSchema,
    createStudentSchema,
    createTeacherSchema,
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
    getTeachers,
);

router.post(
    "/teachers/students",
    validateRequest(createStudentSchema),
    requireRole(UserRole.TEACHER),
    createTeacherByStudent
)

router.patch(
    "/teachers/students/:id",
    requireRole(UserRole.TEACHER),
    validateRequest(updateStudentSchema),
    updateStudentByTeacher
)
router.get("/teachers/students",
    requireRole(UserRole.TEACHER),
    getStudentsByTeacher,
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
