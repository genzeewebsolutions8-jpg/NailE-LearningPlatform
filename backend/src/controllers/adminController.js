const User = require("../models/User");
const LiveSession = require("../models/LiveSession");
const PreRecordedVideo = require("../models/PreRecordedVideo");
const Payment = require("../models/Payment");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalInstructors = await User.countDocuments({ role: "instructor" });
        const totalVideos = await PreRecordedVideo.countDocuments();
        const totalLiveSessions = await LiveSession.countDocuments();

        const upcomingSessions = await LiveSession.countDocuments({
            status: "scheduled",
            sessionDate: { $gte: new Date() }
        });

        const revenueData = await Payment.aggregate([
            { $match: { status: "captured" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                totalInstructors,
                totalVideos,
                totalLiveSessions,
                upcomingSessions,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getInstructorStats = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // Active Courses metric
        const activeCoursesCount = await PreRecordedVideo.countDocuments({
            instructorId,
            status: "approved",
            isActive: true
        });

        // Upcoming Live Sessions
        const upcomingLive = await LiveSession.countDocuments({
            createdBy: instructorId,
            status: "scheduled",
            sessionDate: { $gte: new Date() }
        });

        // Total Students metric requires aggregating the enrolledCount of all approved courses owned by this instructor
        const courses = await PreRecordedVideo.find({ instructorId, status: "approved" }).select('_id');
        const courseIds = courses.map(c => c._id);

        let totalStudents = 0;
        if (courseIds.length > 0) {
            const enrollmentCounts = await User.aggregate([
                { $unwind: "$enrolledCourses" },
                { $match: { "enrolledCourses": { $in: courseIds } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]);
            totalStudents = enrollmentCounts.length > 0 ? enrollmentCounts[0].count : 0;
        }

        // Mock rating metric (always 4.8 or derived deterministically for now, as real rating isn't modeled yet)
        const rating = activeCoursesCount > 0 ? 4.8 : 0.0;

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                activeCoursesCount,
                upcomingLive,
                rating
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPendingCourses = async (req, res) => {
    try {
        const pendingCourses = await PreRecordedVideo.find({ status: "pending" })
            .populate("instructorId", "firstName lastName email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, courses: pendingCourses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, title, description, fees } = req.body; // allow optional fields for editing

        if (status && !["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (fees !== undefined) updateData.fees = Number(fees);

        const course = await PreRecordedVideo.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.status(200).json({ success: true, message: `Course updated successfully`, course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPendingInstructors = async (req, res) => {
    try {
        const pendingInstructors = await User.find({ role: "instructor", approvalStatus: "pending" })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, instructors: pendingInstructors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateInstructorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const instructor = await User.findOneAndUpdate(
            { _id: id, role: "instructor" },
            { approvalStatus: status },
            { new: true }
        ).select("-password");

        if (!instructor) {
            return res.status(404).json({ success: false, message: "Instructor not found" });
        }

        res.status(200).json({ success: true, message: `Instructor ${status}`, instructor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getApprovedInstructors = async (req, res) => {
    try {
        const approvedInstructors = await User.find({ role: "instructor", approvalStatus: "approved" })
            .select("-password")
            .sort({ firstName: 1 });

        res.status(200).json({ success: true, instructors: approvedInstructors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.findOneAndDelete({ _id: id, role: "instructor" });

        if (!result) {
            return res.status(404).json({ success: false, message: "Instructor not found" });
        }

        res.status(200).json({ success: true, message: "Instructor deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
