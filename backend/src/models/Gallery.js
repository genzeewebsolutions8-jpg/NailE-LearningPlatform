const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
