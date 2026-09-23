import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

import apiRoutes from "./routes/index.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { apiLimiter } from "./middleware/rateLimit.middleware";

dotenv.config();

const app = express();

// Managed hosts (Render, Fly, a reverse proxy) put exactly one hop in front of
// the app. Without this, req.ip is the proxy's address and every caller shares
// one rate-limit bucket; with a permissive `true`, a client could spoof
// X-Forwarded-For and mint a fresh bucket per request. One hop is the honest
// description of the deployment.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
  res.json({
    message: "DevPilot API is running",
  });
});

app.use("/api", apiLimiter, apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
