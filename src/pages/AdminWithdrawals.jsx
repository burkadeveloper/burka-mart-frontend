import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminWithdrawals() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminWithdrawals"],
    queryFn: () => api.get("/admin/withdrawals").then((res) => res.data),
    refetchInterval: 30000, // refresh every 30 seconds
  });

  const approveWithdrawal = useMutation({
    mutationFn: (id) => api.put(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminWithdrawals"]);
      toast.success("Withdrawal approved");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Approval failed"),
  });

  const rejectWithdrawal = useMutation({
    mutationFn: (id) => api.put(`/admin/withdrawals/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminWithdrawals"]);
      toast.success("Withdrawal rejected");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Rejection failed"),
  });

  const requests = data?.requests || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Withdrawal Requests
          </h1>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No withdrawal requests found.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {req.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        ETB {req.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            req.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : req.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {req.status === "pending" && <Clock size={12} />}
                          {req.status === "approved" && (
                            <CheckCircle size={12} />
                          )}
                          {req.status === "rejected" && <XCircle size={12} />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(req.createdAt), "PPP")}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveWithdrawal.mutate(req._id)}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectWithdrawal.mutate(req._id)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {req.status !== "pending" && (
                          <span className="text-xs text-gray-400">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
