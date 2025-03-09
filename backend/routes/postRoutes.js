const { Router } = require("express");

const {
  createPost,
  getPosts,
  getSinglePost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
  getFeaturedPost,
  removeEventListener,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.post("/:id", getSinglePost);
router.patch("/:id", editPost);
router.get("/categories/:category", getCatPosts);
router.get("/users/:id", getUserPosts);
router.delete("/:id", authMiddleware, deletePost);
router.get("/getfeatured", getFeaturedPost);
module.exports = router;
