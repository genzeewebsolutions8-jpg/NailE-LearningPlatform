const mongoose = require("mongoose");

const otpTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true, // stored as bcrypt hash
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // auto-delete after 10 minutes (TTL index)
    },
});

module.exports = mongoose.model("OtpToken", otpTokenSchema);
