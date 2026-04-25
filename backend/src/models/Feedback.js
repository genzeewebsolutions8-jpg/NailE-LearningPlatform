const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LiveSession",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Prevent a student from submitting feedback more than once per session
feedbackSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
