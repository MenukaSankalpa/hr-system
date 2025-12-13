// File: src/routes/adminRoutes.js (NEW FILE)

import express from "express";
import { 
    createAdmin, 
    getAdmins, 
    updateAdmin, 
    deleteAdmin 
} from "../controllers/adminController.js"; 

const router = express.Router();

// GET all admins
router.get("/", getAdmins);

// POST create admin (Frontend path fixed to match this)
router.post("/", createAdmin); 

// PUT update admin (Using PUT/PATCH for full/partial update is common)
router.put("/:id", updateAdmin);

// DELETE admin
router.delete("/:id", deleteAdmin);

export default router;