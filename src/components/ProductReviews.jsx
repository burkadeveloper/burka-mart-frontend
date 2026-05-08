import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { useSelector } from "react-redux";
import RatingStars from "./RatingStars";
import ReviewCard from "./ReviewCard";
import LoadingSpinner from "./LoadingSpinner";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductReviews({ productId }) {
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reviews", productId, page, showAll, sortBy],
    queryFn: () =>
      api
        .get(
          `/reviews/product/${productId}?page=${page}&limit=${showAll ? 100 : 3}&sort=${sortBy}`,
        )
        .then((res) => res.data),
    enabled: !!productId,
  });

  const createReview = useMutation({
    mutationFn: (data) => api.post(`/reviews/product/${productId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", productId]);
      setReviewText("");
      setRating(5);
      toast.success("Review posted!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to post review"),
  });

  const likeReview = useMutation({
    mutationFn: (reviewId) => api.post(`/reviews/${reviewId}/like`),
    onSuccess: () => queryClient.invalidateQueries(["reviews", productId]),
  });

  const deleteReview = useMutation({
    mutationFn: (reviewId) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => queryClient.invalidateQueries(["reviews", productId]),
  });

  const updateReview = useMutation({
    mutationFn: ({ reviewId, rating, comment }) =>
      api.put(`/reviews/${reviewId}`, { rating, comment }),
    onSuccess: () => queryClient.invalidateQueries(["reviews", productId]),
  });

  const addReply = useMutation({
    mutationFn: ({ reviewId, comment }) =>
      api.post(`/reviews/${reviewId}/replies`, { comment }),
    onSuccess: () => queryClient.invalidateQueries(["reviews", productId]),
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Please write a comment");
      return;
    }
    if (!user) {
      toast.error("Please login to review");
      return;
    }
    createReview.mutate({ rating, comment: reviewText });
  };

  const reviews = data?.reviews || [];
  const total = data?.total || 0;
  const avgRating = data?.averageRating || 0;
  const ratingDistribution = data?.ratingDistribution || {};

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
    setShowAll(false);
  };

  return (
    <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="border rounded-lg px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Average Rating Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {avgRating.toFixed(1)}
            </div>
            <RatingStars rating={Math.round(avgRating)} readonly size={18} />
            <div className="text-sm text-gray-500">{total} reviews</div>
          </div>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = total ? (count / total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{star}★</span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {!user && (
          <Link to="/login" className="text-blue-600 hover:underline">
            Login to write a review
          </Link>
        )}
      </div>

      {/* Write Review Form */}
      {user && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <p className="font-semibold mb-2 text-gray-900 dark:text-white">
            Write a review
          </p>
          <RatingStars rating={rating} onRate={setRating} size={24} />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="4"
            className="w-full mt-3 border rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience with this product..."
          />
          <button
            type="submit"
            disabled={createReview.isLoading}
            className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {createReview.isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {isLoading && <LoadingSpinner />}
      {!isLoading && reviews.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No reviews yet. Be the first!
        </p>
      )}
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          currentUserId={user?._id}
          onLike={(id) => likeReview.mutate(id)}
          onDelete={(id) => deleteReview.mutate(id)}
          onEdit={(id, rating, comment) =>
            updateReview.mutate({ reviewId: id, rating, comment })
          }
          onReply={(id, comment) => addReply.mutate({ reviewId: id, comment })}
        />
      ))}
      {total > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-blue-600 flex items-center gap-1 mt-4 text-sm"
        >
          View all {total} reviews <ChevronDown size={16} />
        </button>
      )}
      {showAll && total > 3 && (
        <button
          onClick={() => {
            setShowAll(false);
            setPage(1);
          }}
          className="text-blue-600 flex items-center gap-1 mt-4 text-sm"
        >
          Show less <ChevronUp size={16} />
        </button>
      )}
    </div>
  );
}
