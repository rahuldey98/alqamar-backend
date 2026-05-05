import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getCurrentUser, getStudents, getTeachers, getUser, getUsers, patchCurrentUser, patchUser, postUser} from "./controller";
import {createUserSchema, getUsersQueryRequestSchema, updateCurrentUserSchema, updateUserSchema} from "./schema";

const router = Router();

router.use(requireAuth);

router.get("/",
    requireRole(UserRole.ADMIN),
    getUsers
)

router.get("/students",
    validateRequest(getUsersQueryRequestSchema),
    getStudents
);

router.get("/teachers",
    validateRequest(getUsersQueryRequestSchema),
    getTeachers
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
