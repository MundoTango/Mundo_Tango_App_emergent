import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GuestReviewFormProps {
  bookingId: number;
  guestId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GuestReviewForm({
  bookingId,
  guestId,
  onSuccess,
  onCancel,
}: GuestReviewFormProps) {
  const { toast } = useToast();
  const [ratings, setRatings] = useState({
    overall: 0,
    respect: 0,
    cleanliness: 0,
    communication: 0,
  });
  const [reviewText, setReviewText] = useState("");

  const submitReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/guest-reviews", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", guestId, "guest-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "review-status"] });
      toast({
        title: "Review submitted",
        description: "Your guest review has been posted successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all ratings are set
    if (Object.values(ratings).some((r) => r === 0)) {
      toast({
        title: "Missing ratings",
        description: "Please rate all categories before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (reviewText.length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({
      booking_id: bookingId,
      guest_id: guestId,
      rating: ratings.overall,
      respect_rating: ratings.respect,
      cleanliness_rating: ratings.cleanliness,
      communication_rating: ratings.communication,
      review_text: reviewText,
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Rate Your Guest</h3>
          <div className="space-y-3">
            <StarRating
              rating={ratings.overall}
              onRatingChange={(rating) => setRatings({ ...ratings, overall: rating })}
              showLabel
              label="Overall Experience"
              data-testid="rating-overall"
            />
            <StarRating
              rating={ratings.respect}
              onRatingChange={(rating) => setRatings({ ...ratings, respect: rating })}
              showLabel
              label="Respect for Property"
              data-testid="rating-respect"
            />
            <StarRating
              rating={ratings.cleanliness}
              onRatingChange={(rating) => setRatings({ ...ratings, cleanliness: rating })}
              showLabel
              label="Cleanliness"
              data-testid="rating-cleanliness"
            />
            <StarRating
              rating={ratings.communication}
              onRatingChange={(rating) => setRatings({ ...ratings, communication: rating })}
              showLabel
              label="Communication"
              data-testid="rating-communication"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience hosting this guest..."
            rows={5}
            className="w-full"
            data-testid="input-review-text"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 10 characters ({reviewText.length}/10)
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitReviewMutation.isPending}
            data-testid="button-submit-review"
          >
            {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
