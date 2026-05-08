import { useQuery, useMutation } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useTracking = (trackingId) => {
  return useQuery({
    queryKey: ["tracking", trackingId],
    queryFn: () => api.get(`/shipping/${trackingId}`).then((res) => res.data),
    enabled: !!trackingId,
  });
};

export const useUpdateShippingStatus = () => {
  return useMutation({
    mutationFn: ({ trackingId, data }) =>
      api.put(`/shipping/${trackingId}`, data).then((res) => res.data),
    onSuccess: () => toast.success("Shipping status updated"),
  });
};
