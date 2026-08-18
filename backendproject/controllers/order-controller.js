const Order = require("../models/order-model");
const Product = require("../models/product-model");

// @desc    Create a new order (Customer)
// @route   POST /api/v1/orders
// @access  Private (Customer / Admin)
const createOrder = async (req, res) => {
  try {
    const { products, address } = req.body;
    // Always assign authenticated user ID as order user
    const userId = req.user._id;

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

    // STOCK VALIDATION & SERVER-SIDE PRICE CALCULATION
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

      // Check stock availability
      if (dbProduct.quantity < item.quantity) {
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for product '${dbProduct.name}'. Available stock: ${dbProduct.quantity}`
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

    // DEDUCT STOCK FROM INVENTORY
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

    await order.populate([
      { path: "user", select: "name email phone address" },
      { path: "products.product", select: "name price imageUrl category" }
    ]);

    return res.status(201).json({
      status: "success",
      message: "Order placed successfully.",
      data: { order }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get orders (Customer gets own orders, Admin gets all)
// @route   GET /api/v1/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let query = {};
    // Customers can ONLY view their own orders
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone address")
      .populate("products.product", "name price imageUrl category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully.",
      data: { orders }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Get order details by ID
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

    // AUTHORIZATION CHECK: Customer can only view their own order details
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You are not authorized to view this order."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order details retrieved successfully.",
      data: { order }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// @desc    Update order status or cancel order
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

    // AUTHORIZATION CHECK: Customers can only update their OWN orders
    if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You are not authorized to modify this order."
      });
    }

    // CUSTOMER AUTHORIZATION RULE:
    // Customers can ONLY cancel their own order if current status is 'pending'
    if (req.user.role !== "admin") {
      if (status && status !== "cancelled") {
        return res.status(403).json({
          status: "error",
          message: "Forbidden. Customers are only allowed to cancel pending orders."
        });
      }
      if (status === "cancelled" && order.status !== "pending") {
        return res.status(400).json({
          status: "error",
          message: `Cannot cancel order. Order status is already '${order.status}'.`
        });
      }
    }

    if (status) {
      const allowedStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
        });
      }

      // STOCK RESTORATION LOGIC: If order is transitioning to 'cancelled', restore stock
      if (status === "cancelled" && order.status !== "cancelled") {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: item.quantity }
          });
        }
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
      data: { order: updatedOrder }
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

    // Only Admin (or customer deleting their own pending order)
    if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden. You are not authorized to delete this order."
      });
    }

    // If deleting an active order, restore stock
    if (order.status !== "cancelled") {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity }
        });
      }
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
