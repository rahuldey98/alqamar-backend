import {Router} from "express";
import {UserRole} from "@prisma/client";
import {createClasses, getClassAttendance, getClasses, getClassesById, getSchedules, getTodayClasses, updateClasses} from "./controller";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {createClassesSchema, getClassAttendanceSchema, updateClassesSchema} from "./schema";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";

const router = Router()

router.use(requireAuth);

router.post("/",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(createClassesSchema),
    createClasses
)

router.get("/", getClasses)

router.get("/today",
    requireRole(UserRole.TEACHER, UserRole.STUDENT),
    getTodayClasses
)

router.get("/schedules",
    requireRole(UserRole.TEACHER, UserRole.STUDENT),
    getSchedules
)

router.get("/attendance",
    requireRole(UserRole.ADMIN),
    validateRequest(getClassAttendanceSchema),
    getClassAttendance
)

router.patch("/:id",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(updateClassesSchema),
    updateClasses
)
router.get("/:id", getClassesById)


export default router
