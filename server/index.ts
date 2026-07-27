import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initializeDatabase } from "./db.js";
import { initializeEmailService } from "./email.js";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import uploadRouter from "./upload.js";
import { apiLimiter, loginLimiter, registerLimiter } from "./rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ---------------------------------------------------------------------------
  // Database
  // ---------------------------------------------------------------------------
  initializeDatabase();
  console.log("✓ Database initialized");

  // ---------------------------------------------------------------------------
  // Email Service
  // ---------------------------------------------------------------------------
  initializeEmailService();

  // ---------------------------------------------------------------------------
  // Security headers (minimal, no extra dependency required)
  // ---------------------------------------------------------------------------
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    next();
  });

  // ---------------------------------------------------------------------------
  // Body parsing
  // ---------------------------------------------------------------------------
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // ---------------------------------------------------------------------------
  // Rate limiting
  // ---------------------------------------------------------------------------

  // General limiter applied to all /api/* routes
  app.use("/api", apiLimiter);

  // Stricter limiters on auth endpoints
  app.use("/api/auth/login", loginLimiter);
  app.use("/api/auth/register", registerLimiter);

  // ---------------------------------------------------------------------------
  // API routes
  // ---------------------------------------------------------------------------
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/upload", uploadRouter);

  // ---------------------------------------------------------------------------
  // Static file serving (production build)
  // ---------------------------------------------------------------------------
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Serve property uploads
  const uploadPath = path.resolve(__dirname, "..", "data", "uploads");
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  app.use("/uploads", express.static(uploadPath));

  // Handle client-side routing – serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`✓ Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
