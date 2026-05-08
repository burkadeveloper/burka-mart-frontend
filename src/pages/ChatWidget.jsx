import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react";
import api from "../api/axiosClient"; // Import the custom axios instance we fixed
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageHelper";
import { formatDistanceToNow } from "date-fns";

const STORAGE_KEY = "chat_messages";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: "welcome",
        role: "bot",
        text: "Hello! I'm your shopping assistant. How can I help you today? You can ask for product recommendations, order status, or anything about our marketplace.",
        timestamp: Date.now(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userMessage = null) => {
    const messageText = userMessage || input.trim();
    if (!messageText) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: messageText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build conversation history (last 6 messages for context)
    const history = messages.slice(-5).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const { data } = await axios.post("/api/chatbot/chat", {
        message: messageText,
        history,
      });
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: data.reply,
        products: data.products,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: "Sorry, I'm having trouble right now. Please try again later.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const clearConversation = () => {
    if (window.confirm("Clear the conversation history?")) {
      setMessages([
        {
          id: Date.now(),
          role: "bot",
          text: "Conversation cleared. How can I help you?",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const giveFeedback = (messageId, type) => {
    setFeedback((prev) => ({ ...prev, [messageId]: type }));
    // Optionally send feedback to backend
    console.log(`Feedback for message ${messageId}: ${type}`);
  };

  const quickQuestions = [
    "How do I buy a product?",
    "How do I become a seller?",
    "Track my order",
    "Payment methods",
    "Shipping cost",
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        >
          <MessageCircle size={24} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ${
              isMinimized ? "w-80 h-14" : "w-80 md:w-96 h-[600px]"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearConversation}
                  className="hover:opacity-80"
                  title="Clear conversation"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:opacity-80"
                >
                  {isMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:opacity-80"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">
                          {msg.text}
                        </p>
                        {msg.products && msg.products.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.products.map((prod) => (
                              <Link
                                key={prod.id}
                                to={prod.url}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow transition"
                              >
                                <img
                                  src={getImageUrl(prod.image)}
                                  alt={prod.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {prod.title}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    ETB {prod.price}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] opacity-70">
                            {formatDistanceToNow(msg.timestamp, {
                              addSuffix: true,
                            })}
                          </span>
                          {msg.role === "bot" && msg.id !== "welcome" && (
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => giveFeedback(msg.id, "like")}
                                className="hover:opacity-70"
                              >
                                <ThumbsUp
                                  size={10}
                                  className={
                                    feedback[msg.id] === "like"
                                      ? "fill-blue-500"
                                      : ""
                                  }
                                />
                              </button>
                              <button
                                onClick={() => giveFeedback(msg.id, "dislike")}
                                className="hover:opacity-70"
                              >
                                <ThumbsDown
                                  size={10}
                                  className={
                                    feedback[msg.id] === "dislike"
                                      ? "fill-red-500"
                                      : ""
                                  }
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow">
                        <div className="flex space-x-1">
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                <div className="px-3 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full px-3 py-1 transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 border-t dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800 rounded-b-2xl">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
