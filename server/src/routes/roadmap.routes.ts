import { Router } from "express";

import { mockRoadmaps } from "../data/mockData";

const router = Router();

router.get("/", (_req, res) => {
  res.json(mockRoadmaps);
});

export default router;
