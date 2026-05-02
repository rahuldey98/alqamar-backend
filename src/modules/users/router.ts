import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getCurrentUser, getStudents, getUser, getUsers, patchCurrentUser, patchUser, postUser} from "./controller";
import {createUserSchema, getStudentsSchema, updateCurrentUserSchema, updateUserSchema} from "./schema";

const router = Router();

router.use(requireAuth);

router.get("/",
    requireRole(UserRole.ADMIN),
    getUsers
)

router.get("/students",
    validateRequest(getStudentsSchema),
    getStudents
);

router.get("/me", getCurrentUser);

router.get("/:id", getUser);

router.post("/",
    requireRole(UserRole.ADMIN),
    validateRequest(createUserSchema),
    postUser
);

router.patch("/me",
    validateRequest(updateCurrentUserSchema),
    patchCurrentUser
);

router.patch("/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateUserSchema),
    patchUser
);


export default router;
