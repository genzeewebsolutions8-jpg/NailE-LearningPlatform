const LiveSession = require("../models/LiveSession");
const User = require("../models/User");

exports.createLiveSession = async (req, res) => {
  try {
    const { title, description, topic, seats, fees, sessionDate, sessionLink, instructorId, streamUrl } = req.body;

    if (!title || !instructorId || !sessionDate) {
      return res.status(400).json({ error: "Title, Instructor, and Session Date are required" });
    }

    const session = await LiveSession.create({
      title,
      description,
      topic,
      seats,
      fees,
      sessionDate,
      sessionLink,
      instructorId,
      streamUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Live session created successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find()
      .populate("instructorId", "firstName lastName email")
      .sort({ sessionDate: 1 });

    const sessionIds = sessions.map(s => s._id);

    // Aggregate enrollment data
    let enrollmentData = [];
    if (sessionIds.length > 0) {
      enrollmentData = await User.aggregate([
        { $match: { enrolledSessions: { $exists: true, $ne: [] } } },
        { $unwind: "$enrolledSessions" },
        { $match: { "enrolledSessions": { $in: sessionIds } } },
        { $group: { _id: "$enrolledSessions", count: { $sum: 1 } } }
      ]);
    }

    const enrollmentMap = {};
    enrollmentData.forEach(data => {
      enrollmentMap[data._id.toString()] = data.count;
    });

    const populatedSessions = sessions.map(session => {
      const sessionObj = session.toObject();
      sessionObj.enrolledCount = enrollmentMap[session._id.toString()] || 0;
      return sessionObj;
    });

    res.json({ sessions: populatedSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyLiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({ instructorId: req.user._id })
      .populate("instructorId", "firstName lastName email")
      .sort({ sessionDate: 1 });

    const sessionIds = sessions.map(s => s._id);

    let enrollmentData = [];
    if (sessionIds.length > 0) {
      enrollmentData = await User.aggregate([
        { $match: { enrolledSessions: { $exists: true, $ne: [] } } },
        { $unwind: "$enrolledSessions" },
        { $match: { "enrolledSessions": { $in: sessionIds } } },
        { $group: { _id: "$enrolledSessions", count: { $sum: 1 } } }
      ]);
    }

    const enrollmentMap = {};
    enrollmentData.forEach(data => {
      enrollmentMap[data._id.toString()] = data.count;
    });

    const populatedSessions = sessions.map(session => {
      const sessionObj = session.toObject();
      sessionObj.enrolledCount = enrollmentMap[session._id.toString()] || 0;
      return sessionObj;
    });

    res.json({ sessions: populatedSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enrollSession = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    // Check if session exists
    const session = await LiveSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Live session not found" });
    }

    // Check if user is already enrolled
    const user = await User.findById(studentId);
    if (user.enrolledSessions.includes(id)) {
      return res.status(400).json({ message: "Already enrolled in this session" });
    }

    // Check capacity
    const currentEnrollments = await User.countDocuments({ enrolledSessions: id });
    const capacity = session.seats || 0;

    if (capacity > 0 && currentEnrollments >= capacity) {
      return res.status(400).json({ message: "This session is fully booked" });
    }

    // Add session to enrolledSessions
    user.enrolledSessions.push(id);
    await user.save();

    res.status(200).json({ message: "Successfully enrolled in the session" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEnrolledSessions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId).populate({
      path: "enrolledSessions",
      populate: { path: "instructorId", select: "firstName lastName email" }
    });

    // Return all enrolled sessions (including completed) so the frontend can categorize them
    const activeSessions = user.enrolledSessions.filter(s => s != null);

    // Sort by sessionDate (upcoming first)
    activeSessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

    res.status(200).json({ sessions: activeSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLiveSession = async (req, res) => {
  const updated = await LiveSession.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
};

exports.deleteLiveSession = async (req, res) => {
  await LiveSession.findByIdAndDelete(req.params.id);
  res.json({ message: "Session deleted" });
};

exports.addStudentsToSession = async (req, res) => {
  try {
    const { studentIds } = req.body;

    const session = await LiveSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Live session not found" });
    }

    session.students.push(...studentIds);
    await session.save();

    res.json({ message: "Students added successfully", session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.startLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Live session not found" });
    }

    // Prevent re-starting a completed session
    if (session.status === "completed") {
      return res.status(400).json({ message: "Cannot start a session that has already ended" });
    }

    // Only the assigned instructor or an admin can start the session
    const isAdmin = req.user.role === "superadmin" || req.user.role === "admin";
    const isAssignedInstructor = session.instructorId.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedInstructor) {
      return res.status(403).json({ message: "Only the assigned instructor or admin can start this session" });
    }

    session.status = "live";
    await session.save();

    // Emit real-time notification to all users
    const io = req.app.get("io");
    if (io) {
      io.emit("session-started", { 
        id: session._id, 
        title: session.title,
        instructor: `${session.instructorId.firstName || ""} ${session.instructorId.lastName || ""}`.trim()
      });
    }

    res.status(200).json({ message: "Live session started", session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stopLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Live session not found" });
    }

    // Only the assigned instructor or an admin can stop the session
    const isAdmin = req.user.role === "superadmin" || req.user.role === "admin";
    const isAssignedInstructor = session.instructorId.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedInstructor) {
      return res.status(403).json({ message: "Only the assigned instructor or admin can stop this session" });
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ message: "Live session stopped", session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};