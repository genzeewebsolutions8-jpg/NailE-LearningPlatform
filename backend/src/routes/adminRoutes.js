const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getDashboardStats, getInstructorStats, getPendingCourses, updateCourseStatus, getPendingInstructors, updateInstructorStatus, getApprovedInstructors, deleteInstructor } = require("../controllers/adminController");

// Admin/Instructor Statistics & Course Approvals
router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/instructor/stats", protect, getInstructorStats); // Instructors can view their own stats
router.get("/courses/pending", protect, adminOnly, getPendingCourses);
router.put("/courses/:id/status", protect, adminOnly, updateCourseStatus);

// Admin Instructor Approvals
router.get("/instructors/pending", protect, adminOnly, getPendingInstructors);
router.put("/instructors/:id/status", protect, adminOnly, updateInstructorStatus);
router.get("/instructors/approved", protect, adminOnly, getApprovedInstructors);
router.delete("/instructors/:id", protect, adminOnly, deleteInstructor);

module.exports = router;
