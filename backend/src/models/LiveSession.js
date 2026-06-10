const mongoose = require("mongoose");

const liveSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    topic: String,
    seats: Number,
    fees: Number,
    sessionDate: Date,
    sessionLink: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "live", "completed"],
      default: "scheduled",
    },
    streamKey: {
      type: String, // For instructor to broadcast (e.g., via OBS)
    },
    streamUrl: {
      type: String, // Optional — sessions now use built-in WebRTC room
    },
    ctaText: {
      type: String, // E.g., "Enroll via WhatsApp"
    },
    ctaLink: {
      type: String, // E.g., "https://wa.me/..."
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveSession", liveSessionSchema);