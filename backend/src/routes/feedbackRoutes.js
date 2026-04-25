const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    submitFeedback,
    getInstructorFeedback,
    hasSubmittedFeedback,
} = require("../controllers/feedbackController");

// Student submits feedback for a session
router.post("/:sessionId", protect, submitFeedback);

// Check if student has already submitted feedback
router.get("/:sessionId/check", protect, hasSubmittedFeedback);

// Get all feedback for an instructor (for profile page — public but requires auth)
router.get("/instructor/:instructorId", protect, getInstructorFeedback);

module.exports = router;
