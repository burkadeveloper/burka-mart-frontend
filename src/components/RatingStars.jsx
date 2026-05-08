import { Star } from "lucide-react";

export default function RatingStars({
  rating,
  onRate,
  size = 20,
  readonly = false,
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRate?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition"} focus:outline-none`}
          disabled={readonly}
        >
          <Star
            size={size}
            className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          />
        </button>
      ))}
    </div>
  );
}
