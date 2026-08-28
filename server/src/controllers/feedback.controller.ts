import type { NextFunction, Request, Response } from "express";

import * as feedbackService from "../services/feedback.service";
import { getAuthUserId, getParam } from "./helpers";

export async function getMyFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.getMyFeedback(getAuthUserId(req));
    res.json(feedback);
  } catch (error) {
    next(error);
  }
}

export async function createFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.createFeedback(getAuthUserId(req), req.body);
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
}

export async function deleteMyFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    await feedbackService.deleteMyFeedback(getAuthUserId(req), getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getAllFeedback(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await feedbackService.getAllFeedback());
  } catch (error) {
    next(error);
  }
}

export async function updateFeedbackStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.updateFeedbackStatus(
      getParam(req, "id"),
      req.body.status,
    );
    res.json(feedback);
  } catch (error) {
    next(error);
  }
}
