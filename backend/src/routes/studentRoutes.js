const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    getEnrolledLiveSessions,
    enrollLiveSession,
    getAvailableVideos,
    getAllInstructors,
    enrollCourse,
    getEnrolledCourses,
} = require("../controllers/studentController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Global routes for all authenticated users
router.get("/instructors", getAllInstructors);
router.get("/videos", getAvailableVideos);
router.get("/live-sessions", getEnrolledLiveSessions);

// Custom middleware to restrict to 'student' role
const restrictToStudent = (req, res, next) => {
    if (req.user && req.user.role === "student") {
        next();
    } else {
        res.status(403).json({ message: "Student access required" });
    }
};

// All routes below this point should be protected and restricted to students
router.use(restrictToStudent);

// Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Live Sessions
router.post("/live-sessions/:sessionId/enroll", enrollLiveSession);

// Enrolled Courses (Student Only)
router.get("/enrolled-videos", getEnrolledCourses);
router.post("/videos/:videoId/enroll", enrollCourse);

module.exports = router;
