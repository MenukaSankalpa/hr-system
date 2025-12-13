// File: src/controllers/applicantController.js (CONFIRMED FIXED)

import Applicant from "../models/Applicant.js";
import { stringify } from 'csv-stringify/sync';

// Helper function to calculate date filters
const getDateFilter = (range) => {
    let dateFilter = {};
    const now = new Date();
    let startDate;

    switch (range) {
        case 'last-7-days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: startDate } };
            break;
        case 'last-30-days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            dateFilter = { createdAt: { $gte: startDate } };
            break;
        case 'this-year':
            startDate = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: startDate } };
            break;
        case 'all-time': 
        default:
            dateFilter = {}; // No filter (all time)
    }
    return dateFilter;
};


// ===========================
// CREATE APPLICANT
// ===========================
export const createApplicant = async (req, res) => {
    try {
        const data = req.body;

        if (req.file) {
            data.cvPath = `/uploads/${req.file.filename}`; 
        }
        
        // Handle JSON parsing for nested objects sent via multipart/form-data
        if (data.marks) {
            const m = JSON.parse(data.marks);
            data.marks = m;

            // Recalculate totalMarks
            data.totalMarks =
                (m.communication || 0) +
                (m.technicalSkills || 0) +
                (m.personality || 0) +
                (m.confidence || 0) +
                (m.education || 0);
        }

        if (data.appointmentDetails) {
            data.appointmentDetails = JSON.parse(data.appointmentDetails);
        }

        if (data.interviewers) {
            data.interviewers = JSON.parse(data.interviewers);
        }

        const applicant = new Applicant(data);
        await applicant.save();

        res.status(201).json({
            success: true,
            message: "Applicant saved successfully.",
            applicant,
        });
    } catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error saving applicant",
            error: error.message,
        });
    }
};

// ===========================
// GET ALL APPLICANTS
// ===========================
export const getApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.find().sort({ createdAt: -1 });
        res.status(200).json(applicants);
    } catch (error) {
        console.error("GET ALL ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching applicants",
            error: error.message,
        });
    }
};

// ===========================
// GET SINGLE APPLICANT
// ===========================
export const getApplicantById = async (req, res) => {
    try {
        const applicant = await Applicant.findById(req.params.id);

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found",
            });
        }

        res.status(200).json(applicant);
    } catch (error) {
        console.error("GET SINGLE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching applicant",
            error: error.message,
        });
    }
};

// ===========================
// UPDATE APPLICANT
// ===========================
export const updateApplicant = async (req, res) => {
    try {
        const data = req.body;

        if (req.file) data.cvPath = `/uploads/${req.file.filename}`;

        // Parse nested JSON strings if they are part of the update request
        if (data.marks && typeof data.marks === 'string') data.marks = JSON.parse(data.marks);
        if (data.appointmentDetails && typeof data.appointmentDetails === 'string')
            data.appointmentDetails = JSON.parse(data.appointmentDetails);
        if (data.interviewers && typeof data.interviewers === 'string')
            data.interviewers = JSON.parse(data.interviewers);

        if (data.marks) {
            // Re-calculate totalMarks on update if marks were provided
            data.totalMarks =
                (data.marks.communication || 0) +
                (data.marks.technicalSkills || 0) +
                (data.marks.personality || 0) +
                (data.marks.confidence || 0) +
                (data.marks.education || 0);
        }

        const updatedApplicant = await Applicant.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true, runValidators: true } 
        );

        if (!updatedApplicant) {
            return res.status(404).json({ success: false, message: "Applicant not found" });
        }

        res.status(200).json(updatedApplicant);
    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error updating applicant",
            error: error.message,
        });
    }
};

// ===========================
// DELETE APPLICANT
// ===========================
export const deleteApplicant = async (req, res) => {
    try {
        const applicant = await Applicant.findByIdAndDelete(req.params.id);

        if (!applicant) {
            return res.status(404).json({ success: false, message: "Applicant not found" });
        }

        res.status(200).json({
            success: true,
            message: "Applicant removed successfully",
        });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting applicant",
        });
    }
};

// ===================================
// GET DASHBOARD STATS (Date Filtered)
// ===================================
export const getDashboardStats = async (req, res) => {
    try {
        const { range } = req.query; 
        const dateFilter = getDateFilter(range);

        // 1. Fetch KPI data based on the filter, using the correct casing for status
        const totalApplicants = await Applicant.countDocuments(dateFilter);
        
        // These lines correctly combine the date filter with the status filter
        const selectedCount = await Applicant.countDocuments({ ...dateFilter, status: 'Selected' }); 
        const notSelectedCount = await Applicant.countDocuments({ ...dateFilter, status: 'Not Selected' });
        const futureSelectCount = await Applicant.countDocuments({ ...dateFilter, status: 'Future Select' });
        const pendingCount = await Applicant.countDocuments({ ...dateFilter, status: 'Pending' });


        // 2. Handle Monthly aggregation 
        const monthlyAggregation = await Applicant.aggregate([
            // Apply the date filter to the aggregation pipeline
            { $match: { ...dateFilter, createdAt: { $ne: null } } }, 
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    applicants: { $sum: 1 }, 
                },
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyStats = monthlyAggregation.map((m) => ({
            month: m._id,
            applicants: m.applicants
        }));

        // 3. Return the combined data
        res.json({ 
            totalApplicants, 
            selectedCount, 
            notSelectedCount, 
            futureSelectCount, 
            pendingCount, 
            monthly: monthlyStats 
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error loading dashboard stats" });
    }
};

// ===================================
// GET RECENT ACTIVITY
// ===================================
export const getRecentActivity = async (req, res) => {
    try {
        // Fetch last 10 documents based on when they were last updated
        const activities = await Applicant.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('name status updatedAt'); 

        const mapped = activities.map((a) => ({
            id: a._id,
            applicantName: a.name,
            // Construct a meaningful action string for the frontend
            action: `updated status to ${a.status.replace('-', ' ')}`, 
            timestamp: a.updatedAt,
            userName: "System Update", 
        }));

        res.json(mapped);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error loading activity" });
    }
};

// ===================================
// GENERATE CSV REPORT
// ===================================
export const generateCsvReport = async (req, res, next) => {
    try {
        const { range } = req.query;
        const dateFilter = getDateFilter(range);

        // 1. Fetch filtered data
        const applicants = await Applicant.find(dateFilter).select('name email status createdAt -_id');

        // 2. Format as CSV
        const columns = ['Name', 'Email', 'Status', 'Date Applied'];
        const data = applicants.map(a => [
            a.name, 
            a.email, 
            a.status, 
            a.createdAt.toISOString().split('T')[0]
        ]);
        const csvContent = stringify([columns, ...data]);

        // 3. Set headers and send file
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="applicants_report.csv"');
        res.status(200).send(csvContent);
    } catch (err) { next(err); }
};

// ===================================
// GENERATE PDF REPORT (Placeholder)
// ===================================
export const generatePdfReport = async (req, res, next) => {
    res.status(501).json({ message: "PDF generation not yet implemented on the server." }); 
};