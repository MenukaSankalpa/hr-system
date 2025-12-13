import express from "express";
import multer from "multer";
import Applicant from "../models/Applicant.js";

const router = express.Router();

// File upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// CREATE applicant
router.post("/", upload.single("cvFile"), async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.cvFile = req.file.filename;
    }

    const applicant = new Applicant(data);
    await applicant.save();

    res.json({ success: true, applicant });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ message: "Error saving applicant" });
  }
});

// UPDATE applicant
router.put("/:id", upload.single("cvFile"), async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.cvFile = req.file.filename;
    }

    const applicant = await Applicant.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json({ success: true, applicant });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Error updating applicant" });
  }
});

export default router;
