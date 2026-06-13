const Gallery = require("../models/Gallery");
const fs = require("fs");
const path = require("path");

// @desc    Add new gallery item
// @route   POST /api/gallery
// @access  Admin/SuperAdmin
const addGalleryItem = async (req, res) => {
    try {
        let { instructorId } = req.body;
        
        // If the user is an instructor, they can only upload to their own gallery
        if (req.user && req.user.role === "instructor") {
            instructorId = req.user.id;
        }

        if (!instructorId) {
            return res.status(400).json({ message: "Instructor is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const newGalleryItem = await Gallery.create({
            imageUrl,
            instructorId,
        });

        const populatedItem = await Gallery.findById(newGalleryItem._id).populate("instructorId", "firstName lastName");

        res.status(201).json({
            message: "Gallery item added successfully",
            galleryItem: populatedItem,
        });
    } catch (error) {
        console.error("Error adding gallery item:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ createdAt: -1 }).populate("instructorId", "firstName lastName");
        res.status(200).json(galleryItems);
    } catch (error) {
        console.error("Error fetching gallery items:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get gallery items by instructor ID
// @route   GET /api/gallery/:instructorId
// @access  Public
const getInstructorGallery = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const galleryItems = await Gallery.find({ instructorId }).sort({ createdAt: -1 }).populate("instructorId", "firstName lastName");
        res.status(200).json(galleryItems);
    } catch (error) {
        console.error("Error fetching instructor gallery:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Admin/SuperAdmin
const deleteGalleryItem = async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({ message: "Gallery item not found" });
        }

        // Check ownership if the user is an instructor
        if (req.user && req.user.role === "instructor") {
            if (galleryItem.instructorId.toString() !== req.user.id) {
                return res.status(403).json({ message: "You are not authorized to delete this gallery item" });
            }
        }

        // Delete from local filesystem
        const filePath = path.join(__dirname, "../../", galleryItem.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await galleryItem.deleteOne();

        res.status(200).json({ message: "Gallery item deleted successfully" });
    } catch (error) {
        console.error("Error deleting gallery item:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    addGalleryItem,
    getGalleryItems,
    getInstructorGallery,
    deleteGalleryItem,
};
