import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ================================
   ✅ FINAL CORS CONFIG (FIXED)
================================ */
const allowedOrigins = [
  "https://hr-system-eta.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ✅ VERY IMPORTANT – allow preflight */
app.options("*", cors());

/* ================================
   MIDDLEWARES
================================ */
app.use(express.json());

const cvUploadPath = path.join(__dirname, "uploads/cv");
if (!fs.existsSync(cvUploadPath)) {
  fs.mkdirSync(cvUploadPath, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================================
   ROUTES
================================ */
import applicantRoutes from "./routes/applicantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/applicants", applicantRoutes);
app.use("/api/admin", adminRoutes);

/* ================================
   DATABASE
================================ */
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "hr_system_db",
  })
  .then(() => console.log("🔥 MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ================================
   ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
