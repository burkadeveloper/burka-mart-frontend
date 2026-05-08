import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Trash2 } from "lucide-react";
import { getImageUrl } from "../utils/imageHelper";
import { useDeleteChat } from "../api/chatApi";
import toast from "react-hot-toast";

export default function ChatList({ chats, loading }) {
  const { chatId: activeChatId } = useParams();
  const deleteChat = useDeleteChat();
  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?._id;
    } catch {
      return null;
    }
  })();

  if (loading)
    return <div className="p-4 text-gray-400 animate-pulse">Loading...</div>;
  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
        <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No conversations yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Start a chat from any product page
        </p>
      </div>
    );
  }

  // Ensure unique keys – use _id + index as fallback
  const sortedChats = [...chats].sort(
    (a, b) =>
      new Date(b.lastMessageTime || b.createdAt) -
      new Date(a.lastMessageTime || a.createdAt),
  );

  const handleDelete = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Delete this conversation? This cannot be undone.")) {
      deleteChat.mutate(chatId);
    }
  };

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {sortedChats.map((chat, idx) => {
        const other = chat.participants?.find((p) => p._id !== currentUserId);
        if (!other) return null;
        const name = other.name || "User";
        const avatar = other.profilePicture || null;
        const lastMessage = chat.lastMessage || "No messages yet";
        const lastTime = chat.lastMessageTime
          ? new Date(chat.lastMessageTime)
          : new Date(chat.createdAt);
        const isActive = activeChatId === chat._id;
        const unread = chat.unreadCount || 0;
        const uniqueKey = chat._id || `chat-${idx}`; // fallback to index if _id missing (shouldn't happen)

        return (
          <Link
            key={uniqueKey}
            to={`/chat/${other._id}?chatId=${chat._id}`}
            className={`block p-4 transition ${isActive ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {avatar ? (
                  <img
                    src={getImageUrl(avatar)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold truncate">{name}</h4>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(lastTime, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
                <button
                  onClick={(e) => handleDelete(e, chat._id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
