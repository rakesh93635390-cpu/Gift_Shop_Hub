const express = require("express");
const controller = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Register User
router.post("/register", controller.postRegister);

// Login User

router.post("/login", controller.postLogin);

// Get user datas
router.get("/profile", authMiddleware, controller.getProfile);

// Update user datas
router.put("/profile", authMiddleware, controller.putProfile);

// Change logged-in user's password
router.put("/change-password", authMiddleware, controller.changePassword);

// Admin-only route
router.get("/admin", authMiddleware, adminMiddleware, controller.getAdmin);

//   User Api for admin
router.get("/users", authMiddleware, adminMiddleware, controller.getUsers);

// update user by admin
router.put("/user/:id", authMiddleware, adminMiddleware, controller.putUserByid);

// Delete user by admin
router.delete("/user/:id", authMiddleware, adminMiddleware, controller.deleteUserByid);

//  ==============Shop Api for admin===========

router.post("/shop", authMiddleware, adminMiddleware, controller.postShop);

// Shop Update

router.put("/shop/:id", authMiddleware, adminMiddleware, controller.putShopByid);

// Shop delete

router.delete("/shop/:id", authMiddleware, adminMiddleware, controller.deleteShopByid);

// Get Shop Item
router.get("/shop/:id", authMiddleware, controller.getShopByid);

// Get All Shops
router.get("/shops", authMiddleware, controller.getShops);

//Location-based shop listing

router.get("/shops/location/:location", authMiddleware, controller.getShopsLocationBylocation);

// Shop Name Search

router.get("/shops/name/:name", authMiddleware, controller.getShopsNameByname);

// Shop Location Filter
router.get("/shops/filter/location", authMiddleware, controller.getShopsFilterLocation);

// Active shop status filter

router.get("/shops/active", authMiddleware, controller.getShopsActive);

// Shop Pagination

router.get("/shops/pagination", authMiddleware, controller.getShopsPagination);

// =========== Product Management===========

// Product Creation

router.post("/product", authMiddleware, adminMiddleware, controller.postProduct);

// Get all products
router.get("/products", authMiddleware, controller.getProducts);

// Get product by ID
router.get("/product/:id", authMiddleware, controller.getProductByid);

// Update Product
router.put("/product/:id", authMiddleware, adminMiddleware, controller.putProductByid);

// Delete Product
router.delete("/product/:id", authMiddleware, adminMiddleware, controller.deleteProductByid);

// Get products by shop
router.get("/products/shop/:shopId", authMiddleware, controller.getProductsShopByshopId);

// Search products by name
router.get("/products/search/:name", authMiddleware, controller.getProductsSearchByname);

// Get products by category
router.get("/products/category/:category", authMiddleware, controller.getProductsCategoryBycategory);

// Filter products by price range
router.get("/products/filter/price", authMiddleware, controller.getProductsFilterPrice);

// Product Pagination

router.get("/products/pagination", authMiddleware, controller.getProductsPagination);

// Filter products by stock availability
router.get("/products/filter/stock", authMiddleware, controller.getProductsFilterStock);

// ======Cart and order management======

router.post("/cart", authMiddleware, controller.postCart);

// Get Cart Items
router.get("/carts", authMiddleware, controller.getCarts);

// Update Cart Item Quantity
router.put("/cart/:productId", authMiddleware, controller.putCartByproductId);

// Delete Cart Item
router.delete("/cart/:productId", authMiddleware, controller.deleteCartByproductId);

// Customer Order Placement
router.post("/order", authMiddleware, controller.postOrder);

// customer Order History
router.get("/orders", authMiddleware, controller.getOrders);

// Admin order management
router.get("/admin/orders", authMiddleware, adminMiddleware, controller.getAdminOrders);
router.put(
  "/admin/order/:id/status",
  authMiddleware,
  adminMiddleware,
  controller.putAdminOrderStatus
);

// Dashboard Analytics for Admin
router.get("/dashboard/analytics", authMiddleware, adminMiddleware, controller.getDashboardAnalytics);

module.exports = router;
