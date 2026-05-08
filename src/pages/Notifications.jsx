import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  Mail,
  ShoppingBag,
  Ticket,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["allNotifications"],
    queryFn: () => api.get("/notifications").then((res) => res.data),
  });

  const markAsRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["allNotifications"]);
      queryClient.invalidateQueries(["notifUnreadCount"]);
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.put("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries(["allNotifications"]);
      queryClient.invalidateQueries(["notifUnreadCount"]);
    },
  });

  const notifications = data?.notifications || [];

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <Package size={20} className="text-blue-500" />;
      case "broadcast":
        return <Mail size={20} className="text-purple-500" />;
      case "product":
        return <ShoppingBag size={20} className="text-green-500" />;
      case "ticket":
        return <Ticket size={20} className="text-orange-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const handleClick = (notif) => {
    if (!notif.isRead) markAsRead.mutate(notif._id);
    if (notif.data?.orderId) navigate(`/order-status/${notif.data.orderId}`);
    else if (notif.data?.productId)
      navigate(`/product/${notif.data.productId}`);
    else if (notif.data?.ticketId) navigate(`/ticket/${notif.data.ticketId}`);
    else navigate("/");
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500">
              No notifications.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition cursor-pointer hover:shadow-md ${!notif.isRead ? "border-l-4 border-blue-500" : ""}`}
                onClick={() => handleClick(notif)}
              >
                <div className="flex gap-4">
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{notif.title}</p>
                      <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {notif.message}
                    </p>
                    {!notif.isRead && (
                      <p className="text-xs text-blue-600 mt-2">● Unread</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
