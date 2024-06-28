const router = require("express").Router();
const postControllers = require("../controllers/postControllers");

const verifyToken = require("../middlewares/verifyToken");
const authenticateUser = require("../middlewares/authenticateUser");

router.post("/post/create", verifyToken, postControllers.createPost);
router.get("/post/all", verifyToken, postControllers.getAllPosts);
router.put(
  "/post/update/:id",
  verifyToken,
  authenticateUser,
  postControllers.updatePostById
);
router.delete(
  "/post/delete/:id",
  authenticateUser,
  authenticateUser,
  postControllers.deletePostById
);

// Like/Dislike a Post
router.patch(
  "/posts/:id/like",
  verifyToken,
  authenticateUser,
  postControllers.likePost
);

// Add a Comment to a Post
router.post(
  "/posts/:id/comments",
  verifyToken,
  authenticateUser,
  postControllers.addComment
);

// Delete a Comment from a Post
router.delete(
  "/posts/:postId/comments/:commentId",
  verifyToken,
  authenticateUser,
  postControllers.deleteComment
);

module.exports = router;
