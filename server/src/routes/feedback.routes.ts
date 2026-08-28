import { Router } from "express";

import {
  createFeedback,
  deleteMyFeedback,
  getMyFeedback,
} from "../controllers/feedback.controller";
import { validate } from "../middleware/validate.middleware";
import { createFeedbackSchema } from "../validators/feedback.validator";

const router = Router();

router.get("/", getMyFeedback);
router.post("/", validate(createFeedbackSchema), createFeedback);
router.delete("/:id", deleteMyFeedback);

export default router;
