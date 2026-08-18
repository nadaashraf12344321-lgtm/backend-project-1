const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

/**
 * Authentication middleware to protect routes.
 * Verifies Bearer JWT token from Authorization header and attaches user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No authentication token provided."
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find authenticated user by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User account not found or token is invalid."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token. Please log in again."
    });
  }
};

module.exports = { protect };
