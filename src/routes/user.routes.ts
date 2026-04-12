import {Router} from "express";
import {authUser} from "../middleware/auth.middleware";
import {getUser, getUsers, patchUser, postUser} from "../controllers/user.controller";
import {validateRequest} from "../middleware/validate.middleware";
import {createUserSchema, updateUserSchema} from "../validators/user.validator";

const router = Router()

router.use(authUser)

router.get("/", getUsers)
router.get("/:id", getUser)
router.post("/", validateRequest(createUserSchema), postUser)
router.patch("/:id", validateRequest(updateUserSchema), patchUser)

export default router