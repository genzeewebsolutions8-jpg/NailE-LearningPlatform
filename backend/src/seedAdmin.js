require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected...");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@nailacademy.com" });

        if (existingAdmin) {
            console.log("Admin user already exists. Credentials:");
            console.log("Email: admin@nailacademy.com");
            console.log("Password: adminpassword123");
            process.exit();
        }

        // Create new admin user
        const hashedPassword = await bcrypt.hash("adminpassword123", 10);

        const admin = await User.create({
            firstName: "Super",
            lastName: "Admin",
            email: "admin@nailacademy.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin user successfully created!");
        console.log("Email: admin@nailacademy.com");
        console.log("Password: adminpassword123");

        process.exit();
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
