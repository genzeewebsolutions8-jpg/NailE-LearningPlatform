require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected...");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "dishanailsacademy@gmail.com" });
        const hashedPassword = await bcrypt.hash("Hardik@0504", 10);

        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log("Admin user updated successfully with password: Hardik@0504");
            process.exit();
        }

        // Create new admin user
        const admin = await User.create({
            firstName: "Super",
            lastName: "Admin",
            email: "dishanailsacademy@gmail.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin user successfully created!");
        console.log("Email: dishanailsacademy@gmail.com");
        console.log("Password: Hardik@0504");

        process.exit();
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
