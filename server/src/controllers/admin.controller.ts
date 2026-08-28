import type { NextFunction, Request, Response } from "express";

import * as adminService from "../services/admin.service";
import * as announcementService from "../services/announcement.service";
import * as feedbackService from "../services/feedback.service";
import { getAuthUserId, getParam } from "./helpers";

export async function getOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const [stats, users, projects, skills, roadmaps, feedback, announcements] = await Promise.all([
      adminService.getPlatformStats(),
      adminService.getUsers(),
      adminService.getProjects(),
      adminService.getSkills(),
      adminService.getRoadmapAnalytics(),
      feedbackService.getAllFeedback(),
      announcementService.getAnnouncements(),
    ]);

    res.json({ stats, users, projects, skills, roadmaps, feedback, announcements });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search } = req.query as { search?: string };
    res.json(await adminService.getUsers(search));
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
    const { status, priority } = req.query as { status?: string; priority?: string };
    res.json(await adminService.getProjects({ status, priority }));
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

export async function getSkills(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getSkills());
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
