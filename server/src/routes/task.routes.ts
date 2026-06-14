import { Router } from "express";

import { deleteTask, updateTask } from "../controllers/task.controller";

const router = Router();

router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
