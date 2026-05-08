import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.get("/admin/stats").then((res) => res.data),
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => api.get("/admin/users").then((res) => res.data),
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) =>
      api.put(`/admin/users/${userId}`, data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["adminUsers"]),
  });
};
// export const useToggleFeatured = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ productId, isFeatured }) =>
//       api.put(`/admin/products/${productId}/featured`, { isFeatured }),
//     onSuccess: () =>
//       queryClient.invalidateQueries(["adminProducts", "featuredProducts"]),
//   });
// };
export const useAdminModerateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, status }) =>
      api
        .put(`/admin/products/${productId}/moderate`, { status })
        .then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["adminProducts"]),
  });
};

export const useAdminBroadcast = () => {
  return useMutation({
    mutationFn: (data) =>
      api.post("/admin/broadcast", data).then((res) => res.data),
    onSuccess: () => toast.success("Broadcast sent"),
  });
};
export const useToggleFeatured = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, isFeatured }) =>
      api.put(`/admin/products/${productId}/featured`, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProducts"]);
      toast.success("Featured status updated");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });
};
