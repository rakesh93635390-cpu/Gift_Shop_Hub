const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const Shop = require("../models/Shop");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

module.exports = {
  postRegister: async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // jwt token generation
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
},
  postLogin: async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const ispasswordValid = await bcrypt.compare(password, user.password);

    if (!ispasswordValid) {
      return res.status(400).json({ message: "Not correct password" });
    }
    // jwt togen verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      message: "User Logged in successfully",
      token: token,
       user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user or server error" });
  }
},
  getProfile: async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User profile accessed successfully",
      userId: req.userId,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accessing user profile",
    });
  }
},
  putProfile: async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profile = user.toObject();
    delete profile.password;

    res.status(200).json({
      message: "User profile updated successfully",
      userId: req.userId,
      user: profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user profile",
    });
  }
},
  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      currentPassword.length === 0 ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message: "Current password is required and new password must be at least 6 characters",
      });
    }

    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error changing password" });
    }
  },
  getAdmin: (req, res) => {
  res.status(200).json({ message: "Admin route accessed successfully" });
},
  getUsers: async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving users",
    });
  }
},
  putUserByid: async (req, res) => {
  try {
    if (
      req.body.status !== undefined &&
      !["active", "inactive"].includes(req.body.status)
    ) {
      return res.status(400).json({
        message: "Status must be either active or inactive",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
},
  deleteUserByid: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userData = user.toObject();
      delete userData.password;
      res
        .status(200)
        .json({ message: "User deleted successfully", user: userData });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  },
  postShop: async (req, res) => {
  try {
    const {
      shopName,
      shopAddress,
      shopContact,
      shopEmail,
      shopDescription,
      shopImage,
      shopLocation,
    } = req.body;
    const shop = await Shop.create({
      shopName,
      shopAddress,
      shopContact,
      shopEmail,
      shopDescription,
      shopImage,
      shopOwner: req.userId,
      shopLocation,
      shopStatus: "pending",
    });
    await shop.populate("shopOwner", "name email");
    res.status(201).json({ message: "Shop created successfully", shop: shop });
  } catch (error) {
    res.status(500).json({ message: "Error creating shop" });
  }
},
  putShopByid: async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("shopOwner", "name email");

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.status(200).json({ message: "Shop updated successfully", shop: shop });
  } catch (error) {
    res.status(500).json({ message: "Error updating shop" });
  }
},
  deleteShopByid: async (req, res) => {
    try {
      const shop = await Shop.findByIdAndDelete(req.params.id);
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      res
        .status(200)
        .json({ message: "Shop deleted successfully", shop: shop });
    } catch (error) {
      res.status(500).json({ message: "Error deleting shop" });
    }
  },
  getShopByid: async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res
      .status(200)
      .json({ message: "Shop retrieved successfully", shop: shop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving shop" });
  }
},
  getShops: async (req, res) => {
  try {
    const shops = await Shop.find().populate("shopOwner", "name email");
    res
      .status(200)
      .json({ message: "Shops retrieved successfully", shops: shops });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving shops" });
  }
},
  getShopsLocationBylocation: async (req, res) => {
  try {
    const location = req.params.location;
    const shops = await Shop.find({
      shopLocation: { $regex: location, $options: "i" },
    });
    res
      .status(200)
      .json({ message: "Shops retrieved successfully", shops: shops });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving shops by location" });
  }
},
  getShopsNameByname: async (req, res) => {
  try {
    const name = req.params.name;
    const shops = await Shop.find({
      shopName: { $regex: name, $options: "i" },
    });
    res
      .status(200)
      .json({ message: "Shops retrieved successfully", shops: shops });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving shops by name" });
  }
},
  getShopsFilterLocation: async (req, res) => {
  try {
    const location = req.query.location;

    const shops = await Shop.find({
      shopLocation: { $regex: location, $options: "i" },
    });

    res.status(200).json({
      message: "Shops retrieved successfully",
      shops: shops,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving shops by location filter",
    });
  }
},
  getShopsActive: async (req, res) => {
  try {
    const shops = await Shop.find({
      shopStatus: "active",
    });

    res.status(200).json({
      message: "Active shops retrieved successfully",
      shops: shops,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving active shops",
    });
  }
},
  getShopsPagination: async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const shops = await Shop.find().skip(skip).limit(limit);

    res.status(200).json({
      message: "Shops retrieved successfully",
      shops: shops,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving shops",
    });
  }
},
  postProduct: async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      productDescription,
      ProductImage,
      productCategory,
      productShop,
      productStock,
    } = req.body;

    const product = new Product({
      productName,
      productPrice,
      productDescription,
      ProductImage,
      productCategory,
      productShop,
      productOwner: req.userId,
      productStock,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error creating product",
    });
  }
},
  getProducts: async (req, res) => {
  try {
    const products = await Product.find()
      .populate("productShop", "shopName")
      .populate("productOwner", "name email");

    res.status(200).json({
      message: "Products retrieved successfully",
      products: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving products",
    });
  }
},
  getProductByid: async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("productShop", "shopName")
      .populate("productOwner", "name email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving product",
    });
  }
},
  putProductByid: async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product: product,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Error updating product",
      });
    }
  },
  deleteProductByid: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Error deleting product",
      });
    }
  },
  getProductsShopByshopId: async (req, res) => {
  try {
    const products = await Product.find({
      productShop: req.params.shopId,
    })
      .populate("productShop", "shopName")
      .populate("productOwner", "name email");

    res.status(200).json({
      message: "Shop products retrieved successfully",
      products: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving shop products",
    });
  }
},
  getProductsSearchByname: async (req, res) => {
  try {
    const products = await Product.find({
      productName: {
        $regex: req.params.name,
        $options: "i",
      },
    })
      .populate("productShop", "shopName");

    res.status(200).json({
      message: "Products found successfully",
      products: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error searching products",
    });
  }
},
  getProductsCategoryBycategory: async (req, res) => {
  try {
    const products = await Product.find({
      productCategory: {
        $regex: req.params.category,
        $options: "i",
      },
    }).populate("productShop", "shopName");

    res.status(200).json({
      message: "Category products retrieved successfully",
      products: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving category products",
    });
  }
},
  getProductsFilterPrice: async (req, res) => {
  try {
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;

    const products = await Product.find({
      productPrice: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    }).sort({ productPrice: 1 });

    res.status(200).json({
      message: "Products filtered and sorted successfully",
      products: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error filtering products",
    });
  }
},
  getProductsPagination: async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      message: "Products retrieved successfully",
      products: products,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error retrieving products",
    });
  }
},
  getProductsFilterStock: async (req, res) => {
  try {
    const products = await Product.find({
      productStock: { $gt: 0 },
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products available in stock",
      });
    }

    res.status(200).json({
      message: "Products filtered successfully",
      products: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error filtering products",
    });
  }
},
  postCart: async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        message:
          "A valid product ID and positive integer quantity are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.userId, ordered: false });
    if (!cart) {
      cart = new Cart({ userId: req.userId, products: [] });
    }

    const cartProduct = cart.products.find(
      (item) => item.productId.toString() === productId,
    );
    if (cartProduct) {
      cartProduct.quantity += parsedQuantity;
    } else {
      cart.products.push({ productId, quantity: parsedQuantity });
    }

    await cart.save();

    return res.status(200).json({
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error adding product to cart" });
  }
},
  getCarts: async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.userId,
      ordered: false,
    }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving cart" });
  }
},
  putCartByproductId: async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "A valid product ID and positive integer quantity are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.userId, ordered: false });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartProduct = cart.products.find(
      (item) => item.productId.toString() === productId,
    );
    if (!cartProduct) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    //    updating the quantity of the product in the cart
    cartProduct.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating cart" });
  }
},
  deleteCartByproductId: async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.userId, ordered: false });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId,
    );
    await cart.save();

    return res.status(200).json({
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error removing product from cart" });
  }
},
  postOrder: async (req, res) => {
  try {
    const { name, phone, address, city, pincode } = req.body;
    const cart = await Cart.findOne({
      userId: req.userId,
      ordered: false,
    }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        message: "Cart is empty or not found",
      });
    }

    let totalPrice = 0;

    cart.products.forEach((item) => {
      totalPrice += item.productId.productPrice * item.quantity;
    });

    const order = new Order({
      userID: req.userId,
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalPrice: totalPrice,
      orderStatus: "pending",
      customerAddress: {
        name,
        phone,
        address,
        city,
        pincode,
      },
    });

    await order.save();

    cart.ordered = true;
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order: order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error placing order",
    });
  }
},
  getOrders: async (req, res) => {
  try {
    const orders = await Order.find({ userID: req.userId }).populate(
      "products.productId",
    );
    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving order history",
    });
  }
},
  getAdminOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("userID", "name email")
        .populate("products.productId", "productName productPrice ProductImage")
        .sort({ _id: -1 });

      return res.status(200).json({
        message: "Orders retrieved successfully",
        orders,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error retrieving orders",
      });
    }
  },
  putAdminOrderStatus: async (req, res) => {
    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const orderStatus =
      typeof req.body?.orderStatus === "string"
        ? req.body.orderStatus.toLowerCase()
        : "";

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderStatus },
        { new: true, runValidators: true }
      )
        .populate("userID", "name email")
        .populate("products.productId", "productName productPrice ProductImage");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error updating order status",
      });
    }
  },
  getDashboardAnalytics: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalShops = await Shop.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();

      res.status(200).json({
        message: "Dashboard analytics retrieved successfully",
        analytics: {
          totalUsers,
          totalShops,
          totalProducts,
          totalOrders,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error retrieving dashboard analytics",
      });
    }
  }
};
