const LandingVideo = require("../models/LandingVideo");
const fs = require("fs");
const path = require("path");

// @desc    Get landing page video
// @route   GET /api/landing-video
// @access  Public
exports.getLandingVideo = async (req, res) => {
  try {
    const video = await LandingVideo.findOne().sort({ createdAt: -1 });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Upload/Update landing page video
// @route   POST /api/landing-video/upload
// @access  Admin
exports.uploadLandingVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a video file" });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    // Find existing video to delete file
    const existingVideo = await LandingVideo.findOne();
    if (existingVideo) {
      const oldPath = path.join(__dirname, "../../", existingVideo.videoUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      
      existingVideo.videoUrl = videoUrl;
      existingVideo.title = req.body.title || "Landing Page Video";
      await existingVideo.save();
      return res.json({ message: "Video updated successfully", video: existingVideo });
    }

    const newVideo = await LandingVideo.create({
      videoUrl,
      title: req.body.title || "Landing Page Video",
    });

    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete landing page video
// @route   DELETE /api/landing-video
// @access  Admin
exports.deleteLandingVideo = async (req, res) => {
  try {
    const video = await LandingVideo.findOne();
    if (!video) {
        return res.status(404).json({ message: "No landing video found" });
    }

    const filePath = path.join(__dirname, "../../", video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await LandingVideo.deleteOne({ _id: video._id });
    res.json({ message: "Landing video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
