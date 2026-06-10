const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createLiveSession,
  getLiveSessions,
  getMyLiveSessions,
  enrollSession,
  getEnrolledSessions,
  updateLiveSession,
  deleteLiveSession,
  addStudentsToSession,
  startLiveSession,
  stopLiveSession,
} = require("../controllers/liveSessionController");

router.post("/", protect, adminOnly, createLiveSession);
router.get("/my", protect, getMyLiveSessions);
router.get("/enrolled", protect, getEnrolledSessions);
router.post("/:id/enroll", protect, enrollSession);
router.get("/", protect, getLiveSessions);
router.put("/:id", protect, adminOnly, updateLiveSession);
router.delete("/:id", protect, adminOnly, deleteLiveSession);
router.post("/:id/add-students", protect, adminOnly, addStudentsToSession);

router.put("/:id/start", protect, startLiveSession);
router.put("/:id/stop", protect, stopLiveSession);

module.exports = router;