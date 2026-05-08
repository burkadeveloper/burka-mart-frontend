import { useQuery, useMutation } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useWallet = () => {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => api.get("/wallet").then((res) => res.data),
  });
};

export const useWithdraw = () => {
  return useMutation({
    mutationFn: (amount) =>
      api.post("/wallet/withdraw", { amount }).then((res) => res.data),
    onSuccess: () => toast.success("Withdrawal request submitted"),
  });
};
