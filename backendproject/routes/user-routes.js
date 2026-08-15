const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/user-controller");
const { protect } = require("../middlewares/auth-middleware");
const upload = require("../middlewares/multer-middleware");

// Public routes
router.post("/register", upload.single("imageUrl"), registerUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);

// Protected routes
router.put("/:id", protect, upload.single("imageUrl"), updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
