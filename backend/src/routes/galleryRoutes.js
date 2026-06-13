const express = require("express");
const router = express.Router();
const {
    addGalleryItem,
    getGalleryItems,
    getInstructorGallery,
    deleteGalleryItem,
} = require("../controllers/galleryController");

const { protect, instructorOrAdmin } = require("../middleware/authMiddleware");
const imageUpload = require("../middleware/imageUploadMiddleware");

// Routes
router.post("/", protect, instructorOrAdmin, imageUpload.single("image"), addGalleryItem);
router.get("/", getGalleryItems);
router.get("/instructor/:instructorId", getInstructorGallery);
router.delete("/:id", protect, instructorOrAdmin, deleteGalleryItem);

module.exports = router;
