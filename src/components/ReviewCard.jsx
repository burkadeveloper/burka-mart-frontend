import { useState } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageCircle, Edit2, Trash2, X, Check } from "lucide-react";
import RatingStars from "./RatingStars";
import { getImageUrl } from "../utils/imageHelper";

export default function ReviewCard({
  review,
  onLike,
  onDelete,
  onEdit,
  onReply,
  currentUserId,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState(review.comment);
  const [editRating, setEditRating] = useState(review.rating);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(review._id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  const handleEditSubmit = () => {
    onEdit(review._id, editRating, editComment);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-4 transition hover:shadow-md">
      <div className="flex gap-4">
        {/* Avatar */}
        <img
          src={getImageUrl(review.user?.profilePicture)}
          alt={review.user?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {review.user?.name}
              </p>
              <RatingStars rating={review.rating} readonly size={16} />
            </div>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <RatingStars
                rating={editRating}
                onRate={setEditRating}
                size={20}
              />
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
              {review.comment}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike(review._id)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-sm"
            >
              <ThumbsUp size={14} /> {review.likes?.length || 0}
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-sm"
            >
              <MessageCircle size={14} /> Reply
            </button>
            {review.user?._id === currentUserId && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 hover:text-blue-600 transition"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(review._id)}
                  className="text-gray-500 hover:text-red-600 transition"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSubmitReply}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Post
              </button>
            </div>
          )}

          {/* Replies */}
          {review.replies && review.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
              {review.replies.map((reply) => (
                <div key={reply._id} className="flex gap-2">
                  <img
                    src={getImageUrl(reply.user?.profilePicture)}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {reply.user?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reply.comment}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
