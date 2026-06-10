const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  sendMessage,
  getMessages,
} = require("../controllers/liveChatController");

router.post("/:sessionId", protect, sendMessage);

router.get("/:sessionId", protect, getMessages);

module.exports = router;