// File: src/models/Admin.js (CONFIRMED)

import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "admin" }, // NOTE: Ensure 'superadmin' is also a valid role in your logic
    },
    { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);