import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getStudentAttendance, getTeacherAttendance, postAttendance} from "./controller";
import {markAttendanceSchema} from "@rahuldey98/alqamar-models/dist/attendance/mark-attendance";
import {getAttendanceSchema} from "@rahuldey98/alqamar-models/dist/attendance/get-attendance";


const router = Router();

router.use(requireAuth);

router.post("/",
    requireRole(UserRole.TEACHER, UserRole.STUDENT),
    validateRequest(markAttendanceSchema),
    postAttendance,
);

router.get("/teacher/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(getAttendanceSchema),
    getTeacherAttendance,
);

router.get("/student/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(getAttendanceSchema),
    getStudentAttendance,
);

export default router;
