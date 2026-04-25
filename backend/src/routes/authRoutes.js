const express = require("express");
const router = express.Router();
const { register, login, sendOtp, verifyOtp, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const imageUpload = require("../middleware/imageUploadMiddleware");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post("/login", login);
router.put("/update-profile", protect, imageUpload.single("profilePicture"), updateProfile);

module.exports = router;
