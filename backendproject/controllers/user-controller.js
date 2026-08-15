const User = require("../config/models/user-model");
const jwt = require("jsonwebtoken");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

// Helper function to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide name, email, and password."
      });
    }

    // Check if user with given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Clean up uploaded file if registration fails due to existing user
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists."
      });
    }

    // Process uploaded profile image if provided
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/users/${req.file.filename}`;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      address: address || "",
      imageUrl,
      role: role || "user"
    });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: {
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
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/v1/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password."
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    // Generate JWT Token
    const token = generateToken(user._id, user.role);

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

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public / Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      status: "success",
      message: "Users retrieved successfully.",
      data: {
        users
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/v1/users/:id
// @access  Public / Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }
    return res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: {
        user
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    const { name, phone, address, role } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (role) user.role = role;

    // Handle image update
    if (req.file) {
      // If user had an existing image, delete old file from disk
      if (user.imageUrl) {
        deleteUploadedFile(user.imageUrl);
      }
      user.imageUrl = `/uploads/users/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      status: "success",
      message: "User updated successfully.",
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          imageUrl: updatedUser.imageUrl,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    // Delete profile image if exists
    if (user.imageUrl) {
      deleteUploadedFile(user.imageUrl);
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully.",
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
