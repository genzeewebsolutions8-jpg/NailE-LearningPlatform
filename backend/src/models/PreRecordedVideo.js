const mongoose = require("mongoose");

const preRecordedVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    videos: [{
      title: String,
      videoUrl: String,
    }],
    thumbnail: {
      type: String,
    },
    duration: {
      type: String, // ex: "15:30"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fees: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PreRecordedVideo", preRecordedVideoSchema);
