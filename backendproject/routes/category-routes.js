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
const { authorize } = require("../middlewares/authorization-middleware");

// Public routes (Customers can view categories)
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Protected Admin-only routes (Only Admin can create, update, or delete categories)
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
