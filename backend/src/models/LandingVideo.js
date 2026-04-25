const mongoose = require("mongoose");

const landingVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Landing Page Video",
    },
    videoUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // Useful if we use a cloud storage like Cloudinary later, but for now we use local storage
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LandingVideo", landingVideoSchema);
