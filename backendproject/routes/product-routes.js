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
const { authorize } = require("../middlewares/authorization-middleware");
const upload = require("../middlewares/multer-middleware");

// Public routes (Customers can browse products)
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected Admin-only routes (Only Admin can create, update, or delete products)
router.post("/", protect, authorize("admin"), upload.single("imageUrl"), createProduct);
router.put("/:id", protect, authorize("admin"), upload.single("imageUrl"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
