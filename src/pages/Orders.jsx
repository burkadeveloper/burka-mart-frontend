import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MapPin,
  AlertCircle,
} from "lucide-react";
import api from "../api/axiosClient";
import LoadingSpinner from "../components/LoadingSpinner";
import { getImageUrl } from "../utils/imageHelper";
import { format } from "date-fns";

export default function Orders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders/my-orders").then((res) => res.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load orders
      </div>
    );

  const orders = data?.orders || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={18} />;
      case "shipped":
        return <Truck className="text-blue-500" size={18} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <Clock className="text-yellow-500" size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  // Tracking status mapping
  const trackingStatusLabels = {
    pending: "Pending",
    packed: "Packed",
    shipped: "Shipped",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  };

  const getTrackingStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "in_transit":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "packed":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your purchases
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              No orders yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order ID
                    </p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {order._id.slice(-12)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(order.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 flex flex-wrap gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(order.product?.images?.[0])}
                      alt={order.product?.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {order.product?.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {order.quantity}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                      ETB {order.grandTotal?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    {order.trackingNumber ? (
                      <Link
                        to={`/tracking/${order.trackingNumber}`}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        <Truck size={14} /> Track Order
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Tracking not available
                      </span>
                    )}
                    <Link
                      to={`/order-status/${order._id}`}
                      className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 text-sm"
                    >
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                </div>

                {/* Tracking Status Bar (if tracking number exists) */}
                {order.trackingNumber && order.trackingStatus && (
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Shipping Status</span>
                      <span className="font-medium capitalize">
                        {trackingStatusLabels[order.trackingStatus] ||
                          order.trackingStatus}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: (() => {
                            const steps = [
                              "pending",
                              "packed",
                              "shipped",
                              "in_transit",
                              "out_for_delivery",
                              "delivered",
                            ];
                            const index = steps.indexOf(order.trackingStatus);
                            return index >= 0
                              ? `${((index + 1) / steps.length) * 100}%`
                              : "0%";
                          })(),
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Pending</span>
                      <span>Packed</span>
                      <span>Shipped</span>
                      <span>In Transit</span>
                      <span>Out for Delivery</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
