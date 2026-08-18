const Product = require("../models/product-model");
const Category = require("../models/category-model");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    if (!name || price === undefined || quantity === undefined || !category) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(400).json({
        status: "error",
        message: "Please provide name, price, quantity, and category."
      });
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(404).json({
        status: "error",
        message: "Referenced category not found."
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      description: description || "",
      price: Number(price),
      quantity: Number(quantity),
      category,
      imageUrl
    });

    await product.populate("category");

    return res.status(201).json({
      status: "success",
      message: "Product created successfully.",
      data: { product }
    });
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.path);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get all products (supports filtering by category)
// @route   GET /api/v1/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Products retrieved successfully.",
      data: { products }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found."
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Product details retrieved successfully.",
      data: { product }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(404).json({
        status: "error",
        message: "Product not found."
      });
    }

    const { name, description, price, quantity, category } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);

    if (category) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        if (req.file) deleteUploadedFile(req.file.path);
        return res.status(404).json({
          status: "error",
          message: "Referenced category not found."
        });
      }
      product.category = category;
    }

    if (req.file) {
      if (product.imageUrl) {
        deleteUploadedFile(product.imageUrl);
      }
      product.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    await updatedProduct.populate("category");

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully.",
      data: { product: updatedProduct }
    });
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.path);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found."
      });
    }

    if (product.imageUrl) {
      deleteUploadedFile(product.imageUrl);
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully.",
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
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
