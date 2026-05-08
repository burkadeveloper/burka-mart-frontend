import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Send,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function UserTickets() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [form, setForm] = useState({
    category: "other",
    subject: "",
    message: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["myTickets"],
    queryFn: () => api.get("/tickets").then((res) => res.data),
  });

  const createTicket = useMutation({
    mutationFn: (data) => api.post("/tickets", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myTickets"]);
      toast.success("Ticket created");
      setModalOpen(false);
      setForm({ category: "other", subject: "", message: "" });
    },
  });

  const addReply = useMutation({
    mutationFn: ({ ticketId, message }) =>
      api.post(`/tickets/${ticketId}/reply`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries(["myTickets"]);
      toast.success("Reply sent");
      setReplyText("");
      setSelectedTicket(null);
    },
  });

  const tickets = data?.tickets || [];

  const statusConfig = {
    open: { label: "Open", icon: Clock, color: "yellow" },
    "in-progress": { label: "In Progress", icon: AlertCircle, color: "blue" },
    resolved: { label: "Resolved", icon: CheckCircle, color: "green" },
    closed: { label: "Closed", icon: X, color: "gray" },
  };

  const categoryColors = {
    payment: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    shipping:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    product:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    account:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Support Tickets
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and manage your support requests
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
          >
            <Plus size={18} /> New Ticket
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                No tickets yet. Create your first support ticket.
              </p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status]?.icon || Clock;
              const statusColor = statusConfig[ticket.status]?.color || "gray";
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition p-6 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {ticket.subject}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[ticket.category]}`}
                        >
                          {ticket.category}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          Created {format(new Date(ticket.createdAt), "PPP")}
                        </span>
                        <span className="flex items-center gap-1">
                          <StatusIcon
                            size={12}
                            className={`text-${statusColor}-500`}
                          />
                          {statusConfig[ticket.status]?.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.responses?.length > 0 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {ticket.responses.length} replies
                        </span>
                      )}
                      <button className="text-blue-600 text-sm">View →</button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Support Ticket</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createTicket.mutate(form);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 dark:bg-gray-700"
                  >
                    <option value="payment">Payment</option>
                    <option value="shipping">Shipping</option>
                    <option value="product">Product</option>
                    <option value="account">Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 dark:bg-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 dark:bg-gray-700"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal (View & Reply) */}
      <AnimatePresence>
        {selectedTicket && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[selectedTicket.category]}`}
                    >
                      {selectedTicket.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Status: {statusConfig[selectedTicket.status]?.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Your original message</p>
                  <p className="mt-1">{selectedTicket.message}</p>
                </div>
                {selectedTicket.responses?.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 ml-4"
                  >
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Support Team
                    </p>
                    <p className="mt-1">{res.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(res.createdAt), "PPP p")}
                    </p>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== "resolved" &&
                selectedTicket.status !== "closed" && (
                  <div className="border-t pt-4">
                    <textarea
                      rows="3"
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full border rounded-lg p-2 dark:bg-gray-700"
                    />
                    <button
                      onClick={() =>
                        addReply.mutate({
                          ticketId: selectedTicket._id,
                          message: replyText,
                        })
                      }
                      disabled={!replyText.trim()}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send Reply
                    </button>
                  </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
