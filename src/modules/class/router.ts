import {Router} from "express";
import {UserRole} from "@prisma/client";
import {createClasses, getClasses, getClassesById, getHomeClasses, updateClasses} from "./controller";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {createClassesSchema, updateClassesSchema} from "./schema";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";

const router = Router()

router.use(requireAuth);

router.post("/",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(createClassesSchema),
    createClasses
)

router.get("/", getClasses)

router.get("/home",
    requireRole(UserRole.TEACHER, UserRole.STUDENT),
    getHomeClasses
)

router.patch("/:id",
    requireRole(UserRole.ADMIN, UserRole.TEACHER),
    validateRequest(updateClassesSchema),
    updateClasses
)
router.get("/:id", getClassesById)


export default router
