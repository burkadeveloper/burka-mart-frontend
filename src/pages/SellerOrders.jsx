import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from "date-fns";

export default function SellerOrders() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sellerOrders"],
    queryFn: () =>
      api.get("/orders/my-orders?role=seller").then((res) => res.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }) =>
      api.put(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["sellerOrders"]);
      toast.success("Order status updated");
    },
  });

  const orders = data?.orders || [];

  const statusOptions = [
    { value: "pending", label: "Pending", icon: Clock, color: "yellow" },
    { value: "processing", label: "Processing", icon: Package, color: "blue" },
    { value: "shipped", label: "Shipped", icon: Truck, color: "indigo" },
    {
      value: "delivered",
      label: "Delivered",
      icon: CheckCircle,
      color: "green",
    },
    { value: "cancelled", label: "Cancelled", icon: AlertCircle, color: "red" },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Orders Received
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Manage and update order status
        </p>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStatus =
                statusOptions.find((s) => s.value === order.status) ||
                statusOptions[0];
              const StatusIcon = currentStatus.icon;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order ID
                        </p>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {order._id.slice(-12)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Placed on
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {format(new Date(order.createdAt), "PPP")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Buyer
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.buyer?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total
                        </p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          ETB {order.grandTotal?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-6 items-center">
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Product
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.product?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {order.quantity}
                        </p>
                      </div>
                      <div className="w-48">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Status
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`w-4 h-4 text-${currentStatus.color}-500`}
                          />
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus.mutate({
                                orderId: order._id,
                                status: e.target.value,
                              })
                            }
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Tracking
                        </p>
                        {order.trackingId ? (
                          <Link
                            to={`/tracking/${order.trackingId}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye size={14} /> {order.trackingId}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Not yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
