import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Optionally call backend to confirm payment status
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-4 py-20 text-center"
    >
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Your order #{orderId} has been placed.
      </p>
      <Link
        to="/orders"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        View My Orders
      </Link>
    </motion.div>
  );
}
