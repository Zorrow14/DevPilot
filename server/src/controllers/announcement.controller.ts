import type { NextFunction, Request, Response } from "express";

import * as announcementService from "../services/announcement.service";
import { getAuthUserId, getParam } from "./helpers";

export async function getAnnouncements(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await announcementService.getAnnouncements());
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const announcement = await announcementService.createAnnouncement(
      getAuthUserId(req),
      req.body,
    );
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function updateAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const announcement = await announcementService.updateAnnouncement(
      getParam(req, "id"),
      req.body,
    );
    res.json(announcement);
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    await announcementService.deleteAnnouncement(getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
