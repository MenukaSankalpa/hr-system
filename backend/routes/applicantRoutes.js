// import express from "express";
// import multer from "multer";
// import Applicant from "../models/Applicant.js";

// const router = express.Router();

// // File upload
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// const upload = multer({ storage });

// /* ---------------------------------------------------
//    GET ALL APPLICANTS  ✅ FIX
// --------------------------------------------------- */
// router.get("/", async (req, res) => {
//   try {
//     const applicants = await Applicant.find().sort({ createdAt: -1 });
//     res.json(applicants);
//   } catch (error) {
//     console.error("GET ERROR:", error);
//     res.status(500).json({ message: "Error fetching applicants" });
//   }
// });

// /* ---------------------------------------------------
//    GET ONE APPLICANT BY ID  ✅
// --------------------------------------------------- */
// router.get("/:id", async (req, res) => {
//   try {
//     const applicant = await Applicant.findById(req.params.id);
//     if (!applicant) {
//       return res.status(404).json({ message: "Applicant not found" });
//     }
//     res.json(applicant);
//   } catch (error) {
//     console.error("GET BY ID ERROR:", error);
//     res.status(500).json({ message: "Error fetching applicant" });
//   }
// });

// /* ---------------------------------------------------
//    CREATE APPLICANT
// --------------------------------------------------- */
// router.post("/", upload.single("cvFile"), async (req, res) => {
//   try {
//     const data = req.body;

//     if (req.file) {
//       data.cvFile = req.file.filename;
//     }

//     const applicant = new Applicant(data);
//     await applicant.save();

//     res.json({ success: true, applicant });
//   } catch (error) {
//     console.error("SAVE ERROR:", error);
//     res.status(500).json({ message: "Error saving applicant" });
//   }
// });

// /* ---------------------------------------------------
//    DELETE APPLICANT  ✅ NEW FIX
// --------------------------------------------------- */
// router.delete("/:id", async (req, res) => {
//   try {
//     const applicant = await Applicant.findByIdAndDelete(req.params.id);

//     if (!applicant) {
//       return res.status(404).json({ message: "Applicant not found" });
//     }

//     res.json({ success: true, message: "Applicant deleted successfully" });
//   } catch (error) {
//     console.error("DELETE ERROR:", error);
//     res.status(500).json({ message: "Error deleting applicant" });
//   }
// });


// export default router;

// File: routes/applicantRoutes.js (FULLY FIXED)

import express from "express";
import multer from "multer";
import Applicant from "../models/Applicant.js";

// Import all necessary controller functions
import {
    getDashboardStats,
    getRecentActivity,
    generateCsvReport, 
    generatePdfReport
} from "../controllers/applicantController.js";

// ---------------------------------------------------
// 1. ROUTER INITIALIZATION (MUST be first)
// ---------------------------------------------------
const router = express.Router();

// ---------------------------------------------------
// 2. Multer Setup for File Upload (CV)
// ---------------------------------------------------
// const storage = multer.diskStorage({
//     destination: "uploads/",
//     filename: (req, file, cb) => {
//         // Standard practice to ensure unique filenames
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// });

// const upload = multer({ storage });

const storage = multer.diskStorage({
    destination: "uploads/cv/name",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.post("/", upload.single("cvFile"), async (req, res) => {
    try {
        const data = req.body;

        if (req.file) {
            data.cvFile = `cv/name/${req.file.filename}`;
        }

        const applicant = new Applicant(data);
        await applicant.save();

        res.json({ success: true, applicant });
    } catch (error) {
        res.status(500).json({ message: "Error saving applicant" });
    }
});



// ---------------------------------------------------
// 3. APPLICATION ROUTES
// ---------------------------------------------------

// Dashboard and Reporting Routes
router.get("/dashboard-stats", getDashboardStats);
router.get("/recent-activity", getRecentActivity);
router.get("/report/csv", generateCsvReport);
router.get("/report/pdf", generatePdfReport);


// ===================================================
// GET ALL APPLICANTS
// Route: GET /api/applicants
// ===================================================
router.get("/", async (req, res) => {
    try {
        const applicants = await Applicant.find().sort({ createdAt: -1 });
        // Assuming the frontend expects the raw array of applicants
        res.json(applicants);
    } catch (error) {
        console.error("GET ALL ERROR:", error);
        res.status(500).json({ message: "Error fetching applicants" });
    }
});


// ===================================================
// GET ONE APPLICANT BY ID
// Route: GET /api/applicants/:id
// ===================================================
router.get("/:id", async (req, res) => {
    try {
        const applicant = await Applicant.findById(req.params.id);
        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }
        res.json(applicant);
    } catch (error) {
        console.error("GET BY ID ERROR:", error);
        res.status(500).json({ message: "Error fetching applicant" });
    }
});


// ===================================================
// CREATE APPLICANT
// Route: POST /api/applicants
// ===================================================
router.post("/", upload.single("cvFile"), async (req, res) => {
    try {
        const data = req.body;

        // Handle uploaded file path
        if (req.file) {
            // Note: Use 'cvFile' or 'cvPath' consistently based on your Applicant model
            data.cvFile = req.file.filename; 
        }
        
        // This is where you would re-add complex JSON parsing logic if needed
        // for nested fields sent via multipart/form-data.

        const applicant = new Applicant(data);
        await applicant.save();

        res.json({ success: true, applicant });
    } catch (error) {
        console.error("SAVE ERROR:", error);
        res.status(500).json({ message: "Error saving applicant", error: error.message });
    }
});


// ===================================================
// UPDATE APPLICANT STATUS (or other partial updates)
// Route: PATCH /api/applicants/:id
// ===================================================
router.patch("/:id", async (req, res) => {
    const { status, ...otherFields } = req.body; // Separate status from other potential updates
    const { id } = req.params;

    try {
        const updateFields = {};
        
        // Check if status is being updated (from the front-end select)
        if (status) {
            updateFields.status = status;
        }
        
        // You can use Object.assign(updateFields, otherFields); to include other updates.

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No valid update fields provided." });
        }

        // Perform the update
        const updatedApplicant = await Applicant.findByIdAndUpdate(
            id,
            { $set: updateFields }, // Use $set to update only specified fields
            { 
                new: true, // Return the updated document
                runValidators: true, // Enforce schema validation (e.g., status enum)
            }
        );

        if (!updatedApplicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }

        res.json(updatedApplicant);
    } catch (error) {
        // Handle Mongoose validation errors (e.g., invalid status)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error("UPDATE STATUS ERROR:", error);
        res.status(500).json({ message: "Error updating applicant status" });
    }
});


// ===================================================
// DELETE APPLICANT
// Route: DELETE /api/applicants/:id
// ===================================================
router.delete("/:id", async (req, res) => {
    try {
        const applicant = await Applicant.findByIdAndDelete(req.params.id);

        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }

        res.json({ success: true, message: "Applicant deleted successfully" });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ message: "Error deleting applicant" });
    }
});


// ---------------------------------------------------
// 4. EXPORT
// ---------------------------------------------------
export default router;