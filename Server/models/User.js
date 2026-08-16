const mongoose = require("mongoose");

// This is the "template" every user document in MongoDB will follow.
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,   // no two users can have the same username
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // this will store the HASHED password, never plain text
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "", // will hold a Cloudinary URL later
    },
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);