const express = require("express");
const router = express.Router();
const {
    addGalleryItem,
    getGalleryItems,
    getInstructorGallery,
    deleteGalleryItem,
} = require("../controllers/galleryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const imageUpload = require("../middleware/imageUploadMiddleware");

// Routes
router.post("/", protect, adminOnly, imageUpload.single("image"), addGalleryItem);
router.get("/", getGalleryItems);
router.get("/instructor/:instructorId", getInstructorGallery);
router.delete("/:id", protect, adminOnly, deleteGalleryItem);

module.exports = router;
