const express = require("express");
const router = express.Router();
const {
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/user-controller");
const { signup, login } = require("../controllers/auth-controller");
const { protect } = require("../middlewares/auth-middleware");
const { authorize } = require("../middlewares/authorization-middleware");
const upload = require("../middlewares/multer-middleware");

// Auth aliases for backward compatibility
router.post("/signup", upload.single("imageUrl"), signup);
router.post("/register", upload.single("imageUrl"), signup);
router.post("/login", login);

// Protected routes
router.get("/profile", protect, getProfile);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, upload.single("imageUrl"), updateUser);
router.delete("/:id", protect, deleteUser);

// Admin-only routes
router.get("/", protect, authorize("admin"), getUsers);

module.exports = router;
