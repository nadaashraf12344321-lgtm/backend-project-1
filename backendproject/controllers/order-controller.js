const Order = require("../config/models/order-model");
const Product = require("../config/models/product-model");

// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { products, address } = req.body;
    // Use authenticated user ID, or check req.body.user if provided
    const userId = req.user ? req.user._id : req.body.user;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required to create an order."
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please provide an array of products for the order."
      });
    }

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Shipping address is required."
      });
    }

    let calculatedTotalPrice = 0;
    const orderItems = [];

    // Fetch actual prices from MongoDB to prevent client price tampering
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Each order item must have a valid product ID and positive quantity."
        });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({
          status: "error",
          message: `Product with ID ${item.product} not found.`
        });
      }

      // Check stock availability (optional validation)
      if (dbProduct.quantity < item.quantity) {
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for product '${dbProduct.name}'. Available: ${dbProduct.quantity}`
        });
      }

      const itemTotalPrice = dbProduct.price * item.quantity;
      calculatedTotalPrice += itemTotalPrice;

      orderItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: dbProduct.price
      });
    }

    // Create the order
    const order = await Order.create({
      user: userId,
      products: orderItems,
      totalPrice: calculatedTotalPrice,
      address,
      status: "pending"
    });

    // Optionally update inventory stock for ordered products
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Populate user and product details for response
    await order.populate([
      { path: "user", select: "name email phone address" },
      { path: "products.product", select: "name price imageUrl category" }
    ]);

    return res.status(201).json({
      status: "success",
      message: "Order placed successfully.",
      data: {
        order
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    // If admin, retrieve all orders; if regular user, retrieve user's orders
    let query = {};
    if (req.user && req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone address")
      .populate("products.product", "name price imageUrl category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully.",
      data: {
        orders
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("products.product", "name price imageUrl category");

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order details retrieved successfully.",
      data: {
        order
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Update order status or address
// @route   PUT /api/v1/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const { status, address } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found."
      });
    }

    if (status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
      ];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
        });
      }
      order.status = status;
    }

    if (address) {
      order.address = address;
    }

    const updatedOrder = await order.save();
    await updatedOrder.populate([
      { path: "user", select: "name email phone address" },
      { path: "products.product", select: "name price imageUrl category" }
    ]);

    return res.status(200).json({
      status: "success",
      message: "Order updated successfully.",
      data: {
        order: updatedOrder
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found."
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Order deleted successfully.",
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
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
