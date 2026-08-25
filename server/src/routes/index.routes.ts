import { Router } from "express";

import adminRoutes from "./admin.routes";
import announcementRoutes from "./announcement.routes";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import projectRoutes from "./project.routes";
import roadmapRoutes from "./roadmap.routes";
import skillRoutes from "./skill.routes";
import taskRoutes from "./task.routes";
import userRoutes from "./user.routes";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    message: "DevPilot API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/users", authMiddleware, userRoutes);
router.use("/dashboard", authMiddleware, dashboardRoutes);
router.use("/skills", authMiddleware, skillRoutes);
router.use("/projects", authMiddleware, projectRoutes);
router.use("/tasks", authMiddleware, taskRoutes);
router.use("/roadmaps", authMiddleware, roadmapRoutes);
router.use("/announcements", announcementRoutes);
router.use("/admin", adminRoutes);

export default router;
