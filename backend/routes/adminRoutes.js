import express from "express";
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdmins);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
