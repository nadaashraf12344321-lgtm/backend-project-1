const jwt = require("jsonwebtoken");
const User = require("../config/models/user-model");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Return 401 if token is missing
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id (excluding password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found or token is invalid."
      });
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token."
    });
  }
};

module.exports = { protect };
