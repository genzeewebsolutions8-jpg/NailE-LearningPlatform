const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createOrder, verifyPayment } = require("../controllers/paymentController");

// Create Razorpay order for a course or session
router.post("/create-order", protect, createOrder);

// Verify payment and enroll student
router.post("/verify", protect, verifyPayment);

module.exports = router;
