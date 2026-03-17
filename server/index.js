require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/taskRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/campusflow";

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/tasks", taskRoutes);
app.use("/api", scheduleRoutes);

// ─── Health check & Root ───────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("CampusFlow API running 🚀");
});

app.get("/api", (_req, res) => {
  res.json({ message: "CampusFlow API is active. Access endpoints like /tasks or /schedule" });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    port: PORT,
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ─── MongoDB + start server ────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB connected`);
    app.listen(PORT, () =>
      console.log(`🚀 CampusFlow backend → http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error(`❌ MongoDB failed: ${err.message}`);
    console.warn(`⚠️  Starting WITHOUT database — tasks won't persist`);
    app.listen(PORT, () =>
      console.log(`🚀 CampusFlow backend (no DB) → http://localhost:${PORT}`)
    );
  });
