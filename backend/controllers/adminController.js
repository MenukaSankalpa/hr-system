// File: src/controllers/adminController.js (CONFIRMED)

import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

// Create Admin (POST /api/admin)
export const createAdmin = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Hash password before saving
        const hashed = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            username,
            email,
            password: hashed,
            role,
        });

        // Send back the created admin without the password
        const adminResponse = admin.toObject();
        delete adminResponse.password;

        return res.status(201).json({ success: true, message: "Admin created successfully", admin: adminResponse });
    } catch (err) {
        next(err);
    }
};

// Get all admins (GET /api/admin)
export const getAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find().sort({ createdAt: -1 }).select("-password"); // hide password
        return res.json(admins);
    } catch (err) { next(err); }
};

// Update admin (PUT /api/admin/:id)
export const updateAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        // Check if email used by another admin
        if (email) {
            const other = await Admin.findOne({ email, _id: { $ne: id } });
            if (other) {
                return res.status(400).json({ success: false, message: "Email already in use by another admin" });
            }
        }

        const updateData = { username, email, role };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-password");
        if (!updated) return res.status(404).json({ success: false, message: "Admin not found" });

        return res.json({ success: true, message: "Admin updated", admin: updated });
    } catch (err) { next(err); }
};

// Delete admin (DELETE /api/admin/:id)
export const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removed = await Admin.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ success: false, message: "Admin not found" });
        return res.json({ success: true, message: "Admin deleted" });
    } catch (err) { next(err); }
};