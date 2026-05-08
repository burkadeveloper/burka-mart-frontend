import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./axiosClient";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (orderData) =>
      api.post("/orders", orderData).then((res) => res.data),
  });
};

export const useMyOrders = (role) => {
  return useQuery({
    queryKey: ["orders", role],
    queryFn: () =>
      api
        .get("/orders/my-orders", { params: { role } })
        .then((res) => res.data),
  });
};
