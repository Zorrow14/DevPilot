import { Router } from "express";

import { getMe, updateMe } from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/user.validator";

const router = Router();

router.get("/me", getMe);
router.patch("/me", validate(updateProfileSchema), updateMe);

export default router;
