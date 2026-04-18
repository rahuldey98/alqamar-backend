import {Router} from "express";
import {UserRole} from "@prisma/client";
import {createCourse, getCourses, updateCourse} from "./controller";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {createCourseSchema, updateCourseSchema} from "./schema";

const router = Router()

router.post("/",
    requireAuth,
    requireRole(UserRole.ADMIN),
    validateRequest(createCourseSchema),
    createCourse
)

router.get("/", getCourses)

router.patch("/:id",
    requireAuth,
    requireRole(UserRole.ADMIN),
    validateRequest(updateCourseSchema),
    updateCourse
)


export default router
