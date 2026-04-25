const express = require("express");
const router = express.Router();
const { protect, instructorOrAdmin } = require("../middleware/authMiddleware");

const {
  addVideo,
  getAllVideos,
  getMyVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} = require("../controllers/preRecordedVideoController");

const upload = require("../middleware/uploadMiddleware");

router.post("/add", protect, instructorOrAdmin, upload.fields([{ name: 'videos', maxCount: 20 }, { name: 'thumbnail', maxCount: 1 }]), addVideo);
router.get("/my", protect, getMyVideos);
router.get("/", protect, getAllVideos);
router.get("/:id", protect, getVideoById);
router.put("/update/:id", protect, instructorOrAdmin, updateVideo);
router.delete("/delete/:id", protect, instructorOrAdmin, deleteVideo);

module.exports = router;