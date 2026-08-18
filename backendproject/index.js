const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db-config");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");
const productRoutes = require("./routes/product-routes");
const categoryRoutes = require("./routes/category-routes");
const orderRoutes = require("./routes/order-routes");

// Mount API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", orderRoutes);

// Static route to serve uploaded images directly via URL
// e.g. http://localhost:5000/api/v1/uploads/products/image-name.png
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to BagStore - Premium Online Store for Bags REST API Backend!"
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
