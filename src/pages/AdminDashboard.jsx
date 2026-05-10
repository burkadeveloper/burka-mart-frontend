import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  TrendingUp,
  ShoppingCart,
  Box,
} from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { getImageUrl } from "../utils/imageHelper";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [ordersLimit, setOrdersLimit] = useState(10);
  const [productsLimit, setProductsLimit] = useState(10);

  // Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get("/admin/stats").then((res) => res.data),
  });

  // Orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
  } = useQuery({
    queryKey: ["adminOrders", ordersLimit],
    queryFn: () =>
      api
        .get(`/admin/orders?limit=${ordersLimit}&skip=0`)
        .then((res) => res.data),
  });

  // Products
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useQuery({
    queryKey: ["adminProducts", productsLimit],
    queryFn: () =>
      api
        .get(`/admin/products?limit=${productsLimit}&skip=0`)
        .then((res) => res.data),
  });

  // Socket events for real‑time updates
  useEffect(() => {
    if (!socket) return;
    const handleNewOrder = () => {
      queryClient.invalidateQueries(["adminOrders"]);
      queryClient.invalidateQueries(["adminStats"]);
    };
    const handleNewProduct = () => {
      queryClient.invalidateQueries(["adminProducts"]);
    };
    socket.on("new_order", handleNewOrder);
    socket.on("new_product", handleNewProduct);
    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("new_product", handleNewProduct);
    };
  }, [socket, queryClient]);

  const stats = statsData?.stats || {};
  const orders = ordersData?.orders || [];
  const products = productsData?.products || [];
  const ordersTotal = ordersData?.total || 0;
  const productsTotal = productsData?.total || 0;

  const loadMoreOrders = () => setOrdersLimit((prev) => prev + 10);
  const loadMoreProducts = () => setProductsLimit((prev) => prev + 10);

  // Skeleton loader for tables
  const TableSkeleton = ({ columns }) => (
    <tr className="animate-pulse">
      {Array(columns)
        .fill(0)
        .map((_, i) => (
          <td key={i} className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </td>
        ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of your marketplace
          </p>
        </motion.div>

        {/* Stats Grid – responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={Users}
            color="blue"
            gradient="from-blue-500 to-blue-600"
            change="+12%"
          />
          <StatCard
            title="Sellers"
            value={stats.sellers || 0}
            icon={ShoppingBag}
            color="green"
            gradient="from-green-500 to-green-600"
            change="+5%"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts || 0}
            icon={Package}
            color="purple"
            gradient="from-purple-500 to-purple-600"
            change="+18%"
          />
          <StatCard
            title="Revenue"
            value={`ETB ${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="yellow"
            gradient="from-yellow-500 to-yellow-600"
            change="+23%"
          />
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View all orders <Eye size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ordersLoading ? (
                  <TableSkeleton columns={6} />
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-4 md:px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {order.buyer?.name || "N/A"}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                        ETB {order.grandTotal?.toLocaleString()}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : order.status === "paid"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {ordersTotal > ordersLimit && !ordersLoading && (
            <div className="px-4 md:px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={loadMoreOrders}
                disabled={ordersFetching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium disabled:opacity-50"
              >
                {ordersFetching ? (
                  "Loading..."
                ) : (
                  <>
                    Load more <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Recent Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Newly Added Products
              </h2>
            </div>
            <Link
              to="/admin/products"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Manage products <Eye size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {productsLoading ? (
                  <TableSkeleton columns={7} />
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products yet
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.title}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {product.title}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {product.seller?.name || "N/A"}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                        ETB {product.price?.toLocaleString()}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : product.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(product.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <Link
                          to={`/admin/products/${product._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm flex items-center justify-end gap-1"
                        >
                          Edit <Edit size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {productsTotal > productsLimit && !productsLoading && (
            <div className="px-4 md:px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={loadMoreProducts}
                disabled={productsFetching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium disabled:opacity-50"
              >
                {productsFetching ? (
                  "Loading..."
                ) : (
                  <>
                    Load more <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Card Component (unchanged, but responsive)
function StatCard({ title, value, icon: Icon, color, gradient, change }) {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800",
    green:
      "from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800",
    purple:
      "from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-800",
    yellow:
      "from-yellow-500/10 to-yellow-600/5 border-yellow-200 dark:border-yellow-800",
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-br ${colorMap[color]} bg-white dark:bg-gray-800 rounded-2xl shadow-md border p-5 md:p-6`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp size={12} /> {change} from last month
            </div>
          )}
        </div>
        <div
          className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
