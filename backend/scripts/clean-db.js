const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const Feedback = require("../src/models/Feedback");
const LandingVideo = require("../src/models/LandingVideo");
const LiveChat = require("../src/models/LiveChat");
const LiveSession = require("../src/models/LiveSession");
const OtpToken = require("../src/models/OtpToken");
const Payment = require("../src/models/Payment");
const PreRecordedVideo = require("../src/models/PreRecordedVideo");

async function cleanAndSeed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        console.log("Cleaning all collections...");
        await Promise.all([
            User.deleteMany({}),
            Feedback.deleteMany({}),
            LandingVideo.deleteMany({}),
            LiveChat.deleteMany({}),
            LiveSession.deleteMany({}),
            OtpToken.deleteMany({}),
            Payment.deleteMany({}),
            PreRecordedVideo.deleteMany({}),
        ]);
        console.log("All data cleared.");

        console.log("Seeding primary admin...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("0504", salt);

        await User.create({
            firstName: "Disha",
            lastName: "Thaker",
            email: "dishanailacademy@gmail.com",
            password: hashedPassword,
            role: "admin",
            approvalStatus: "approved"
        });

        console.log("Admin account created: dishanailacademy@gmail.com / 0504");
        console.log("Database is now clean and ready for deployment.");
        
        process.exit(0);
    } catch (error) {
        console.error("Cleanup error:", error);
        process.exit(1);
    }
}

cleanAndSeed();
