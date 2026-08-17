const User = require("../models/User");

// @route  PUT /api/users/:id/follow
exports.toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.userId;

    if (targetId === myId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(myId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.some(
      (id) => id.toString() === myId
    );

    if (isFollowing) {
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== myId
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetId
      );
    } else {
      targetUser.followers.push(myId);
      currentUser.following.push(targetId);
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({
      following: currentUser.following,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Toggle follow error:", error.message);
    res.status(500).json({ message: "Server error toggling follow" });
  }
};

// @route  GET /api/users/:id
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// @route  GET /api/users/search
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const users = await User.find({
      username: { $regex: q, $options: "i" },
    }).select("username avatar");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error.message);
    res.status(500).json({ message: "Server error searching users" });
  }
};