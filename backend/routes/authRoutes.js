import express from "express";
import Admin from "../models/Admin.js";

const router = express.Router();

// Add an admin
router.post("/add", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const admin = await Admin.create({ username, email, password, role });

    res.json({ success: true, admin });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all admins
router.get("/", async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});

export default router;
