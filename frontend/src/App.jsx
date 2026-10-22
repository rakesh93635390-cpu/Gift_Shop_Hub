import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ShopListing from "./pages/ShopListing";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import ShopDetails from "./pages/ShopDetails";

// Admin Imports
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ShopManagement from "./pages/admin/ShopManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
         <Route path="/profile" element={<Profile />} />
         <Route path="/shop-listing" element={<ShopListing/>} />
         <Route path="/shop/:shopId" element={<ShopDetails />} />
          <Route path="/products" element={<Product/>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<OrderHistory />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/shops" element={<ShopManagement/>} />
          <Route path="/admin/products" element={<ProductManagement/>} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
