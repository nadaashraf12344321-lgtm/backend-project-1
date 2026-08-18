const User = require("../models/user-model");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

// @desc    Get currently logged-in user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully.",
      data: {
        user: req.user
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      status: "success",
      message: "Users retrieved successfully.",
      data: { users }
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
// @access  Private (Admin or Self)
const getUserById = async (req, res) => {
  try {
    // Only allow admin or the user themselves to view profile details
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You can only view your own profile."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }
    return res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: { user }
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
// @access  Private (Admin or Self)
const updateUser = async (req, res) => {
  try {
    // Prevent non-admin users from updating someone else's profile
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You can only update your own profile."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    const { name, phone, address, role } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // PRIVILEGE ESCALATION FIX: Only an existing admin can assign or change roles.
    if (role && req.user.role === "admin") {
      user.role = role;
    }

    if (req.file) {
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
    if (req.file) deleteUploadedFile(req.file.path);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin or Self)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You can only delete your own account."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

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
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
