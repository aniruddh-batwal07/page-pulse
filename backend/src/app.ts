import express from "express";
import cors from "cors";

import healthRoute from "./routes/health.route.js";
import auditRoute from "./routes/audit.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/health", healthRoute);
app.use("/api/v1/audit", auditRoute);

app.use(errorHandler);

export default app;