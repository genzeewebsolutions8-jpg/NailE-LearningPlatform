const LiveChat = require("../models/LiveChat");
const LiveSession = require("../models/LiveSession");

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;

    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const chat = await LiveChat.create({
      sessionId,
      sender: req.user._id,
      message,
      isAdmin: req.user.role === "admin",
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await LiveChat.find({ sessionId })
      .populate("sender", "firstName role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};