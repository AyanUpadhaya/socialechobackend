const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      required: false,
    },
    comments: {
      type: [commentSchema],
      default: [],
      required: false,
    },
    picture: {
      type: String,
      default: "",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);
