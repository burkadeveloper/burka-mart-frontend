import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useFeaturedProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import SellerRequestModal from "../components/SellerRequestModal";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  Star,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useFeaturedProducts();
  const [showSellerModal, setShowSellerModal] = useState(false);
  const featuredProducts = data?.products || [];

  const features = [
    {
      icon: ShoppingBag,
      title: "Wide Selection",
      desc: "Thousands of products from trusted sellers",
      color: "text-blue-500",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Nationwide shipping with real-time tracking",
      color: "text-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      desc: "Protected by Chapa industry-leading gateway",
      color: "text-purple-500",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Dedicated team for your peace of mind",
      color: "text-orange-500",
    },
  ];

  const categories = [
    {
      name: "Electronics",
      color: "from-blue-600 to-indigo-600",
      icon: "📱",
      count: "1.2k+ Items",
    },
    {
      name: "Fashion",
      color: "from-rose-500 to-orange-500",
      icon: "👕",
      count: "850+ Items",
    },
    {
      name: "Home & Garden",
      color: "from-emerald-500 to-teal-600",
      icon: "🏠",
      count: "430+ Items",
    },
    {
      name: "Books",
      color: "from-violet-500 to-purple-600",
      icon: "📚",
      count: "210+ Items",
    },
  ];

  const renderSellerButton = (variant = "primary") => {
    const baseClass =
      variant === "primary"
        ? "inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
        : "inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all";

    if (!isAuthenticated)
      return (
        <Link to="/login" className={baseClass}>
          Start Selling <ArrowRight size={20} />
        </Link>
      );
    if (user?.isSeller)
      return (
        <Link to="/seller-dashboard" className={baseClass}>
          Seller Dashboard <ChevronRight size={20} />
        </Link>
      );
    if (user?.sellerRequestPending)
      return (
        <button
          disabled
          className="bg-gray-200 text-gray-500 px-8 py-4 rounded-full font-bold cursor-not-allowed"
        >
          Request Pending...
        </button>
      );

    return (
      <button onClick={() => setShowSellerModal(true)} className={baseClass}>
        Become a Seller <Sparkles size={20} />
      </button>
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-blue-100 selection:text-blue-900">
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gray-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src=""
            alt="Marketplace background"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent" />
        </div>

        {/* Animated Background Blobs (Kept for extra depth) */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[120px] animate-blob" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="backdrop-blur-[2px] p-4 rounded-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md text-blue-300 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/10">
                <Sparkles size={16} />
                <span>ETHIOPIA'S PREMIER MARKETPLACE</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white">
                Buy & Sell with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Confidence.
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed">
                Join the next generation of Ethiopian E-commerce. Secure
                payments via Chapa, verified local sellers, and lightning-fast
                nationwide delivery.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all hover:-translate-y-1"
                >
                  Start Shopping{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                {renderSellerButton("primary")}
              </div>
            </motion.div>

            {/* Hero Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white/5 backdrop-blur-xl bg-white/5 p-2">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80"
                  alt="Quality Products"
                  className="rounded-[2rem] w-full h-[550px] object-cover shadow-2xl"
                />
                {/* Floating Trust Badge */}
                <div className="absolute bottom-10 -left-8 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-2xl z-20 flex items-center gap-4 border border-gray-100 dark:border-gray-700 animate-bounce-slow">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Secure Checkout
                    </p>
                    <p className="text-xs text-gray-500">Verified by Chapa</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* --- STATS / FEATURES --- */}
      <section className="py-16 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center lg:items-start lg:text-left gap-4"
              >
                <div
                  className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ${item.color}`}
                >
                  <item.icon size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* --- CATEGORIES --- */}
      {/* --- CATEGORIES SECTION --- */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Shop by <span className="text-blue-600">Category</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                Explore our curated collections across Ethiopia.
              </p>
            </motion.div>

            <Link
              to="/products"
              className="group flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              View All Collections
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </Link>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Electronics",
                img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=500&auto=format&fit=crop",
                icon: "📱",
                count: "1,240+ Products",
              },
              {
                name: "Fashion",
                img: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=500&auto=format&fit=crop",
                icon: "👕",
                count: "850+ Products",
              },
              {
                name: "Home & Living",
                img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=500&auto=format&fit=crop",
                icon: "🏠",
                count: "620+ Products",
              },
              {
                name: "Books",
                img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=500&auto=format&fit=crop",
                icon: "📚",
                count: "310+ Products",
              },
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-80 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <Link to={`/products?category=${cat.name.toLowerCase()}`}>
                  {/* Background Image with Zoom Effect */}
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Modern Multi-layer Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </div>

                  {/* Content Area */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    {/* Floating Icon */}
                    <div className="mb-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/20 transform group-hover:-translate-y-2 transition-transform duration-300">
                      {cat.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                      {cat.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="text-blue-300 font-medium text-sm">
                        {cat.count}
                      </p>
                      <div className="bg-white rounded-full p-1.5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight size={16} className="text-gray-900" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* --- FEATURED PRODUCTS --- */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/30 rounded-[3rem] mx-4">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Editor's Choice</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Discover high-quality items handpicked for their exceptional value
              and style.
            </p>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-20 rounded-3xl text-center shadow-inner">
              <p className="text-gray-400 font-medium">
                No products to display right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 8).map((product, idx) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* --- SELL CTA --- */}
      <section className="py-24 container mx-auto px-6">
        <div className="bg-blue-600 rounded-[3rem] overflow-hidden relative shadow-2xl shadow-blue-200 dark:shadow-none">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          <div className="relative z-10 px-8 py-16 lg:p-20 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-white">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Start your business journey today.
              </h2>
              <p className="text-blue-100 text-lg mb-0">
                Join 5,000+ Ethiopian entrepreneurs. We handle the logistics and
                payments, you handle the sales.
              </p>
            </div>
            <div className="shrink-0">{renderSellerButton("primary")}</div>
          </div>
        </div>
      </section>
      {/* --- FOOTER-ESQUE SPACER --- */}
      <div className="h-20" />
      {/* --- MODALS --- */}
      <AnimatePresence>
        {showSellerModal && (
          <SellerRequestModal onClose={() => setShowSellerModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
