import type { NextFunction, Request, Response } from "express";

import * as roadmapService from "../services/roadmap.service";
import { getAuthUserId, getParam } from "./helpers";

export async function getRoadmaps(req: Request, res: Response, next: NextFunction) {
  try {
    const roadmaps = await roadmapService.getRoadmaps(getAuthUserId(req));
    res.json(roadmaps);
  } catch (error) {
    next(error);
  }
}

export async function generateRoadmap(req: Request, res: Response, next: NextFunction) {
  try {
    const roadmap = await roadmapService.generateRoadmap(getAuthUserId(req), req.body);
    res.status(201).json(roadmap);
  } catch (error) {
    next(error);
  }
}

export async function updateRoadmapProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const roadmap = await roadmapService.setWeekCompletion(
      getAuthUserId(req),
      getParam(req, "id"),
      req.body.week,
      req.body.completed,
    );
    res.json(roadmap);
  } catch (error) {
    next(error);
  }
}

export async function deleteRoadmap(req: Request, res: Response, next: NextFunction) {
  try {
    await roadmapService.deleteRoadmap(getAuthUserId(req), getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
