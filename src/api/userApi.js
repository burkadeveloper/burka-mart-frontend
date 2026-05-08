import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

// Get profile
export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/users/profile").then((res) => res.data),
  });
};

// Update profile (name, phone, location)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.put("/users/profile", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      toast.success("Profile updated");
    },
  });
};

// Update password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data) =>
      api.put("/users/password", data).then((res) => res.data),
    onSuccess: () => toast.success("Password changed"),
  });
};

// Become seller
export const useBecomeSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/users/become-seller").then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      toast.success("You are now a seller");
    },
  });
};

// Upload profile picture
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("image", file);
      return api
        .post("/users/profile-picture", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      toast.success("Profile picture updated");
    },
  });
};

// Update payout settings (for sellers)
export const useUpdatePayoutSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.put("/users/payout-settings", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      toast.success("Payout settings saved");
    },
  });
};
