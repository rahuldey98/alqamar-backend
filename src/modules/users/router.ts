import {Router} from "express";
import {UserRole} from "@prisma/client";
import {requireAuth, requireRole} from "../../common/middleware/auth.middleware";
import {validateRequest} from "../../common/middleware/validate.middleware";
import {getStudents, getUser, getUsers, patchUser, postUser} from "./controller";
import {createUserSchema, getStudentsSchema, updateUserSchema} from "./schema";

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

router.get("/:id", getUser);

router.post("/",
    requireRole(UserRole.ADMIN),
    validateRequest(createUserSchema),
    postUser
);
router.patch("/:id",
    requireRole(UserRole.ADMIN),
    validateRequest(updateUserSchema),
    patchUser
);


export default router;
