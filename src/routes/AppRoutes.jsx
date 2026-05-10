import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy loaded pages
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Orders = lazy(() => import("../pages/Orders"));
const Profile = lazy(() => import("../pages/Profile"));
const Wallet = lazy(() => import("../pages/Wallet"));
const UserTickets = lazy(() => import("../pages/UserTickets"));
const TicketDetail = lazy(() => import("../pages/TicketDetail"));
const Chat = lazy(() => import("../pages/Chat"));
const Tracking = lazy(() => import("../pages/Tracking"));
const CreateProduct = lazy(() => import("../pages/CreateProduct"));
const EditProduct = lazy(() => import("../pages/EditProduct"));
const MyProducts = lazy(() => import("../pages/MyProducts"));
const SellerOrders = lazy(() => import("../pages/SellerOrders"));
const OrderStatus = lazy(() => import("../pages/OrderStatus"));
const NotificationsPage = lazy(() => import("../pages/Notifications"));
const About = lazy(() => import("../pages/About"));
const FAQ = lazy(() => import("../pages/FAQ"));
const Contact = lazy(() => import("../pages/Contact"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));

// Admin pages
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminSellerRequests = lazy(() => import("../pages/AdminSellerRequests"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));
const AdminWithdrawals = lazy(() => import("../pages/AdminWithdrawals"));
const AdminProducts = lazy(() => import("../pages/AdminProducts"));
const AdminTickets = lazy(() => import("../pages/AdminTickets"));
const AdminBroadcast = lazy(() => import("../pages/AdminBroadcast"));
const AdminCategories = lazy(() => import("../pages/AdminCategories"));

const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
            <Route index element={<AdminDashboard />} />
            <Route path="seller-requests" element={<AdminSellerRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="broadcast" element={<AdminBroadcast />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
