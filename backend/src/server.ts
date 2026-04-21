import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server as SocketServer } from "socket.io";

import { pool, testConnection } from "./db/pool";
import { runMigrations } from "./db/migrate";

import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import matchRoutes from "./routes/match";
import chatRoutes from "./routes/chat";
import newsRoutes from "./routes/news";
import subscriptionRoutes from "./routes/subscription";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";

import { errorHandler } from "./middleware/error";
import { setupSocket } from "./socket";

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──
const io = new SocketServer(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true },
});
setupSocket(io);

// ── Middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "./uploads"));

// ── Routes ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// ── Error handler ──
app.use(errorHandler);

// ── Start ──
const PORT = parseInt(process.env.PORT || "5000", 10);

async function start() {
  await testConnection();
  await runMigrations();
  server.listen(PORT, () => {
    console.log(`🚀 Maratha API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export { app, io };
