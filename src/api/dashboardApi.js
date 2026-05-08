// import { useQuery } from "@tanstack/react-query";
// import api from "./axiosClient";

// export const useSellerDashboard = () => {
//   return useQuery({
//     queryKey: ["sellerDashboard"],
//     queryFn: () => api.get("/dashboard/seller").then((res) => res.data),
//   });
// };

// export const useBuyerDashboard = () => {
//   return useQuery({
//     queryKey: ["buyerDashboard"],
//     queryFn: () => api.get("/dashboard/buyer").then((res) => res.data),
//   });
// };

// export const useActivityFeed = () => {
//   return useQuery({
//     queryKey: ["activityFeed"],
//     queryFn: () => api.get("/dashboard/activity").then((res) => res.data),
//   });
// };

import { useQuery } from "@tanstack/react-query";
import api from "./axiosClient";

export const useSellerDashboard = () => {
  return useQuery({
    queryKey: ["sellerDashboard"],
    queryFn: () => api.get("/dashboard/seller").then((res) => res.data),
  });
};

export const useBuyerDashboard = () => {
  return useQuery({
    queryKey: ["buyerDashboard"],
    queryFn: () => api.get("/dashboard/buyer").then((res) => res.data),
  });
};

export const useActivityFeed = () => {
  return useQuery({
    queryKey: ["activityFeed"],
    queryFn: () => api.get("/dashboard/activity").then((res) => res.data),
  });
};
