import { Router } from "express";

import { syncUser } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/sync-user", authMiddleware, syncUser);

export default router;
