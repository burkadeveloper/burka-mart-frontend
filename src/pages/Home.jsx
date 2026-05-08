import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
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
  TrendingUp,
  ArrowRight,
  Sparkles,
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
      desc: "Dedicated customer service",
    },
  ];

  const categories = [
    { name: "Electronics", color: "from-blue-500 to-cyan-500", icon: "📱" },
    { name: "Fashion", color: "from-pink-500 to-rose-500", icon: "👕" },
    {
      name: "Home & Garden",
      color: "from-emerald-500 to-teal-500",
      icon: "🏠",
    },
    { name: "Books", color: "from-amber-500 to-orange-500", icon: "📚" },
  ];

  const testimonials = [
    {
      name: "Abebech K.",
      role: "Buyer",
      text: "Amazing platform! Found exactly what I needed at a great price.",
      rating: 5,
    },
    {
      name: "Mekdes T.",
      role: "Seller",
      text: "Selling has never been easier. The wallet system is super convenient.",
      rating: 5,
    },
    {
      name: "Dawit S.",
      role: "Buyer",
      text: "Fast delivery and excellent customer support. Highly recommended!",
      rating: 4,
    },
  ];

  // Determine seller button action
  const renderSellerButton = () => {
    if (!isAuthenticated) {
      return (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          Sign In to Sell <ArrowRight size={18} />
        </Link>
      );
    }
    if (user?.isSeller) {
      return (
        <Link
          to="/seller-dashboard"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          Seller Dashboard <ArrowRight size={18} />
        </Link>
      );
    }
    if (user?.sellerRequestPending) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-full font-semibold cursor-not-allowed"
        >
          Request Pending
        </button>
      );
    }
    return (
      <button
        onClick={() => setShowSellerModal(true)}
        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
      >
        Become a Seller <ArrowRight size={18} />
      </button>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) console.error(error);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-center mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles size={16} />
              <span className="text-sm font-medium">
                Welcome to Ethiopia's #1 Marketplace
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Buy and Sell Anything in Ethiopia
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              Join thousands of users buying and selling products across the
              country. Safe, fast, and secure payments with Chapa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Start Shopping <ArrowRight size={18} />
              </Link>
              {renderSellerButton()}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The best marketplace experience in Ethiopia
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Find what you're looking for
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer group"
              >
                <Link to={`/products?category=${cat.name.toLowerCase()}`}>
                  <div
                    className={`bg-gradient-to-br ${cat.color} p-8 text-center text-white transition-transform duration-300 group-hover:scale-105`}
                  >
                    <div className="text-5xl mb-3">{cat.icon}</div>
                    <h3 className="text-xl font-semibold">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Handpicked just for you
              </p>
            </div>
            <Link
              to="/products"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
              <p className="text-gray-500 dark:text-gray-400">
                No featured products yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Trusted by thousands across Ethiopia
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  “{testimonial.text}”
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action – Become a Seller */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our marketplace and reach thousands of customers across
              Ethiopia.
            </p>
            {renderSellerButton()}
          </motion.div>
        </div>
      </section>

      {/* Seller Request Modal */}
      {showSellerModal && (
        <SellerRequestModal onClose={() => setShowSellerModal(false)} />
      )}
    </div>
  );
}
