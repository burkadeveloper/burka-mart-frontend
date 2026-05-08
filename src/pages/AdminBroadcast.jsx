import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion } from "framer-motion";
import {
  Send,
  Users,
  Mail,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBroadcast() {
  const [form, setForm] = useState({
    subject: "",
    html: "",
    userFilter: "all",
  });
  const [previewMode, setPreviewMode] = useState(false);

  const broadcast = useMutation({
    mutationFn: (data) =>
      api.post("/admin/broadcast", data).then((res) => res.data),
    onSuccess: () => {
      toast.success("Broadcast sent successfully!");
      setForm({ subject: "", html: "", userFilter: "all" });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to send broadcast"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!form.html.trim()) {
      toast.error("Message content is required");
      return;
    }
    broadcast.mutate(form);
  };

  const userFilterOptions = [
    {
      value: "all",
      label: "All Users",
      icon: Users,
      description: "Send to every registered user",
    },
    {
      value: "sellers",
      label: "Sellers Only",
      icon: Users,
      description: "Users who are sellers",
    },
    {
      value: "buyers",
      label: "Buyers Only",
      icon: Users,
      description: "Users who are not sellers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Email Broadcast
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Send mass emails to your users
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipients
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {userFilterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, userFilter: opt.value })
                      }
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                        form.userFilter === opt.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <Users
                        size={24}
                        className={
                          form.userFilter === opt.value
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                      <span className="text-sm font-medium mt-1">
                        {opt.label}
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        {opt.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="e.g., Special Offer Just for You!"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* HTML Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Content (HTML) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="12"
                  value={form.html}
                  onChange={(e) => setForm({ ...form, html: e.target.value })}
                  placeholder={`<h1>Hello!</h1><p>Your custom message here...</p>`}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags to style your email (e.g.,
                  &lt;strong&gt;, &lt;h1&gt;, &lt;p&gt;).
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={broadcast.isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {broadcast.isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {broadcast.isLoading ? "Sending..." : "Send Broadcast"}
              </button>
            </form>
          </motion.div>

          {/* Preview Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Preview
              </h2>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Eye size={14} /> {previewMode ? "Edit Mode" : "Preview Mode"}
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
              {previewMode ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: form.html || "<em>No content yet.</em>",
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Subject
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {form.subject || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Content Preview
                    </p>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {form.html ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              form.html.substring(0, 300) +
                              (form.html.length > 300 ? "…" : ""),
                          }}
                        />
                      ) : (
                        <em>No content yet.</em>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
              <Mail size={12} className="inline mr-1" /> Emails will be sent via
              your configured SMTP provider.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
