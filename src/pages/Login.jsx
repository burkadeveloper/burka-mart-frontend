import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../api/authApi";
import { setCredentials } from "../features/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axiosClient";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success("Welcome back to Marketplace");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.message?.includes("verify your email")) {
        setShowResend(true);
        toast.error("Email verification required.");
      }
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", { email: form.email });
      toast.success("Verification link sent to your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* --- LEFT SIDE: THE BRAND EXPERIENCE --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900"
      >
        {/* Real lifestyle background image */}
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80"
          alt="Luxury Retail"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-gray-900/40 to-transparent" />

        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-bold text-2xl tracking-tighter"
          >
            <div className="bg-blue-600 p-2 rounded-xl">
              <Sparkles size={24} />
            </div>
            MARKETPLACE
          </Link>

          <div>
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Connect with the <br />
              <span className="text-blue-400 font-serif italic">
                heart of commerce
              </span>{" "}
              <br />
              in Ethiopia.
            </h2>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-white">10k+</p>
                <p className="text-blue-200/60 text-sm uppercase tracking-widest">
                  Active Buyers
                </p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-blue-200/60 text-sm uppercase tracking-widest">
                  Verified Sellers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/60 text-sm">
            <ShieldCheck className="text-blue-400" size={20} />
            Secure transaction environment powered by Chapa
          </div>
        </div>
      </motion.div>

      {/* --- RIGHT SIDE: THE FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2 mb-12 text-gray-900 dark:text-white font-bold text-xl"
          >
            <ChevronLeft size={20} /> Back to Store
          </Link>

          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Enter your credentials to access your account.
            </p>
          </header>

          <AnimatePresence>
            {verificationRequired && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm flex gap-3"
              >
                <ShieldCheck size={20} />
                <p>
                  Registration successful! Please check your email for the
                  verification link.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-gray-200 dark:shadow-none hover:bg-gray-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In{" "}
                  <LogIn
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            {showResend && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleResend}
                className="w-full text-center text-sm font-bold text-blue-600 hover:underline"
              >
                Resend verification email
              </motion.button>
            )}
          </form>

          <footer className="mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              New to Marketplace?{" "}
              <Link
                to="/register"
                className="text-gray-900 dark:text-white font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
