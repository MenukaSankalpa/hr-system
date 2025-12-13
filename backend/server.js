import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";


import path from "path";

// Serve React frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist"))); // Vite build folder

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Load env
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --------------------------------
// MIDDLEWARE
// --------------------------------
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Create upload directory if not exist
const cvUploadPath = path.join(__dirname, "uploads/cv");

if (!fs.existsSync(cvUploadPath)) {
  fs.mkdirSync(cvUploadPath, { recursive: true });
  console.log("📁 Created folder: uploads/cv");
}

// Static file hosting
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// --------------------------------
// ROUTES
// --------------------------------
import applicantRoutes from "./routes/applicantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/applicants", applicantRoutes);
app.use("/api/admin", adminRoutes);

// --------------------------------
// MONGOOSE CONNECT
// --------------------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "hr_system_db",
  })
  .then(() => console.log("🔥 MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Caught by Error Middleware:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------------------------
// START SERVER (Railway requires dynamic port!!!)
// --------------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
