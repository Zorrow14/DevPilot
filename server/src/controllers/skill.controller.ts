import type { NextFunction, Request, Response } from "express";

import * as skillService from "../services/skill.service";
import { getAuthUserId, getParam } from "./helpers";

export async function getSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const skills = await skillService.getSkills(getAuthUserId(req));
    res.json(skills);
  } catch (error) {
    next(error);
  }
}

export async function createSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const skill = await skillService.createSkill(getAuthUserId(req), req.body);
    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
}

export async function updateSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const skill = await skillService.updateSkill(
      getAuthUserId(req),
      getParam(req, "id"),
      req.body,
    );
    res.json(skill);
  } catch (error) {
    next(error);
  }
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction) {
  try {
    await skillService.deleteSkill(getAuthUserId(req), getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
