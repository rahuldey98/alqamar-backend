import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {
    createClassV2Schema,
    deleteClassV2Schema,
    getAttendanceSchema,
    markAttendanceSchema,
    updateClassV2Schema
} from "./schema";
import {
    createClass,
    deleteClass,
    getActiveClasses,
    getAttendance,
    getClassById,
    markAttendance,
    updateClass
} from "./controller";

const router = Router();

router.use(requireAuth);

// 1. Create a daily ad-hoc class for today in IST
router.post(
    "/",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(createClassV2Schema),
    createClass
);

// 2. Get active/upcoming classes for today in IST
router.get(
    "/",
    requireRole(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
    getActiveClasses
);

// 3. Get attendance by date in IST (?date=YYYY-MM-DD)
router.get(
    "/attendance",
    requireRole(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
    validateRequest(getAttendanceSchema),
    getAttendance
);

// 4. Mark attendance for a class (supports both POST and PATCH)
router.patch(
    "/:id/attendance",
    requireRole(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
    validateRequest(markAttendanceSchema),
    markAttendance
);

// 5. Get class by ID
router.get(
    "/:id",
    requireRole(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
    getClassById
);

// 6. Update class by ID
router.patch(
    "/:id",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(updateClassV2Schema),
    updateClass
);

// 7. Delete class by ID (soft-delete)
router.delete(
    "/:id",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(deleteClassV2Schema),
    deleteClass
);

export default router;