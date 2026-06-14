import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import apiRoutes from "./routes/index.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "DevPilot API is running",
  });
});

app.use("/api", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
