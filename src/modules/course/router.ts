import {Router} from "express";
import {createCourse, getCourses, updateCourse} from "./controller";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {createCourseSchema, updateCourseSchema} from "./schema";
import {updateUserSchema} from "../users/schema";

const router = Router()

router.post("/", validateRequest(createCourseSchema), createCourse)
router.get("/", getCourses)
router.patch("/:id", validateRequest(updateCourseSchema), updateCourse)


export default router