import {Router} from "express";
import {createClasses} from "./controller";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {createClassesSchema} from "./schema";

const router = Router()

router.post("/", validateRequest(createClassesSchema), createClasses)


export default router