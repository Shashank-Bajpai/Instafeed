const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../config/cloudinary");
const memoryUpload = require("../config/memoryUpload");
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");
const { generateCaption } = require("../controllers/aiController");

// AI caption suggestion — uses memory storage since we don't save this image yet
router.post("/generate-caption", protect, memoryUpload.single("image"), generateCaption);

// Every route here is protected — you must send a valid JWT to use them.
router.post("/", protect, upload.single("image"), createPost);
router.get("/", protect, getFeed);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);

module.exports = router;