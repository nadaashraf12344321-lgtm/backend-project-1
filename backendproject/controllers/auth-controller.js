const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const getJWT = require("../utils/get-jwt");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

// @desc    Register a new customer account
// @route   POST /api/v1/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(400).json({
        status: "error",
        message: "Please provide name, email, and password."
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists."
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/users/${req.file.filename}`;
    }

    // SECURITY: All public signups are assigned 'customer' role.
    // Client cannot escalate privileges by sending role: 'admin'.
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      address: address || "",
      imageUrl,
      role: "customer"
    });

    // Generate JWT token using get-jwt utility
    const token = getJWT(user);

    return res.status(201).json({
      status: "success",
      message: "Account registered successfully.",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          imageUrl: user.imageUrl,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.path);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password inputs
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password."
      });
    }

    // Query user and explicitly select password (since select: false is configured on model)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    // Generate JWT token
    const token = getJWT(user);

    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          imageUrl: user.imageUrl,
          role: user.role
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

module.exports = {
  signup,
  login
};
