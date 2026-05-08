import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useSellerOrders = () => {
  return useQuery({
    queryKey: ["sellerOrders"],
    queryFn: () =>
      api.get("/orders/my-orders?role=seller").then((res) => res.data),
  });
};

export const useUpdateShippingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trackingId, data }) =>
      api.put(`/shipping/${trackingId}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["sellerOrders"]);
      toast.success("Shipping status updated");
    },
  });
};
