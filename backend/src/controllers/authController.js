const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail, sendResetPasswordEmail } = require("../utils/emailService");

// ─── Send OTP ───────────────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if email is already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "An account with this email already exists." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Remove any existing OTP for this email, then save the new one
    await OtpToken.deleteMany({ email: email.toLowerCase() });
    await OtpToken.create({ email: email.toLowerCase(), otp: hashedOtp });

    // Send email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email address. It expires in 10 minutes." });
  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

// ─── Verify OTP ─────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = await OtpToken.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP is valid — delete it so it can't be reused
    await OtpToken.deleteMany({ email: email.toLowerCase() });

    res.status(200).json({ verified: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ error: "OTP verification failed. Please try again." });
  }
};

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, phone, role, otp, fullName } = req.body;
    let { firstName, lastName } = req.body;

    // Support fullName from frontend if firstName/lastName are missing
    if (fullName && (!firstName || !lastName)) {
      const parts = fullName.trim().split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ") || ".";
    }

    if (!firstName || !email || !password || !otp) {
      return res.status(400).json({ message: "Required fields (name, email, password, otp) are missing" });
    }

    // 1. Verify OTP first
    const record = await OtpToken.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: "Verification code expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // 3. Clear OTP and Create User
    await OtpToken.deleteMany({ email: email.toLowerCase() });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "student",
      approvalStatus: role === "instructor" ? "pending" : "approved",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ─── Update Profile ─────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { bio, firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio !== undefined) user.bio = bio;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role === "instructor" && user.approvalStatus !== "approved") {
      return res.status(403).json({ message: `Your instructor account is currently ${user.approvalStatus}. Please wait for admin approval.` });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName || ""}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Forgot Password ────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Verify user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // Generate 6-digit reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save/update OTP
    await OtpToken.deleteMany({ email: email.toLowerCase() });
    await OtpToken.create({ email: email.toLowerCase(), otp: hashedOtp });

    // Send email
    await sendResetPasswordEmail(user.email, otp);

    res.status(200).json({ message: "Reset code sent to your email. Valid for 10 minutes." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ error: "Failed to send reset code. Please try again." });
  }
};

// ─── Reset Password ─────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }

    // Check OTP record
    const record = await OtpToken.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ message: "Reset code has expired or not found. Please request a new one." });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp.trim(), record.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid reset code. Please check and try again." });
    }

    // Clear OTP
    await OtpToken.deleteMany({ email: email.toLowerCase() });

    // Find User & Update Password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
};