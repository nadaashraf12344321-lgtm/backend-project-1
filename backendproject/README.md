# BagStore - E-Commerce REST API Backend

BagStore is a specialized E-Commerce REST API backend for an online bags store built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Multer** file uploads.

---

## 1. Authentication Module & Security Architecture

BagStore features a clean, modular authentication system:

- **Separated Auth Architecture**:
  - `models/user-model.js`: Defines user schema, role enums, `select: false` on passwords, and bcrypt pre-save hashing.
  - `controllers/auth-controller.js`: Dedicated controller handling `signup` and `login`.
  - `utils/get-jwt.js`: Centralized JWT token signing utility.
  - `middlewares/auth-middleware.js`: Protects routes by verifying Bearer JWT tokens.
  - `middlewares/authorization-middleware.js`: Enforces role-based permissions (`authorize("admin")`).
  - `routes/auth-routes.js`: Exposes `/signup` and `/login` endpoints.

- **Password Hashing**: Passwords are automatically hashed using `bcryptjs` with a salt factor of 10 prior to database persistence. Passwords are never returned in API responses.
- **JWT Authentication**: JSON Web Tokens (JWT) are issued upon successful login or signup. Protected endpoints require the `Authorization: Bearer <token>` header.
- **Role Privilege Escalation Protection**: Public signup (`POST /api/v1/auth/signup`) strictly enforces the `customer` role. Clients cannot escalate privileges by sending `role: "admin"` in the request body.
- **Role-Based Authorization Middleware**: The `authorize(...roles)` middleware enforces fine-grained access control on admin operations.

---

## 2. User Roles & Access Control

| Role | Permissions & Capabilities |
| :--- | :--- |
| **`customer`** | Default role assigned upon public signup. Can browse products and categories, create orders, view their own profile/orders, and cancel their own pending orders. Cannot mutate products or categories. |
| **`admin`** | Superuser account. Full access to create, update, and delete products, categories, users, and manage order statuses (`confirmed`, `shipped`, `delivered`, `cancelled`). |

---

## 3. API Routes Reference

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required | Role Required | Request Body Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/auth/signup` | Register new customer account | No | Public | `{"name":"John","email":"john@example.com","password":"secret123"}` |
| `POST` | `/api/v1/auth/login` | Authenticate user & get JWT token | No | Public | `{"email":"john@example.com","password":"secret123"}` |

### User Management Routes (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required | Role Required | Request Body Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/users/profile` | View currently logged-in user profile | Yes | Any | Header: `Authorization: Bearer <token>` |
| `GET` | `/api/v1/users` | List all users | Yes | `admin` | Header: `Authorization: Bearer <token>` |
| `GET` | `/api/v1/users/:id` | Get user details by ID | Yes | Self or `admin` | None |
| `PUT` | `/api/v1/users/:id` | Update profile information | Yes | Self or `admin` | `{"name":"John Updated","phone":"+123456789"}` |
| `DELETE` | `/api/v1/users/:id` | Delete user account | Yes | Self or `admin` | None |

### Category Routes (`/api/v1/categories`)

| Method | Endpoint | Description | Auth Required | Role Required | Request Body Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/categories` | List all bag categories | No | Public | None |
| `GET` | `/api/v1/categories/:id` | Get category details | No | Public | None |
| `POST` | `/api/v1/categories` | Create new category | Yes | `admin` | `{"name":"Backpacks","description":"Laptop & executive bags"}` |
| `PUT` | `/api/v1/categories/:id` | Update category | Yes | `admin` | `{"description":"Updated description"}` |
| `DELETE` | `/api/v1/categories/:id` | Delete category | Yes | `admin` | None |

### Product Routes (`/api/v1/products`)

| Method | Endpoint | Description | Auth Required | Role Required | Request Body Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/products` | Browse all products (supports `?category=ID`) | No | Public | None |
| `GET` | `/api/v1/products/:id` | Get product details | No | Public | None |
| `POST` | `/api/v1/products` | Create product (supports `imageUrl` upload) | Yes | `admin` | `form-data`: `name`, `price`, `quantity`, `category`, `imageUrl` |
| `PUT` | `/api/v1/products/:id` | Update product details or image | Yes | `admin` | `form-data`: `price`, `imageUrl` |
| `DELETE` | `/api/v1/products/:id` | Delete product and remove uploaded image | Yes | `admin` | None |

### Order Routes (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required | Role Required | Request Body Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/orders` | Create order (calculates server price & deducts stock) | Yes | Any | `{"products":[{"product":"PROD_ID","quantity":2}],"address":"123 Main St"}` |
| `GET` | `/api/v1/orders` | Customer gets own orders; Admin gets all | Yes | Any | None |
| `GET` | `/api/v1/orders/:id` | Get order details | Yes | Owner or `admin` | None |
| `PUT` | `/api/v1/orders/:id` | Update order status (Restores stock if cancelled) | Yes | Customer (cancel pending only) / `admin` | `{"status":"shipped"}` |
| `DELETE` | `/api/v1/orders/:id` | Delete order (Restores stock if active) | Yes | Owner / `admin` | None |

---

## 4. Installation & Setup Guide

### 1. Clone or Open Project
Open the project directory in VS Code or Terminal:
```bash
cd backendproject
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bagstore_db
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRES_IN=30d
```

### 4. Seed Database (Sample Accounts & Products)
Run the automated seeder script to populate your database with sample categories, products, an **Admin account** (`admin@bagstore.com` / `admin123`), and a **Customer account** (`customer@bagstore.com` / `customer123`):
```bash
npm run seed
```

### 5. Start Server
Run development server:
```bash
npm run dev
```
Or start standard server:
```bash
npm start
```
Server runs at `http://localhost:5000`.
