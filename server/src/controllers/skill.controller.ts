import type { NextFunction, Request, Response } from "express";

import * as skillService from "../services/skill.service";

function getSkillId(req: Request) {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new Error("Skill id is required.");
  }

  return id;
}

export async function getSkills(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const skills = await skillService.getSkills();
    res.json(skills);
  } catch (error) {
    next(error);
  }
}

export async function createSkill(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const skill = await skillService.createSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
}

export async function updateSkill(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const skill = await skillService.updateSkill(getSkillId(req), req.body);
    res.json(skill);
  } catch (error) {
    next(error);
  }
}

export async function deleteSkill(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await skillService.deleteSkill(getSkillId(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
