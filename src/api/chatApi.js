import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useUserChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => api.get("/chats").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useChatMessages = (chatId) => {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => api.get(`/chats/${chatId}/messages`).then((res) => res.data),
    enabled: !!chatId,
    staleTime: 60 * 1000,
  });
};

export const useGetOrCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/chats/init", data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["chats"]),
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId) =>
      api.delete(`/chats/${chatId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
      toast.success("Conversation deleted");
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) =>
      api.delete(`/chats/messages/${messageId}`).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["messages"]),
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, message }) =>
      api
        .put(`/chats/messages/${messageId}`, { message })
        .then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["messages"]),
  });
};

export const useTotalUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadMessagesCount"],
    queryFn: () => api.get("/chats/unread-count").then((res) => res.data),
    refetchInterval: 30000,
  });
};
