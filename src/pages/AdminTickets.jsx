import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Filter,
  MessageSquare,
  User,
  Calendar,
  Tag,
  Eye,
  X,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminTickets() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tickets with filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminTickets", statusFilter, searchTerm],
    queryFn: () =>
      api
        .get("/admin/tickets", {
          params: {
            status: statusFilter !== "all" ? statusFilter : undefined,
            search: searchTerm || undefined,
          },
        })
        .then((res) => res.data),
    refetchInterval: 30000, // fallback refresh every 30s
  });

  // Update ticket status
  const updateStatus = useMutation({
    mutationFn: ({ ticketId, status }) =>
      api.put(`/admin/tickets/${ticketId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminTickets"]);
      toast.success("Status updated");
    },
  });

  // Add reply to ticket
  const addReply = useMutation({
    mutationFn: ({ ticketId, message }) =>
      api.post(`/admin/tickets/${ticketId}/reply`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminTickets"]);
      toast.success("Reply sent");
      setReplyText("");
      if (selectedTicket) setIsModalOpen(false);
    },
  });

  // Real‑time socket event for new tickets
  useEffect(() => {
    if (!socket) return;
    const handleNewTicket = () => {
      queryClient.invalidateQueries(["adminTickets"]);
      // Also trigger notification badge update (already covered by socket)
    };
    socket.on("new_ticket", handleNewTicket);
    return () => socket.off("new_ticket");
  }, [socket, queryClient]);

  const tickets = data?.tickets || [];

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

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

  const statusConfig = {
    open: { label: "Open", icon: AlertCircle, color: "yellow" },
    "in-progress": { label: "In Progress", icon: Clock, color: "blue" },
    resolved: { label: "Resolved", icon: CheckCircle, color: "green" },
    closed: { label: "Closed", icon: X, color: "gray" },
  };

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setIsModalOpen(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    addReply.mutate({ ticketId: selectedTicket._id, message: replyText });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Support Tickets
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage customer inquiries
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by subject, message, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Filter size={18} className="text-gray-400 self-center" />
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  statusFilter === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const StatusIcon =
                statusConfig[ticket.status]?.icon || AlertCircle;
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer p-5"
                  onClick={() => handleOpenModal(ticket)}
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
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={12} /> {ticket.user?.name}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />{" "}
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} />{" "}
                          {ticket.responses?.length || 0} replies
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[ticket.status]?.color === "yellow" ? "bg-yellow-100 text-yellow-800" : statusConfig[ticket.status]?.color === "blue" ? "bg-blue-100 text-blue-800" : statusConfig[ticket.status]?.color === "green" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} dark:bg-opacity-20`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig[ticket.status]?.label}
                      </div>
                      <button className="text-blue-600 text-sm flex items-center gap-1">
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {isModalOpen && selectedTicket && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTicket.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[selectedTicket.category]}`}
                  >
                    {selectedTicket.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    From: {selectedTicket.user?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body – Conversation */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Original Message
                </p>
                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {selectedTicket.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(selectedTicket.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {selectedTicket.responses?.map((res, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 ml-4"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Support Team
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(res.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-800 dark:text-gray-200">
                    {res.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer – Reply Form (if not resolved/closed) */}
            {selectedTicket.status !== "resolved" &&
              selectedTicket.status !== "closed" && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex flex-col gap-3">
                    <textarea
                      rows="3"
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-3">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) =>
                          updateStatus.mutate({
                            ticketId: selectedTicket._id,
                            status: e.target.value,
                          })
                        }
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send size={16} /> Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
