const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/product-controller");
const { protect } = require("../middlewares/auth-middleware");
const upload = require("../middlewares/multer-middleware");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/", protect, upload.single("imageUrl"), createProduct);
router.put("/:id", protect, upload.single("imageUrl"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
