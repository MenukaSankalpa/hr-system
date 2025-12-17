import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// ----------------------
// Load environment variables
// ----------------------
dotenv.config();

// ----------------------
// Fix __dirname for ES modules
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// Initialize Express app
// ----------------------
const app = express();

// ----------------------
// CORS Setup (allow frontend)
// ----------------------
app.use(
  cors({
    origin: "https://hr-system-eta.vercel.app/", // <-- replace with your Vercel frontend URL
    credentials: true, // allow cookies / auth headers
  })
);

// ----------------------
// Middleware: parse JSON
// ----------------------
app.use(express.json());

// ----------------------
// Create upload directory if it doesn't exist
// ----------------------
const cvUploadPath = path.join(__dirname, "uploads/cv");
if (!fs.existsSync(cvUploadPath)) {
  fs.mkdirSync(cvUploadPath, { recursive: true });
  console.log("📁 Created folder: uploads/cv");
}

// ----------------------
// Static file hosting for uploads
// ----------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------------------
// Import routes
// ----------------------
import applicantRoutes from "./routes/applicantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/applicants", applicantRoutes);
app.use("/api/admin", adminRoutes);

// ----------------------
// Connect to MongoDB
// ----------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "hr_system_db",
  })
  .then(() => console.log("🔥 MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ----------------------
// Global error handler
// ----------------------
app.use((err, req, res, next) => {
  console.error("❌ Caught by Error Middleware:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
