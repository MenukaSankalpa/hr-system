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

// ----------------------
// ⭐ FIXED CORS SETUP
// ----------------------
const allowedOrigins = [
  "https://hr-system-eta.vercel.app", // No trailing slash
  "http://localhost:5173",            // Common Vite local port
  "http://localhost:3000"             // Common React local port
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

const cvUploadPath = path.join(__dirname, "uploads/cv");
if (!fs.existsSync(cvUploadPath)) {
  fs.mkdirSync(cvUploadPath, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
import applicantRoutes from "./routes/applicantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/applicants", applicantRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "hr_system_db",
  })
  .then(() => console.log("🔥 MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});