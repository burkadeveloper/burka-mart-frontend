import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function WalletPage() {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api.get("/wallet").then((res) => res.data),
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount) =>
      api.post("/wallet/withdraw", { amount }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["wallet"]);
      toast.success("Withdrawal request submitted");
      setWithdrawAmount("");
      setShowWithdrawModal(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Withdrawal failed"),
  });

  const wallet = data?.wallet;
  const transactions = data?.transactions || [];

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    withdrawMutation.mutate(amount);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Wallet
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your balance and withdrawals
          </p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available Balance
              </p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                ETB {wallet?.balance?.toLocaleString() || 0}
              </p>
              {wallet?.pendingWithdrawal > 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  Pending withdrawal: ETB{" "}
                  {wallet.pendingWithdrawal.toLocaleString()}
                </p>
              )}
            </div>
            {user?.isSeller && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition shadow-md"
              >
                <ArrowUpRight size={18} /> Request Withdrawal
              </button>
            )}
          </div>
        </motion.div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transaction History
            </h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="px-6 py-4 flex flex-wrap justify-between items-center gap-3"
                >
                  <div className="flex items-center gap-3">
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className="text-green-500" size={20} />
                    ) : (
                      <ArrowUpRight className="text-red-500" size={20} />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(tx.createdAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"} ETB{" "}
                    {tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowWithdrawModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Request Withdrawal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Available: ETB {wallet?.balance?.toLocaleString()}
            </p>
            <input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 dark:bg-gray-700"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {withdrawMutation.isLoading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
