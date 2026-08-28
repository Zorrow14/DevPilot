import { Router } from "express";

import { deleteTask, updateTask } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { updateTaskSchema } from "../validators/task.validator";

const router = Router();

router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);

export default router;
