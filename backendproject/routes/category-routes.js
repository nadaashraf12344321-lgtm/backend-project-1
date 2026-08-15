const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require("../controllers/category-controller");
const { protect } = require("../middlewares/auth-middleware");

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Protected routes
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;
