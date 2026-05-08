import { useMutation } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/login", data).then((res) => res.data),
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) =>
      api.post("/auth/register", data).then((res) => res.data),
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });
};

// import { useMutation } from '@tanstack/react-query';
// import api from './axiosClient';
// import toast from 'react-hot-toast';

// export const useLogin = () => {
//   return useMutation({
//     mutationFn: (data) => api.post('/auth/login', data).then(res => res.data),
//     onError: (err) => {
//       toast.error(err.response?.data?.message || 'Login failed');
//     },
//   });
// };

// export const useRegister = () => {
//   return useMutation({
//     mutationFn: (data) => api.post('/auth/register', data).then(res => res.data),
//     onError: (err) => {
//       toast.error(err.response?.data?.message || 'Registration failed');
//     },
//   });
// };
