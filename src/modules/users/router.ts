import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getUser, getUsers, patchUser, postUser} from "./controller";
import {createUserSchema, updateUserSchema} from "./schema";

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN));

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", validateRequest(createUserSchema), postUser);
router.patch("/:id", validateRequest(updateUserSchema), patchUser);

export default router;
