import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { getImageUrl } from "../utils/imageHelper";
import { Search, Star, Archive, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch products with pagination and search
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["adminProducts", page, search],
    queryFn: () =>
      api
        .get("/admin/products", { params: { page, limit, search } })
        .then((res) => res.data),
  });

  // Mutations
  const moderateProduct = useMutation({
    mutationFn: ({ productId, status }) =>
      api.put(`/admin/products/${productId}/moderate`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProducts"]);
      toast.success("Product status updated");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ productId, isFeatured }) =>
      api.put(`/admin/products/${productId}/featured`, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProducts"]);
      toast.success("Featured status updated");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteProduct = useMutation({
    mutationFn: (productId) =>
      api.delete(`/admin/products/${productId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProducts"]);
      toast.success("Product archived");
    },
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Featured
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    ETB {product.price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {product.seller?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : product.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleFeatured.mutate({
                          productId: product._id,
                          isFeatured: !product.isFeatured,
                        })
                      }
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                        product.isFeatured
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Star
                        size={12}
                        className={product.isFeatured ? "fill-yellow-500" : ""}
                      />
                      {product.isFeatured ? "Featured" : "Not Featured"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {product.status !== "active" && (
                        <button
                          onClick={() =>
                            moderateProduct.mutate({
                              productId: product._id,
                              status: "active",
                            })
                          }
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {product.status !== "archived" && (
                        <button
                          onClick={() =>
                            moderateProduct.mutate({
                              productId: product._id,
                              status: "archived",
                            })
                          }
                          className="text-red-600 hover:text-red-800"
                          title="Archive"
                        >
                          <Archive size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Delete product "${product.title}"?`)
                          ) {
                            deleteProduct.mutate(product._id);
                          }
                        }}
                        className="text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
