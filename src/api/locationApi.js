import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./axiosClient";

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data) => api.put("/location/me", data).then((res) => res.data),
  });
};

export const useSellerLocation = (sellerId) => {
  return useQuery({
    queryKey: ["sellerLocation", sellerId],
    queryFn: () =>
      api.get(`/location/seller/${sellerId}`).then((res) => res.data),
    enabled: !!sellerId,
  });
};
