const Post = require("../models/Post");
const { generateAltTextFromUrl } = require("./aiController");

// @route  POST /api/posts  (protected, expects multipart/form-data with "image" field)
exports.createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Create the post immediately with empty altText — don't make the user
    // wait for the AI call. This is the "fire and forget" pattern.
    const newPost = await Post.create({
      caption: req.body.caption || "",
      imageUrl: req.file.path,
      altText: "",
      author: req.userId,
    });

    const populatedPost = await newPost.populate("author", "username avatar");

    // Respond to the client RIGHT NOW — don't make them wait for AI.
    res.status(201).json(populatedPost);

    // AFTER responding, generate alt text in the background.
    // Note: no `await` here on the outer call — this runs after the response
    // has already been sent, so it doesn't add any delay for the user.
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

// @route  GET /api/posts  (protected — returns feed: your posts + people you follow)
exports.getFeed = async (req, res) => {
  try {
    const User = require("../models/User");
    const currentUser = await User.findById(req.userId);

    // Show posts from people you follow, PLUS your own posts
    const authorsToShow = [...currentUser.following, req.userId];

    const posts = await Post.find({ author: { $in: authorsToShow } })
      .sort({ createdAt: -1 }) // newest first
      .populate("author", "username avatar")
      .populate("comments.user", "username avatar");

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get feed error:", error.message);
    res.status(500).json({ message: "Server error fetching feed" });
  }
};

// @route  PUT /api/posts/:id/like  (protected — toggle like)
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.userId
    );

    if (alreadyLiked) {
      // unlike: remove userId from likes array
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.userId
      );
    } else {
      // like: add userId to likes array
      post.likes.push(req.userId);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error("Toggle like error:", error.message);
    res.status(500).json({ message: "Server error toggling like" });
  }
};

// @route  POST /api/posts/:id/comment  (protected)
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.userId, text });
    await post.save();

    const updatedPost = await post.populate("comments.user", "username avatar");
    res.status(201).json(updatedPost.comments);
  } catch (error) {
    console.error("Add comment error:", error.message);
    res.status(500).json({ message: "Server error adding comment" });
  }
};

// @route  DELETE /api/posts/:id  (protected — only author can delete)
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