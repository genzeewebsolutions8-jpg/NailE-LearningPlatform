const Feedback = require("../models/Feedback");
const LiveSession = require("../models/LiveSession");
const User = require("../models/User");

// POST /api/feedback/:sessionId
// Student submits feedback for the instructor of a completed session
exports.submitFeedback = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { rating, comment } = req.body;
        const studentId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Find session to get instructorId
        const session = await LiveSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.status !== "completed") {
            return res.status(400).json({ message: "Feedback can only be submitted for completed sessions" });
        }

        const instructorId = session.instructorId;

        // Create feedback (unique index will reject duplicates)
        try {
            await Feedback.create({ studentId, instructorId, sessionId, rating, comment: comment || "" });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ message: "You have already submitted feedback for this session" });
            }
            throw err;
        }

        // Recalculate average rating for the instructor
        const allFeedback = await Feedback.find({ instructorId });
        const totalRatings = allFeedback.length;
        const sumRatings = allFeedback.reduce((acc, f) => acc + f.rating, 0);
        const averageRating = totalRatings > 0 ? Math.round((sumRatings / totalRatings) * 10) / 10 : 0;

        await User.findByIdAndUpdate(instructorId, {
            averageRating,
            ratingCount: totalRatings,
        });

        res.status(201).json({ message: "Feedback submitted successfully", averageRating });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/feedback/instructor/:instructorId
// Public — get all feedback for an instructor (for profile page)
exports.getInstructorFeedback = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const feedbackList = await Feedback.find({ instructorId })
            .populate("studentId", "firstName lastName")
            .sort({ createdAt: -1 });

        const instructor = await User.findById(instructorId).select("averageRating ratingCount firstName lastName");

        res.status(200).json({
            feedback: feedbackList,
            averageRating: instructor?.averageRating || 0,
            ratingCount: instructor?.ratingCount || 0,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/feedback/:sessionId/check
// Check if the current student has already submitted feedback for this session
exports.hasSubmittedFeedback = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const studentId = req.user._id;

        const existing = await Feedback.findOne({ studentId, sessionId });
        res.status(200).json({ submitted: !!existing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
