const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true, // the Cloudinary URL of the uploaded image
    },
    altText: {
      type: String,
      default: "", // AI-generated accessibility description
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links this post to whoever created it
      required: true,
    },
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);