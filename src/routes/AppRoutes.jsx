import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Pages
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import Wallet from "../pages/Wallet";
import UserTickets from "../pages/UserTickets";
import TicketDetail from "../pages/TicketDetail";
import Chat from "../pages/Chat";
import Tracking from "../pages/Tracking";
import CreateProduct from "../pages/CreateProduct";
import EditProduct from "../pages/EditProduct";
import MyProducts from "../pages/MyProducts";
import SellerOrders from "../pages/SellerOrders";
import OrderStatus from "../pages/OrderStatus";
import Notifications from "../pages/Notifications";
// Admin pages
import AdminDashboard from "../pages/AdminDashboard";
import AdminSellerRequests from "../pages/AdminSellerRequests";
import AdminUsers from "../pages/AdminUsers";
import AdminWithdrawals from "../pages/AdminWithdrawals";
import AdminProducts from "../pages/AdminProducts";
import AdminTickets from "../pages/AdminTickets";
import AdminBroadcast from "../pages/AdminBroadcast";
import AdminCategories from "../pages/AdminCategories";
import About from "../pages/About";
import FAQ from "../pages/FAQ";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import VerifyEmail from "../pages/VerifyEmail";
import NotificationsPage from "../pages/Notifications";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes with MainLayout (public and protected) */}
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tracking/:id" element={<Tracking />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/tickets" element={<UserTickets />} />
          <Route path="/ticket/:id" element={<TicketDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* Seller routes */}
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/seller-orders" element={<SellerOrders />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin routes with AdminLayout (separate layout) */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="seller-requests" element={<AdminSellerRequests />} />
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="broadcast" element={<AdminBroadcast />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>
      </Route>
    </Routes>
  );
}
