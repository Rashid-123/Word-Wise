const { Router } = require("express");

const {
  registerUser,
  loginUser,
  loginUser_with_OTP,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
  getBookmarkedPosts,
  loginAdmin,
  removeBookmark,
  addBookmark,
  addReport,
  removeReport,
  OTP_for_Register,
  OTP_for_login,
  add_like,
  remove_like,
  follow,
  unfollow,
  get_followers_following,
} = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");
// const { route } = require("./userRoutes");

const router = Router();

router.post("/register", registerUser);
router.post("/registerOTP", OTP_for_Register);
//
router.post("/login", loginUser);
router.post("/loginOTP", OTP_for_login);
router.post("/loginwithOTP", loginUser_with_OTP);
router.get("/:id", getUser);
router.get("/", getAuthors);
router.post("/change-avatar", authMiddleware, changeAvatar);
router.patch("/edit-user", authMiddleware, editUser);
router.get("/bookmarkedPost/:id", authMiddleware, getBookmarkedPosts);
router.post("/addreport", authMiddleware, addReport);
router.post("/removeReport", authMiddleware, removeReport);
router.post("/addBookmark", authMiddleware, addBookmark);
router.post("/removeBookmark", authMiddleware, removeBookmark);
//
router.post("/followers-followings", get_followers_following);
//
router.post("/addLike", authMiddleware, add_like);
router.post("/removeLike", authMiddleware, remove_like);
router.post("/follow", authMiddleware, follow);
router.post("/unfollow", authMiddleware, unfollow);
//
router.post("/login/admin", loginAdmin);

module.exports = router;
