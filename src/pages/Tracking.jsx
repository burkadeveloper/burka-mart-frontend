import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  Map,
} from "lucide-react";
import { format } from "date-fns";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Tracking() {
  const { trackingId: urlTrackingId } = useParams();
  const navigate = useNavigate();
  const [manualTrackingId, setManualTrackingId] = useState("");
  const [searchedId, setSearchedId] = useState(urlTrackingId || "");

  const { data, isLoading, error } = useQuery({
    queryKey: ["tracking", searchedId],
    queryFn: () =>
      api.get(`/shipping/track/${searchedId}`).then((res) => res.data),
    enabled: !!searchedId,
    retry: false,
  });

  const handleTrack = (e) => {
    e.preventDefault();
    if (manualTrackingId.trim()) {
      setSearchedId(manualTrackingId.trim());
      navigate(`/tracking/${manualTrackingId.trim()}`, { replace: true });
    }
  };

  const tracking = data?.tracking;
  const order = tracking?.orderId;

  // Status steps order
  const steps = [
    { key: "pending", label: "Order Placed", icon: Clock, color: "gray" },
    { key: "packed", label: "Packed", icon: Package, color: "blue" },
    { key: "shipped", label: "Shipped", icon: Truck, color: "indigo" },
    { key: "in_transit", label: "In Transit", icon: Map, color: "purple" },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      icon: MapPin,
      color: "orange",
    },
    { key: "delivered", label: "Delivered", icon: CheckCircle, color: "green" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === tracking?.status);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  const isDelivered = tracking?.status === "delivered";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Track Your Package
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your tracking number to see real‑time updates
          </p>
        </div>

        {/* Tracking Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-10">
          <form
            onSubmit={handleTrack}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter tracking number (e.g., MP-abc123)"
                value={manualTrackingId}
                onChange={(e) => setManualTrackingId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition shadow-md"
            >
              Track Order
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {isLoading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400">
              Tracking number not found. Please check and try again.
            </p>
          </div>
        )}

        {tracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Tracking ID & Order Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tracking Number
                  </p>
                  <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                    {tracking.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      tracking.status === "delivered"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : tracking.status === "pending"
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {tracking.status?.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Carrier
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {tracking.carrier || "Marketplace Logistics"}
                  </p>
                </div>
              </div>
              {order && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="font-medium">Order ID:</span> {order._id}
                  </p>
                  <p>
                    <span className="font-medium">Product:</span>{" "}
                    {order.product?.title}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ETB{" "}
                    {order.grandTotal?.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Shipping Address:</span>{" "}
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.subCity}
                  </p>
                </div>
              )}
            </div>

            {/* Circular Progress + Timeline */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Circular Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center">
                <div className="w-48 h-48">
                  <CircularProgressbar
                    value={progressPercent}
                    text={`${Math.round(progressPercent)}%`}
                    styles={buildStyles({
                      textSize: "20px",
                      pathColor: isDelivered ? "#10b981" : "#3b82f6",
                      textColor: "#1f2937",
                      trailColor: "#e5e7eb",
                    })}
                  />
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                  {isDelivered
                    ? "Order delivered successfully!"
                    : "Shipment in progress"}
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Shipment Progress
                </h3>
                <div className="relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.key}
                        className="relative flex gap-4 mb-6 last:mb-0"
                      >
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {step.label}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isCompleted
                              ? step.key === "delivered"
                                ? "Completed"
                                : "Completed"
                              : "Pending"}
                          </p>
                          {isCompleted &&
                            step.key === tracking.status &&
                            tracking.trackingHistory?.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                {format(
                                  new Date(
                                    tracking.trackingHistory[
                                      tracking.trackingHistory.length - 1
                                    ]?.timestamp,
                                  ),
                                  "PPP p",
                                )}
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed History Log */}
            {tracking.trackingHistory &&
              tracking.trackingHistory.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={18} /> Detailed History
                  </h3>
                  <div className="space-y-4">
                    {tracking.trackingHistory
                      .slice()
                      .reverse()
                      .map((event, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {event.status?.replace("_", " ")}
                            </p>
                            {event.location && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                📍 {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {event.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(event.timestamp), "PPP p")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Estimated Delivery (if not delivered) */}
            {!isDelivered && tracking.estimatedDelivery && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <Calendar className="w-5 h-5 text-blue-600 inline mr-2" />
                <span className="text-blue-700 dark:text-blue-300">
                  Estimated delivery:{" "}
                  {format(new Date(tracking.estimatedDelivery), "PPP")}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
