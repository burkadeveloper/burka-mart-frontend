import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/categories", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category created");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Creation failed"),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/categories/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category updated");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category deleted");
    },
  });
};
