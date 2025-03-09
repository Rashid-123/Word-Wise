const { Router } = require("express");

const {
  getAllUsers,
  CreateAdmin,
  addReports,
  getAllReports,
  getUser,
  addFeaturedPost,
  deleteReport,
} = require("../controllers/adminControllers");

const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/create", CreateAdmin);
router.get("/users", getAllUsers);
router.post("/addreports", addReports);
router.get("/getReports", getAllReports);
router.post("/user", getUser);
router.post("/featured", addFeaturedPost);
router.delete("/clearReport", deleteReport);

module.exports = router;
