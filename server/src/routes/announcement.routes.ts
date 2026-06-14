import { Router } from "express";

import { mockAnnouncements } from "../data/mockData";

const router = Router();

router.get("/", (_req, res) => {
  res.json(mockAnnouncements);
});

export default router;
