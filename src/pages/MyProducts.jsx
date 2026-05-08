import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Plus, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { getImageUrl } from "../utils/imageHelper";

export default function MyProducts() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["myProducts"],
    queryFn: () => api.get("/products/my-products").then((res) => res.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myProducts"]);
      toast.success("Product archived");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete product");
    },
  });

  const products = data?.products || [];

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 dark:text-red-400">
          Failed to load your products. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Products
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your listings – edit, delete or add new products
            </p>
          </div>
          <Link
            to="/create-product"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start selling by adding your first product.
            </p>
            <Link
              to="/create-product"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              Create Product
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {products.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          product.quantity > 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"
                        }`}
                      >
                        {product.quantity > 0
                          ? `${product.quantity} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {product.title}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                      ETB {product.price?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {product.description?.substring(0, 80)}...
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex gap-3">
                    <Link
                      to={`/edit-product/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${product.title}"? This action cannot be undone.`,
                          )
                        ) {
                          deleteProduct.mutate(product._id);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
