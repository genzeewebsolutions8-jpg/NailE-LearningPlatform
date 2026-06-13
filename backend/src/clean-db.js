require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Feedback = require("./models/Feedback");
const LandingVideo = require("./models/LandingVideo");
const LiveChat = require("./models/LiveChat");
const LiveSession = require("./models/LiveSession");
const OtpToken = require("./models/OtpToken");
const Payment = require("./models/Payment");
const PreRecordedVideo = require("./models/PreRecordedVideo");

const cleanDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // Models to clear
        const modelsToClear = [
            Feedback,
            LandingVideo,
            LiveChat,
            LiveSession,
            OtpToken,
            Payment,
            PreRecordedVideo,
            User
        ];

        console.log("Clearing collections...");
        for (const model of modelsToClear) {
            await model.deleteMany({});
            console.log(`Cleared ${model.collection.name}`);
        }

        console.log("Re-seeding Admin User...");
        const hashedPassword = await bcrypt.hash("Hardik@0504", 10);
        await User.create({
            firstName: "Super",
            lastName: "Admin",
            email: "dishanailsacademy@gmail.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin user successfully recreated!");
        console.log("Email: dishanailsacademy@gmail.com");
        console.log("Password: Hardik@0504");

        console.log("Database cleanup complete.");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
};

cleanDatabase();
