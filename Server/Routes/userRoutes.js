const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  toggleFollow,
  getProfile,
  searchUsers,
} = require("../controllers/userController");

router.get("/search", protect, searchUsers); // must come BEFORE /:id or "search" gets treated as an id
router.put("/:id/follow", protect, toggleFollow);
router.get("/:id", protect, getProfile);

module.exports = router;