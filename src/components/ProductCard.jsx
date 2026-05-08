import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cartSlice";
import { useState } from "react";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/imageHelper";
import { Heart, ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [adding, setAdding] = useState(false);
  const isOwner = user?._id === product.seller?._id;

  const handleAddToCart = async () => {
    if (isOwner) {
      toast.error("You cannot add your own product to cart.");
      return;
    }
    setAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || "",
        quantity: 1,
        stock: product.quantity,
      }),
    );
    toast.success("Added to cart");
    setAdding(false);
  };

  const stockStatus =
    product.quantity > 10
      ? "In Stock"
      : product.quantity > 0
        ? `Only ${product.quantity} left`
        : "Out of Stock";
  const stockColor =
    product.quantity > 10
      ? "text-green-600"
      : product.quantity > 0
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col relative"
    >
      {/* Image Container */}
      <Link
        to={`/product/${product._id}`}
        className="block overflow-hidden relative"
      >
        <div className="aspect-square bg-gray-100 dark:bg-gray-700">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {/* Stock Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-white dark:bg-gray-800 shadow-md ${stockColor}`}
        >
          {stockStatus}
        </div>
        {/* Wishlist Icon (placeholder) */}
        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition">
          <Heart size={16} className="text-gray-500 hover:text-red-500" />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1 hover:text-blue-600 transition">
            {product.title}
          </h3>
        </Link>
        {/* Rating (optional) */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-yellow-400 text-xs">
              {"★".repeat(Math.floor(product.averageRating))}
              {"☆".repeat(5 - Math.floor(product.averageRating))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.totalReviews})
            </span>
          </div>
        )}
        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mt-2">
          ETB {product.price.toLocaleString()}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={adding || product.quantity === 0 || isOwner}
          className="mt-3 w-full py-2 rounded-xl font-medium transition-all duration-200
                     bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                     hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {adding ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart size={16} />
              {isOwner ? "Your Product" : "Add to Cart"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
