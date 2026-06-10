const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getLandingVideo,
  uploadLandingVideo,
  deleteLandingVideo,
} = require("../controllers/landingVideoController");
const upload = require("../middleware/uploadMiddleware");

// Public route to get the video
router.get("/", getLandingVideo);

// Admin routes to manage the video
router.post("/upload", protect, adminOnly, upload.single("video"), uploadLandingVideo);
router.delete("/", protect, adminOnly, deleteLandingVideo);

module.exports = router;
