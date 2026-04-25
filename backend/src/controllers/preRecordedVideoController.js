const PreRecordedVideo = require("../models/PreRecordedVideo");


exports.addVideo = async (req, res) => {
  try {
    const { title, description, fees } = req.body;

    if (!req.files || (!req.files.videos && !req.files.thumbnail)) {
      return res.status(400).json({ error: "Please upload at least one video file and a thumbnail" });
    }

    const videoFiles = req.files.videos || [];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    // partTitles may come as a single string (1 file) or an array (multiple files)
    const rawTitles = req.body.partTitles;
    const partTitles = Array.isArray(rawTitles)
      ? rawTitles
      : rawTitles
        ? [rawTitles]
        : [];

    const videos = videoFiles.map((file, index) => ({
      title: partTitles[index] || `Part ${index + 1}: ${file.originalname}`,
      videoUrl: `/uploads/${file.filename}`
    }));

    const video = await PreRecordedVideo.create({
      title,
      description,
      videos,
      thumbnail: thumbnailFile ? `/uploads/${thumbnailFile.filename}` : "",
      fees: fees ? Number(fees) : 0,
      instructorId: req.user._id,
    });

    res.status(201).json({
      message: "Course produced successfully",
      video,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await PreRecordedVideo.find()
      .populate("instructorId", "firstName lastName")
      .sort({ createdAt: -1 });

    const formattedVideos = videos.map(video => {
      const vidObj = video.toObject();
      if (vidObj.instructorId) {
        vidObj.instructor = `${vidObj.instructorId.firstName} ${vidObj.instructorId.lastName}`;
      } else {
        vidObj.instructor = "Academy Instructor";
      }
      return vidObj;
    });

    res.status(200).json({ videos: formattedVideos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get only the courses belonging to the logged-in instructor
exports.getMyVideos = async (req, res) => {
  try {
    const videos = await PreRecordedVideo.find({ instructorId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await PreRecordedVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found"
      });
    }

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({
      error: "Invalid video ID"
    });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedVideo = await PreRecordedVideo.findByIdAndUpdate(
      id,
      req.body,
      { new: true },
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({
      message: "Video updated successfully",
      updatedVideo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVideo = await PreRecordedVideo.findByIdAndDelete(id);

    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
