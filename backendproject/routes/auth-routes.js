const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth-controller");
const upload = require("../middlewares/multer-middleware");

// Authentication routes
router.post("/signup", upload.single("imageUrl"), signup);
router.post("/login", login);

module.exports = router;
