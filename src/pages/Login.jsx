import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../api/authApi";
import { setCredentials } from "../features/authSlice";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axiosClient";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutateAsync: login, isLoading } = useLogin();

  const verificationRequired = searchParams.get("verification") === "required";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.message?.includes("verify your email")) {
        setResendEmail(form.email);
        setShowResend(true);
        toast.error(
          "Email not verified. Check your inbox or request a new link.",
        );
      }
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      toast.success("Verification email resent. Please check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Thousands of Products",
      desc: "Shop from a wide variety of categories",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Nationwide shipping with tracking",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      desc: "Protected by Chapa payment gateway",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Dedicated customer service team",
    },
  ];

  const testimonials = [
    {
      name: "Abebe K.",
      role: "Buyer",
      text: "Amazing platform! Found exactly what I needed.",
    },
    {
      name: "Tigist M.",
      role: "Seller",
      text: "I’ve sold over 500 items here. Highly recommended!",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column – Promotional Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Welcome to <span className="text-blue-600">Marketplace</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
                Ethiopia's leading platform to buy and sell with confidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  10K+
                </p>
                <p className="text-xs text-gray-500">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  500+
                </p>
                <p className="text-xs text-gray-500">Trusted Sellers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  4.8★
                </p>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
            </div>
            <div className="space-y-3 pt-4">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>
                    “{t.text}” – {t.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column – Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-center">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-blue-100 mt-1">Access your account</p>
            </div>
            {verificationRequired && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 text-center text-green-700 dark:text-green-300 text-sm">
                Registration successful! Please check your email to verify your
                account.
              </div>
            )}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              {showResend && (
                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-600 underline"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} /> Sign In
                  </>
                )}
              </button>
            </form>
            <div className="px-6 pb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
