import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";
// export const useProducts = (filters) => {
//   return useQuery({
//     queryKey: ["products", filters],
//     queryFn: () =>
//       api.get("/products", { params: filters }).then((res) => res.data),
//   });
// };

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get(`/products/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (formData) =>
      api
        .post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data),
  });
};
// Add to existing productApi.js:
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/products/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product updated");
    },
  });
};
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => api.get("/products/featured").then((res) => res.data),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product archived");
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((res) => res.data),
  });
};
// src/api/productApi.js
export const useProducts = (filters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      api.get("/products", { params: filters }).then((res) => res.data),
  });
};
