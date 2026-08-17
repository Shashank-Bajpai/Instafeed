const Post = require("../models/Post");
const User = require("../models/User");
const { generateAltTextFromUrl } = require("./aiController");

// @route  POST /api/posts
exports.createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newPost = await Post.create({
      caption: req.body.caption || "",
      imageUrl: req.file.path,
      altText: "",
      author: req.userId,
    });

    const populatedPost = await Post.findById(newPost._id).populate("author", "username avatar");

    res.status(201).json(populatedPost);

    // Background process for alt-text generation
    generateAltTextFromUrl(req.file.path)
      .then(async (altText) => {
        if (altText) {
          await Post.findByIdAndUpdate(newPost._id, { altText });
        }
      })
      .catch((err) => console.error("Background alt text generation failed:", err.message));
  } catch (error) {
    console.error("Create post error:", error.message);
    res.status(500).json({ message: "Server error creating post" });
  }
};

// @route  GET /api/posts
exports.getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const authorsToShow = [...(currentUser.following || []), req.userId];

    const posts = await Post.find({ author: { $in: authorsToShow } })
      .sort({ createdAt: -1 })
      .populate("author", "username avatar")
      .populate("comments.user", "username avatar");

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get feed error:", error.message);
    res.status(500).json({ message: "Server error fetching feed" });
  }
};

// @route  PUT /api/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.userId
      );
    } else {
      post.likes.push(req.userId);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error("Toggle like error:", error.message);
    res.status(500).json({ message: "Server error toggling like" });
  }
};

// @route  POST /api/posts/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.userId, text });
    await post.save();

    const updatedPost = await Post.findById(post._id).populate("comments.user", "username avatar");
    res.status(201).json(updatedPost.comments);
  } catch (error) {
    console.error("Add comment error:", error.message);
    res.status(500).json({ message: "Server error adding comment" });
  }
};

// @route  DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({ message: "Server error deleting post" });
  }
};