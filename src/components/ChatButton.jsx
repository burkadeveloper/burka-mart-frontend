import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function ChatButton({ sellerId, productId }) {
  if (!sellerId) return null;
  const to = `/chat/${sellerId}${productId ? `?product=${productId}` : ""}`;
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
    >
      <MessageCircle size={18} />
      Chat with Seller
    </Link>
  );
}
