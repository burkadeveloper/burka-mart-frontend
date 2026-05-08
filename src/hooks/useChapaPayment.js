import { useMutation } from "@tanstack/react-query";
import api from "../api/axiosClient";
import toast from "react-hot-toast";

export const useChapaPayment = () => {
  return useMutation({
    mutationFn: (orderData) =>
      api.post("/orders", orderData).then((res) => res.data),
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Order creation failed");
    },
  });
};
