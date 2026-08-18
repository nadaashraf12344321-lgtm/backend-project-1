const Category = require("../models/category-model");

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required."
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        status: "error",
        message: "Category with this name already exists."
      });
    }

    const category = await Category.create({
      name,
      description: description || ""
    });

    return res.status(201).json({
      status: "success",
      message: "Category created successfully.",
      data: { category }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      message: "Categories retrieved successfully.",
      data: { categories }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found."
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Category details retrieved successfully.",
      data: { category }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found."
      });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    const updatedCategory = await category.save();

    return res.status(200).json({
      status: "success",
      message: "Category updated successfully.",
      data: { category: updatedCategory }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found."
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully.",
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
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
