import { ReviewCard } from "./ReviewCard";
import type { HostReview, GuestReview } from "@shared/schema";

interface ReviewListProps {
  reviews: HostReview[] | GuestReview[];
  type: "host" | "guest";
  canRespond?: boolean;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  type,
  canRespond = false,
  emptyMessage = "No reviews yet",
}: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" data-testid="empty-reviews">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="review-list">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          type={type}
          canRespond={canRespond}
        />
      ))}
    </div>
  );
}
