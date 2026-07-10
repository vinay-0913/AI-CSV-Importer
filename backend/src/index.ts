import "dotenv/config";
import express from "express";
import cors from "cors";
import csvRoutes from "./routes/csv.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "GrowEasy CSV Importer API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/csv", csvRoutes);

// ─── Error Handler ──────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   GrowEasy CSV Importer API                  ║
  ║   Running on http://localhost:${PORT}           ║
  ║   Environment: ${process.env.NODE_ENV ?? "development"}             ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
