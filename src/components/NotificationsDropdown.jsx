import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import {
  Bell,
  CheckCheck,
  Package,
  Mail,
  ShoppingBag,
  Ticket,
  UserCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: countData } = useQuery({
    queryKey: ["notifUnreadCount"],
    queryFn: () =>
      api.get("/notifications/unread-count").then((res) => res.data),
    refetchInterval: 30000,
  });

  const { data: notifsData, refetch } = useQuery({
    queryKey: ["notificationsDropdown"],
    queryFn: () => api.get("/notifications").then((res) => res.data),
    enabled: isOpen,
    staleTime: 10000,
  });

  const markAsRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifUnreadCount"]);
      queryClient.invalidateQueries(["notificationsDropdown"]);
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.put("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifUnreadCount"]);
      queryClient.invalidateQueries(["notificationsDropdown"]);
    },
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = notifsData?.notifications || [];
  const unreadCount = countData?.count || 0;

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <Package size={14} className="text-blue-500" />;
      case "broadcast":
        return <Mail size={14} className="text-purple-500" />;
      case "product":
        return <ShoppingBag size={14} className="text-green-500" />;
      case "ticket":
        return <Ticket size={14} className="text-orange-500" />;
      case "seller_request":
        return <UserCheck size={14} className="text-yellow-500" />;
      default:
        return <Bell size={14} className="text-gray-500" />;
    }
  };

  const handleClick = (notif) => {
    if (!notif.isRead) markAsRead.mutate(notif._id);
    if (notif.data?.orderId) navigate(`/order-status/${notif.data.orderId}`);
    else if (notif.data?.productId)
      navigate(`/product/${notif.data.productId}`);
    else if (notif.data?.ticketId) navigate(`/ticket/${notif.data.ticketId}`);
    else if (notif.data?.requestId)
      navigate("/profile"); // seller request status in profile
    else if (notif.data?.broadcast) navigate("/");
    else navigate("/");
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border z-50 overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <CheckCheck size={12} /> Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${!notif.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-2 border-t text-center">
              <button
                onClick={handleViewAll}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
