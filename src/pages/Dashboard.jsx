import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  ShoppingBag,
  User,
  Star,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import LoadingSpinner from "../components/LoadingSpinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function SellerDashboard() {
  const [period, setPeriod] = useState("weekly");
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["sellerStats"],
    queryFn: () => api.get("/dashboard/seller/stats").then((res) => res.data),
  });
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["sellerRecentOrders"],
    queryFn: () => api.get("/dashboard/seller/orders").then((res) => res.data),
  });
  const { data: topProductsData, isLoading: topLoading } = useQuery({
    queryKey: ["sellerTopProducts"],
    queryFn: () =>
      api.get("/dashboard/seller/top-products").then((res) => res.data),
  });
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["sellerSalesChart", period],
    queryFn: () =>
      api
        .get("/dashboard/seller/sales-chart", { params: { period } })
        .then((res) => res.data),
  });

  if (statsLoading || ordersLoading || topLoading || chartLoading)
    return <LoadingSpinner />;

  const statsObj = stats?.stats || {};
  const orders = ordersData?.orders || [];
  const topProducts = topProductsData?.topProducts || [];
  const salesData = chartData?.salesData || [];

  const lineChartData = {
    labels: salesData.map((d) => d._id),
    datasets: [
      {
        label: "Revenue (ETB)",
        data: salesData.map((d) => d.total),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
  const barChartData = {
    labels: topProducts.map((p) => p.product.title),
    datasets: [
      {
        label: "Units Sold",
        data: topProducts.map((p) => p.totalSold),
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seller Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor your sales and performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={statsObj.totalSales || 0}
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title="Delivered"
            value={statsObj.deliveredOrders || 0}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Pending Orders"
            value={statsObj.pendingOrders || 0}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Revenue"
            value={`ETB ${(statsObj.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sales Trend</h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <Line data={lineChartData} options={{ responsive: true }} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales yet</p>
            ) : (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Order ID
                  </th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-sm font-mono">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.buyer?.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ETB {order.grandTotal?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${order.status === "delivered" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/seller-orders?order=${order._id}`}
                        className="text-blue-600 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-sm`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
