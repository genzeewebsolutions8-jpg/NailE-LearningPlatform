require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Feedback = require("./models/Feedback");
const LiveSession = require("./models/LiveSession");

const checkCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userCount = await User.countDocuments({});
        const admin = await User.findOne({ role: "admin" });
        const feedbackCount = await Feedback.countDocuments({});
        const sessionCount = await LiveSession.countDocuments({});

        console.log("Database Status:");
        console.log(`Total Users: ${userCount}`);
        console.log(`Admin User exists: ${!!admin} (${admin?.email})`);
        console.log(`Feedbacks: ${feedbackCount}`);
        console.log(`Live Sessions: ${sessionCount}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkCounts();
