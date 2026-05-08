import { useParams, useNavigate } from "react-router-dom";
import { useProduct, useProducts } from "../api/productApi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cartSlice";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ChatButton from "../components/ChatButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { getImageUrl } from "../utils/imageHelper";
import SellerMap from "../components/SellerMap";
import ProductReviews from "../components/ProductReviews";
import ProductCard from "../components/ProductCard";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Package,
  Clock,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Related products: same category, exclude current
  const categoryId = data?.product?.category?._id;
  const { data: sameCategory } = useProducts({
    category: categoryId,
    limit: 4,
  });
  let relatedProducts =
    sameCategory?.products?.filter((p) => p._id !== id) || [];

  // If not enough products in same category, fetch latest products as fallback
  const { data: latestProductsData } = useProducts({
    limit: 4 - relatedProducts.length,
    sort: "-createdAt",
  });
  const latestProducts =
    latestProductsData?.products?.filter((p) => p._id !== id) || [];
  if (relatedProducts.length < 4) {
    const needed = 4 - relatedProducts.length;
    const extra = latestProducts.slice(0, needed);
    relatedProducts = [...relatedProducts, ...extra];
  }

  if (isLoading) return <LoadingSpinner />;
  if (error || !data?.product) {
    return (
      <div className="text-center py-20 text-red-500 dark:text-red-400">
        Product not found
      </div>
    );
  }

  const product = data.product;
  const seller = product.seller;
  const images = product.images || [];
  const isOwner = isAuthenticated && seller?._id === user?._id;

  const handleAddToCart = async () => {
    if (product.quantity === 0) return;
    setAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: images[selectedImage] || "",
        quantity,
        stock: product.quantity,
      }),
    );
    toast.success("Added to cart");
    setAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    handleAddToCart();
    navigate("/checkout");
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Main product grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: IMAGES */}
          <div className="space-y-3">
            <div
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md cursor-pointer group"
              onClick={() => openLightbox(selectedImage)}
            >
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-blue-500 shadow" : "border-gray-200 dark:border-gray-700 hover:border-gray-400"}`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO (sticky) */}
          <div className="lg:sticky lg:top-24 space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ETB {product.price.toLocaleString()}
                </p>
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-yellow-500">
                    <span>★ {product.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs">
                      ({product.totalReviews})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Stock:</span>
              <span
                className={
                  product.quantity > 0
                    ? "text-green-600 font-medium"
                    : "text-red-600"
                }
              >
                {product.quantity > 0
                  ? `${product.quantity} available`
                  : "Out of stock"}
              </span>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.quantity > 0 && !isOwner && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        product.quantity,
                        Math.max(1, parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg p-1.5 text-center bg-white dark:bg-gray-800"
                />
              </div>
            )}

            {!isOwner && product.quantity > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2.5 rounded-xl font-medium transition shadow-sm"
                >
                  {addingToCart ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>🛒 Add to Cart</>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition shadow-md"
                >
                  Buy Now
                </button>
                {isAuthenticated && seller?._id && !isOwner && (
                  <ChatButton sellerId={seller._id} productId={product._id} />
                )}
              </div>
            )}

            {isOwner && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-2 text-center text-sm text-yellow-700">
                You cannot purchase your own product.
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
              <h3 className="text-base font-semibold mb-2">Seller Info</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="font-medium">Name:</span> {seller?.name}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {seller?.phone}
                </p>
                {seller?.location && (
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {seller.location.city}, {seller.location.subCity}
                  </p>
                )}
                <button
                  onClick={() => setShowMap(true)}
                  className="text-blue-600 text-xs underline mt-1"
                >
                  📍 View on Map
                </button>
              </div>
            </div>

            {product.shippingOptions?.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                <h3 className="text-base font-semibold mb-2">
                  Shipping Options
                </h3>
                <div className="space-y-1.5">
                  {product.shippingOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md text-sm"
                    >
                      <span className="capitalize">{opt.method}</span>
                      <span className="font-medium">ETB {opt.cost}</span>
                      <span className="text-xs text-gray-500">
                        {opt.estimatedDays} days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ProductReviews productId={product._id} />
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Seller Location</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <SellerMap sellerId={seller._id} height="450px" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft size={40} />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight size={40} />
            </button>
            <img
              src={getImageUrl(images[lightboxIndex])}
              alt={product.title}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
