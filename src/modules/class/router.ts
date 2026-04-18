import {Router} from "express";
import {createClasses, getClasses, getClassesById, updateClasses} from "./controller";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {createClassesSchema, updateClassesSchema} from "./schema";
import {authUser} from "../../common/middleware/auth.middleware";

const router = Router()

router.use(authUser);

router.post("/", validateRequest(createClassesSchema), createClasses)
router.get("/", getClasses)
router.patch("/:id", validateRequest(updateClassesSchema), updateClasses)
router.get("/:id", getClassesById)


export default router