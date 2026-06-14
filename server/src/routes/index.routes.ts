import { Router } from "express";

import adminRoutes from "./admin.routes";
import announcementRoutes from "./announcement.routes";
import dashboardRoutes from "./dashboard.routes";
import projectRoutes from "./project.routes";
import roadmapRoutes from "./roadmap.routes";
import skillRoutes from "./skill.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    message: "DevPilot API is running",
  });
});

router.use("/dashboard", dashboardRoutes);
router.use("/skills", skillRoutes);
router.use("/projects", projectRoutes);
router.use("/roadmaps", roadmapRoutes);
router.use("/announcements", announcementRoutes);
router.use("/admin", adminRoutes);

export default router;
