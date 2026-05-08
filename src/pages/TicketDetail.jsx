import { useParams } from "react-router-dom";
import { useTicketDetail, useReplyTicket } from "../api/ticketApi";
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function TicketDetail() {
  const { id } = useParams();
  const { data, isLoading } = useTicketDetail(id);
  const reply = useReplyTicket();
  const [replyMsg, setReplyMsg] = useState("");
  const ticket = data?.ticket;

  const handleReply = () => {
    if (!replyMsg.trim()) return;
    reply.mutate({ ticketId: id, message: replyMsg });
    setReplyMsg("");
  };

  if (isLoading) return <LoadingSpinner />;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold">{ticket.subject}</h1>
      <p className="text-gray-600">Status: {ticket.status}</p>
      <div className="bg-gray-100 p-4 rounded mt-4">
        <p>
          <strong>You:</strong> {ticket.message}
        </p>
      </div>
      {ticket.responses.map((res, idx) => (
        <div key={idx} className="bg-blue-50 p-4 rounded mt-2">
          <p>
            <strong>Support:</strong> {res.message}
          </p>
        </div>
      ))}
      <div className="mt-6">
        <textarea
          value={replyMsg}
          onChange={(e) => setReplyMsg(e.target.value)}
          className="w-full border rounded p-2"
          rows="3"
          placeholder="Your reply..."
        ></textarea>
        <button
          onClick={handleReply}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send Reply
        </button>
      </div>
    </div>
  );
}
