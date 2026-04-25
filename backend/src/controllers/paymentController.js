const Razorpay = require("razorpay");
const crypto = require("crypto");
const LiveSession = require("../models/LiveSession");
const PreRecordedVideo = require("../models/PreRecordedVideo");
const User = require("../models/User");
const Payment = require("../models/Payment");

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn("[Payment] WARN: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payments will fail.");
}

// POST /api/payment/create-order
// type: 'course' | 'session', itemId: ObjectId
exports.createOrder = async (req, res) => {
    try {
        const { type, itemId } = req.body;

        let fees = 0;
        let itemName = "";

        if (type === "course") {
            const course = await PreRecordedVideo.findById(itemId);
            if (!course) return res.status(404).json({ message: "Course not found" });
            fees = course.fees || 0;
            itemName = course.title;
        } else if (type === "session") {
            const session = await LiveSession.findById(itemId);
            if (!session) return res.status(404).json({ message: "Session not found" });
            fees = session.fees || 0;
            itemName = session.title;
        } else {
            return res.status(400).json({ message: "Invalid type. Must be 'course' or 'session'" });
        }

        if (fees === 0) {
            // Free item — no payment needed
            return res.status(200).json({ free: true, message: "This item is free, no payment required" });
        }

        const amountInPaise = Math.round(fees * 100); // Razorpay uses paise

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${type.slice(0, 3)}_${Date.now()}`,
            notes: {
                type,
                itemId: itemId.toString(),
                studentId: req.user._id.toString(),
                itemName,
            },
        });

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            itemName,
            fees,
        });
    } catch (error) {
        console.error("Razorpay order error:", error);
        let errorMsg = "Payment order creation failed.";

        if (error && typeof error.message === 'string') {
            errorMsg = error.message;
        } else if (error && error.error && typeof error.error.description === 'string') {
            errorMsg = error.error.description;
        }

        if (errorMsg.includes("key_id") || (error && error.statusCode === 401)) {
            errorMsg = "Razorpay is not configured correctly (Authentication failed). Please check your keys in .env.";
        }
        res.status(500).json({ message: errorMsg });
    }
};

// POST /api/payment/verify
// Verifies Razorpay signature then enrolls student
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, itemId } = req.body;
        const studentId = req.user._id;

        // Verify HMAC signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "fallback_secret")
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
        }

        // Payment verified — enroll the student
        const user = await User.findById(studentId);

        if (type === "course") {
            if (!user.enrolledCourses.includes(itemId)) {
                user.enrolledCourses.push(itemId);
                await user.save();
            }
        } else if (type === "session") {
            if (!user.enrolledSessions.includes(itemId)) {
                // Check capacity
                const session = await LiveSession.findById(itemId);
                if (session) {
                    const currentEnrollments = await User.countDocuments({ enrolledSessions: itemId });
                    if (session.seats > 0 && currentEnrollments >= session.seats) {
                        return res.status(400).json({ message: "Session is now fully booked. Please request a refund." });
                    }
                }
                user.enrolledSessions.push(itemId);
                await user.save();
            }
        }

        // Record the payment
        let amount = 0;
        let onModel = "";
        if (type === "course") {
            const course = await PreRecordedVideo.findById(itemId);
            amount = course ? course.fees : 0;
            onModel = "PreRecordedVideo";
        } else if (type === "session") {
            const session = await LiveSession.findById(itemId);
            amount = session ? session.fees : 0;
            onModel = "LiveSession";
        }

        if (amount > 0) {
            await Payment.create({
                studentId,
                type,
                itemId,
                onModel,
                amount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: "captured"
            });
        }

        res.status(200).json({ message: "Payment verified and enrollment successful", paymentId: razorpay_payment_id });
    } catch (error) {
        console.error("Payment verification error:", error);
        const errorMsg = error.message || (error.error && error.error.description) || "Payment verification failed.";
        res.status(500).json({ message: errorMsg });
    }
};
