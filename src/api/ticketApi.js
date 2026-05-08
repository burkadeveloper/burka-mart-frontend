import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axiosClient";
import toast from "react-hot-toast";

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/tickets", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tickets"]);
      toast.success("Ticket created");
    },
  });
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: () => api.get("/tickets").then((res) => res.data),
  });
};
// Already provided; add useTicketDetail if needed
export const useTicketDetail = (ticketId) => {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => api.get(`/tickets/${ticketId}`).then((res) => res.data),
    enabled: !!ticketId,
  });
};
export const useReplyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }) =>
      api
        .post(`/tickets/${ticketId}/reply`, { message })
        .then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["tickets"]),
  });
};
