const multer = require("multer");
const path = require("path");

// Configure storage with dynamic destination based on request route/field
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine target directory based on route URL or fieldname
    if (req.originalUrl && req.originalUrl.includes("/users")) {
      cb(null, path.join(__dirname, "../uploads/users/"));
    } else {
      // Default to products directory
      cb(null, path.join(__dirname, "../uploads/products/"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only image files (png, jpg, jpeg)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const extName = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedExtensions.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only image files (png, jpg, jpeg) are allowed!"),
      false
    );
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB file size limit
  }
});

module.exports = upload;
