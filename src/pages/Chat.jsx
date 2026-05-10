import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "react-responsive";
import { useSocket } from "../hooks/useSocket";
import {
  useUserChats,
  useChatMessages,
  useGetOrCreateChat,
  useTotalUnreadCount,
} from "../api/chatApi";
import ChatList from "../components/ChatList";
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  X,
  Image as ImageIcon,
  File,
  MessageCircle,
  Menu,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageHelper";
import api from "../api/axiosClient";
import { AnimatePresence, motion } from "framer-motion";

function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  if (!images.length) return null;
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-2xl"
        onClick={onClose}
      >
        ✕
      </button>
      <button
        className="absolute left-4 text-white text-3xl"
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((prev) => (prev - 1 + images.length) % images.length);
        }}
      >
        ‹
      </button>
      <img
        src={getImageUrl(images[current])}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute right-4 text-white text-3xl"
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((prev) => (prev + 1) % images.length);
        }}
      >
        ›
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

function FileAttachment({ onAttach }) {
  const inputRef = useRef();
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/chats/upload", fd);
      onAttach(res.data.file);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    inputRef.current.value = "";
  };
  return (
    <>
      <button
        onClick={() => inputRef.current.click()}
        className="p-1 text-gray-500"
      >
        <Paperclip size={20} />
      </button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}

function AudioRecorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const file = new File([blob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/chats/upload", fd);
      onRecorded(res.data.file);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.current.start();
    setRecording(true);
  };
  const stop = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };
  return (
    <button
      onClick={recording ? stop : start}
      className={`p-1 ${recording ? "text-red-500 animate-pulse" : "text-gray-500"}`}
    >
      <Mic size={20} />
    </button>
  );
}

function StickerPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const stickers = ["😀", "😂", "😍", "😢", "👍", "🔥", "🎉", "❤️", "⭐", "✅"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1 text-gray-500">
        <Smile size={20} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded shadow p-2 grid grid-cols-5 gap-1 z-10">
          {stickers.map((s) => (
            <button
              key={s}
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
              className="text-2xl hover:bg-gray-100 p-1 rounded"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const { userId: otherUserId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const chatIdFromQuery = searchParams.get("chatId");
  const { user } = useSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [chatId, setChatId] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  const { mutateAsync: getOrCreateChat } = useGetOrCreateChat();
  const {
    data: chatsData,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useUserChats();
  const { data: messagesData, isLoading: messagesLoading } =
    useChatMessages(chatId);
  const { refetch: refetchUnread } = useTotalUnreadCount();
  const chats = chatsData?.chats || [];

  // Initialize chat: if chatId in URL, use it; otherwise create new chat
  useEffect(() => {
    if (!user?._id) return;
    if (chatIdFromQuery) {
      setChatId(chatIdFromQuery);
      return;
    }
    if (
      otherUserId &&
      otherUserId !== user._id &&
      !chatId &&
      !loading &&
      !hasNavigatedRef.current
    ) {
      setLoading(true);
      hasNavigatedRef.current = true;
      getOrCreateChat({ otherUserId, productId })
        .then((res) => {
          const newChatId = res.chat?._id || res._id;
          if (newChatId) {
            setChatId(newChatId);
            navigate(
              `/chat/${otherUserId}?chatId=${newChatId}${productId ? `&product=${productId}` : ""}`,
              { replace: true },
            );
          } else throw new Error("Invalid chat response");
        })
        .catch((err) => {
          console.error(err);
          setInitError("Could not start conversation");
          toast.error("Failed to start chat");
        })
        .finally(() => setLoading(false));
    }
  }, [
    otherUserId,
    user?._id,
    productId,
    chatIdFromQuery,
    getOrCreateChat,
    navigate,
    chatId,
    loading,
  ]);

  // Load messages and mark as read
  useEffect(() => {
    if (messagesData?.messages) {
      setLocalMessages(messagesData.messages);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (chatId && user?._id) {
        socket?.emit("mark_chat_read", { chatId });
        refetchUnread();
      }
    }
  }, [messagesData, chatId, user?._id, socket, refetchUnread]);

  // Socket events
  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit("join_chat", chatId);
    const handleNewMessage = (msg) => {
      if (msg.chatId === chatId) {
        setLocalMessages((prev) => [...prev, msg]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (msg.sender !== user._id) {
          toast.success(`New message from ${msg.senderName || "Seller"}`);
          queryClient.invalidateQueries(["chats"]);
          refetchUnread();
        }
      }
    };
    const handleMessageStatus = ({ messageId, status }) => {
      setLocalMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m)),
      );
    };
    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId !== user._id) setOtherTyping(isTyping);
    };
    socket.on("new_message", handleNewMessage);
    socket.on("message_status", handleMessageStatus);
    socket.on("user_typing", handleUserTyping);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_status", handleMessageStatus);
      socket.off("user_typing", handleUserTyping);
      socket.emit("leave_chat", chatId);
    };
  }, [socket, chatId, user._id, queryClient, refetchUnread]);

  const sendMessage = () => {
    if (!input.trim() && attachments.length === 0) return;
    socket.emit("send_message", {
      chatId,
      receiverId: otherUserId,
      message: input,
      productId,
      attachments,
    });
    setInput("");
    setAttachments([]);
  };

  const handleTyping = () => {
    if (!socket || !chatId) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId, isTyping: true });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("typing", { chatId, isTyping: false });
    }, 1000);
  };

  const handleAttach = (fileData) =>
    setAttachments((prev) => [...prev, fileData]);
  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const handleImageClick = (urls, index) => {
    setLightboxOpen(true);
    setLightboxIndex(index);
  };

  // Close mobile sidebar when chatId is set (i.e. conversation opened)
  useEffect(() => {
    if (chatId && isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [chatId, isMobile]);

  const otherParticipant = chats
    .find((c) => c._id === chatId)
    ?.participants?.find((p) => p._id !== user?._id);
  const otherUserName = otherParticipant?.name || otherUserId || "User";
  const otherAvatar = otherParticipant?.profilePicture || null;

  if (!user) return <div className="p-8 text-center">Please login to chat</div>;
  if (loading) return <LoadingSpinner />;
  if (initError)
    return <div className="p-8 text-center text-red-500">{initError}</div>;
  const showPlaceholder = !otherUserId && !chatIdFromQuery;
  const isLoadingMessages =
    (chatId && messagesLoading) || (!chatId && !showPlaceholder);

  const allImages = localMessages.flatMap(
    (msg) =>
      msg.attachments?.filter((a) => a.type === "image").map((a) => a.url) ||
      [],
  );

  return (
    <div className="flex h-[calc(100vh-72px)] bg-gray-100 dark:bg-gray-900">
      {/* Sidebar overlay (mobile) */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {/* Chat List Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r flex flex-col shadow-md transition-transform duration-300 ${
          isMobile && !mobileSidebarOpen ? "-translate-x-full" : "translate-x-0"
        } md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Messages</h2>
          {isMobile && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="text-gray-500"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList chats={chats} loading={chatsLoading} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {isMobile && !chatId && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 bg-blue-600 text-white p-2 rounded-full shadow-md"
          >
            <Menu size={20} />
          </button>
        )}
        {showPlaceholder ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
            <p className="text-gray-500 max-w-sm">
              Select a conversation or start a new chat from a product page.
            </p>
            {isMobile && (
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Open Conversations
              </button>
            )}
          </div>
        ) : isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : !chatId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Unable to load conversation.
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b p-4 flex items-center gap-3 shadow-sm">
              {isMobile && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="text-gray-500"
                >
                  ←
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                {otherAvatar ? (
                  <img
                    src={getImageUrl(otherAvatar)}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  otherUserName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold">{otherUserName}</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>{" "}
                  {isConnected ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {localMessages.map((msg) => {
                const isOwn =
                  msg.sender === user._id || msg.sender?._id === user._id;
                const images =
                  msg.attachments?.filter((a) => a.type === "image") || [];
                const files =
                  msg.attachments?.filter((a) => a.type === "file") || [];
                const audio = msg.attachments?.find((a) => a.type === "audio");
                const sticker = msg.attachments?.find(
                  (a) => a.type === "sticker",
                );
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow"}`}
                    >
                      {msg.message && (
                        <p className="text-sm break-words">{msg.message}</p>
                      )}
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {images.map((img, idx) => (
                            <img
                              key={idx}
                              src={getImageUrl(img.url)}
                              alt="attachment"
                              className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-90"
                              onClick={() =>
                                handleImageClick(
                                  images.map((i) => i.url),
                                  idx,
                                )
                              }
                            />
                          ))}
                        </div>
                      )}
                      {audio && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <audio controls className="w-full h-8 rounded-md">
                            <source
                              src={getImageUrl(audio.url)}
                              type="audio/webm"
                            />
                          </audio>
                          <a
                            href={getImageUrl(audio.url)}
                            download
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Download
                          </a>
                        </div>
                      )}
                      {files.map((file, idx) => (
                        <a
                          key={idx}
                          href={getImageUrl(file.url)}
                          download
                          className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 hover:bg-gray-200"
                        >
                          <File size={16} /> {file.name}
                        </a>
                      ))}
                      {sticker && (
                        <span className="text-4xl mt-1">{sticker.url}</span>
                      )}
                      {isOwn && (
                        <div className="text-xs mt-1 text-right text-blue-200">
                          {msg.status === "read"
                            ? "✓✓ Read"
                            : msg.status === "delivered"
                              ? "✓✓ Delivered"
                              : "✓ Sent"}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {otherTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 px-4 py-2 rounded-2xl text-sm italic animate-pulse">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t flex gap-2 flex-wrap">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-700 rounded-lg p-1 flex items-center gap-1 text-xs"
                  >
                    {att.type === "image" && <ImageIcon size={14} />}
                    {att.type === "audio" && <Mic size={14} />}
                    {att.type === "file" && <Paperclip size={14} />}
                    {att.type === "sticker" && <Smile size={14} />}
                    <span className="truncate max-w-24">
                      {att.name || att.type}
                    </span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 border-t p-4">
              <div className="flex gap-2 items-center">
                <FileAttachment onAttach={handleAttach} />
                <AudioRecorder onRecorded={handleAttach} />
                <StickerPicker
                  onSelect={(sticker) =>
                    setAttachments((prev) => [
                      ...prev,
                      { type: "sticker", url: sticker, name: "sticker" },
                    ])
                  }
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-4 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && attachments.length === 0}
                  className="bg-blue-600 text-white p-2 rounded-full"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={allImages}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
