const User = require("../models/User");
const Post = require("../models/Post");

// Create a new post
const createPost = async (req, res) => {
  const { title, content, author, picture } = req.body;

  const newPost = new Post({
    title,
    content,
    author,
    picture,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
//get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .limit(20) // Limit to 20 posts
      .populate("author"); // Populate author
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update  post
const updatePostById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Extracted from the JWT token

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res
      .status(200)
      .json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    return res.status(500).json({ error: "Error updating blog post" });
  }
};

//delete post

const deletePostById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Extracted from the JWT token

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error deleting blog post" });
  }
};

//add like
const likePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      post.likes.pull(userId); // Dislike the post
      await post.save();
      return res.status(200).json({ message: "Post disliked successfully" });
    }

    post.likes.push(userId); // Like the post
    await post.save();
    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error liking/disliking the post" });
  }
};

//add comment
const addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      text,
      author: userId,
    };

    post.comments.push(comment);
    await post.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};

//delete comment
const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }

    comment.remove();
    await post.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  updatePostById,
  deletePostById,
  addComment,
  deleteComment,
  likePost,
};
