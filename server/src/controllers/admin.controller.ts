import type { NextFunction, Request, Response } from "express";

import * as adminService from "../services/admin.service";
import * as announcementService from "../services/announcement.service";
import * as feedbackService from "../services/feedback.service";
import { getAuthUserId, getParam } from "./helpers";
import type {
  AdminProjectQuery,
  AdminSkillQuery,
  AdminUserQuery,
} from "../validators/admin.validator";

/**
 * Preview rows per list on the overview screen. The overview shows the top of
 * each table and links to the full listing, so it takes a first page rather
 * than the whole table — the headline numbers come from getPlatformStats(),
 * which counts in the database instead of in memory.
 */
const OVERVIEW_PREVIEW_SIZE = 10;

export async function getOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const preview = { page: 1, pageSize: OVERVIEW_PREVIEW_SIZE };

    const [stats, users, projects, skills, roadmaps, feedback, announcements] = await Promise.all([
      adminService.getPlatformStats(),
      adminService.getUsers(preview),
      adminService.getProjects(preview),
      adminService.getSkills(preview),
      adminService.getRoadmapAnalytics(),
      feedbackService.getAllFeedback(),
      announcementService.getAnnouncements(),
    ]);

    // Unwrapped to plain arrays: the overview's shape predates paging and its
    // consumers render previews, not paged tables.
    res.json({
      stats,
      users: users.data,
      projects: projects.data,
      skills: skills.data,
      roadmaps,
      feedback,
      announcements,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, page, pageSize } = req.query as unknown as AdminUserQuery;
    res.json(await adminService.getUsers({ search, page, pageSize }));
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.updateUserRole(
      getAuthUserId(req),
      getParam(req, "id"),
      req.body.role,
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.updateUserStatus(
      getAuthUserId(req),
      getParam(req, "id"),
      req.body.status,
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, priority, page, pageSize } = req.query as unknown as AdminProjectQuery;
    res.json(await adminService.getProjects({ status, priority, page, pageSize }));
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteProject(getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, pageSize } = req.query as unknown as AdminSkillQuery;
    res.json(await adminService.getSkills({ page, pageSize }));
  } catch (error) {
    next(error);
  }
}

export async function getSkillAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getSkillAnalytics());
  } catch (error) {
    next(error);
  }
}

export async function getRoadmaps(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getRoadmapAnalytics());
  } catch (error) {
    next(error);
  }
}
