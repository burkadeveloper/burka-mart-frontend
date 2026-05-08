import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  AlertCircle,
  Printer,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import LoadingSpinner from "../components/LoadingSpinner";
import { getImageUrl } from "../utils/imageHelper";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function OrderStatus() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then((res) => res.data),
    enabled: !!orderId,
    retry: 1,
  });

  // Auto-refresh every 5 seconds if payment is pending
  useEffect(() => {
    if (!data?.order) return;
    if (data.order.paymentStatus === "completed") return;

    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [data?.order, refetch]);

  // If redirected from Chapa with payment=success, verify immediately
  useEffect(() => {
    if (paymentSuccess && data?.order?.paymentStatus !== "completed") {
      const verify = async () => {
        try {
          const res = await api.get(`/orders/${orderId}/verify-payment`);
          if (res.data.status === "completed") {
            toast.success("Payment confirmed!");
            refetch();
          }
        } catch (err) {
          console.error("Verification failed", err);
        }
      };
      verify();
    }
  }, [paymentSuccess, orderId, data?.order?.paymentStatus, refetch]);

  const handleManualVerify = async () => {
    try {
      const res = await api.get(`/orders/${orderId}/verify-payment`);
      if (res.data.status === "completed") {
        toast.success("Payment confirmed!");
        refetch();
      } else {
        toast.error("Payment still pending. Please wait.");
      }
    } catch (err) {
      toast.error("Could not verify payment status");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !data?.order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We couldn't find your order details.
          </p>
          <Link
            to="/orders"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = data.order;
  const isPaid = order.paymentStatus === "completed";
  const isDelivered = order.status === "delivered";

  const steps = [
    { key: "pending", label: "Order Placed", icon: Package, completed: true },
    { key: "paid", label: "Payment", icon: CreditCard, completed: isPaid },
    {
      key: "processing",
      label: "Processing",
      icon: Package,
      completed:
        order.status === "processing" ||
        order.status === "shipped" ||
        order.status === "delivered",
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: Truck,
      completed: order.status === "shipped" || order.status === "delivered",
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: CheckCircle,
      completed: order.status === "delivered",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Status
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track your order progress
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="text-sm opacity-90">Order ID</p>
                <p className="text-xl font-mono font-bold">{order._id}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Placed on</p>
                <p className="font-medium">
                  {format(new Date(order.createdAt), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="text-xl font-bold">
                  ETB {order.grandTotal?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.completed;
                const isLast = idx === steps.length - 1;
                return (
                  <div key={step.key} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}
                      >
                        <Icon size={20} />
                      </div>
                      <p className="text-xs mt-2 text-center font-medium text-gray-700 dark:text-gray-300">
                        {step.label}
                      </p>
                    </div>
                    {!isLast && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-0.5 ${isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        style={{ transform: "translateY(-50%)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-6">
              <img
                src={getImageUrl(order.product?.images?.[0])}
                alt={order.product?.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
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
              <Link
                to={`/chat/${order.seller?._id}?product=${order.product?._id}`}
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              >
                <MessageCircle size={14} /> Contact Seller
              </Link>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Payment Status:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${isPaid ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}`}
                >
                  {isPaid ? "Paid" : "Pending"}
                </span>
                {!isPaid && (
                  <button
                    onClick={handleManualVerify}
                    className="ml-2 text-blue-600 hover:underline text-xs flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Check now
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin size={16} /> Shipping Address
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {order.shippingAddress?.city}, {order.shippingAddress?.subCity}
                <br />
                {order.shippingAddress?.detailedAddress}
              </p>
            </div>

            {isDelivered && order.deliveredAt && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Delivered On
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {format(new Date(order.deliveredAt), "PPP")}
                </p>
              </div>
            )}

            {order.trackingNumber && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Tracking Number
                </h3>
                <Link
                  to={`/tracking/${order.trackingNumber}`}
                  className="text-blue-600 hover:underline"
                >
                  📦 {order.trackingNumber}
                </Link>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
            <Link to="/orders" className="text-blue-600 hover:underline">
              ← Back to Orders
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-800"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
