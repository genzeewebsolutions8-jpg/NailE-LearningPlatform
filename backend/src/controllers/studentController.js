const User = require("../models/User");
const LiveSession = require("../models/LiveSession");
const PreRecordedVideo = require("../models/PreRecordedVideo");

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const student = await User.findById(req.user.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student profile not found" });
    }

    student.firstName = firstName || student.firstName;
    student.lastName = lastName || student.lastName;
    student.phone = phone || student.phone;

    const updatedStudent = await student.save();

    res.status(200).json({
      message: "Profile updated successfully",
      student: {
        id: updatedStudent._id,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
        phone: updatedStudent.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all enrolled live sessions for the student
exports.getEnrolledLiveSessions = async (req, res) => {
  try {
    // Find all live sessions where the students array contains the current user's ID
    const sessions = await LiveSession.find({ students: req.user.id })
      .populate("createdBy", "firstName lastName")
      .sort({ sessionDate: 1 });

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll in a live session
exports.enrollLiveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await LiveSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Live session not found" });
    }

    // Check if the student is already enrolled
    if (session.students.includes(req.user.id)) {
      return res.status(400).json({ message: "Already enrolled in this session" });
    }

    // Add student to the session
    session.students.push(req.user.id);
    await session.save();

    res.status(200).json({ message: "Successfully enrolled in the live session", session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available pre-recorded videos
exports.getAvailableVideos = async (req, res) => {
  try {
    // Only fetch active videos that are approved by admin
    const videos = await PreRecordedVideo.find({ isActive: true, status: "approved" })
      .populate("instructorId", "firstName lastName")
      .sort({ createdAt: -1 });

    // Count real enrollments per course by aggregating user collection
    const enrollmentCounts = await User.aggregate([
      { $unwind: "$enrolledCourses" },
      { $group: { _id: "$enrolledCourses", count: { $sum: 1 } } }
    ]);
    const countMap = {};
    enrollmentCounts.forEach(ec => { countMap[ec._id.toString()] = ec.count; });

    const formattedVideos = videos.map(video => {
      const vidObj = video.toObject();
      if (vidObj.instructorId) {
        vidObj.instructor = `${vidObj.instructorId.firstName} ${vidObj.instructorId.lastName}`;
      } else {
        vidObj.instructor = "Academy Instructor";
      }
      vidObj.enrolledCount = countMap[vidObj._id.toString()] || 0;
      return vidObj;
    });

    res.status(200).json({ videos: formattedVideos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all approved instructors (globally accessible to logged-in users)
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor", approvalStatus: "approved" })
      .select("-password")
      .sort({ firstName: 1 });

    const videoCounts = await PreRecordedVideo.aggregate([
      { $match: { status: "approved", isActive: true } },
      { $group: { _id: "$instructorId", count: { $sum: 1 } } }
    ]);

    const formattedInstructors = instructors.map(inst => {
      const match = videoCounts.find(vc => vc._id && vc._id.toString() === inst._id.toString());
      return {
        _id: inst._id,
        name: `${inst.firstName} ${inst.lastName}`,
        email: inst.email,
        phone: inst.phone,
        coursesCount: match ? match.count : 0
      };
    });

    res.status(200).json({ instructors: formattedInstructors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll in a pre-recorded course
exports.enrollCourse = async (req, res) => {
  try {
    const { videoId } = req.params;

    const course = await PreRecordedVideo.findById(videoId);
    if (!course || !course.isActive || course.status !== "approved") {
      return res.status(404).json({ message: "Course not found or unavailable" });
    }

    const student = await User.findById(req.user.id);

    // Check if already enrolled
    if (student.enrolledCourses.includes(videoId)) {
      return res.status(400).json({ message: "You are already enrolled in this course." });
    }

    student.enrolledCourses.push(videoId);
    await student.save();

    res.status(200).json({ message: "Successfully enrolled in the course." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get strictly the courses a student has explicitly enrolled in
exports.getEnrolledCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      match: { isActive: true, status: "approved" },
      populate: {
        path: 'instructorId',
        select: 'firstName lastName'
      }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const formattedVideos = student.enrolledCourses.map(video => {
      const vidObj = video.toObject();
      if (vidObj.instructorId) {
        vidObj.instructor = `${vidObj.instructorId.firstName} ${vidObj.instructorId.lastName}`;
      } else {
        vidObj.instructor = "Academy Instructor";
      }
      return vidObj;
    });

    res.status(200).json({ videos: formattedVideos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
