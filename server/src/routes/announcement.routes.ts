import { Router } from "express";

import { getAnnouncements } from "../controllers/announcement.controller";

const router = Router();

// Read-only for regular users; the write endpoints live under /api/admin,
// behind requireAdmin.
router.get("/", getAnnouncements);

export default router;
