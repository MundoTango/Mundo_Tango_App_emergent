import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import MediaUploader from "@/components/media/MediaUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  file?: File;
}

const hostReviewSchema = z.object({
  booking_id: z.number(),
  home_id: z.number(),
  host_id: z.number(),
  rating: z.number().min(1).max(5),
  cleanliness_rating: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5),
  location_rating: z.number().min(1).max(5),
  value_rating: z.number().min(1).max(5),
  accuracy_rating: z.number().min(1).max(5),
  review_text: z.string().min(10, "Review must be at least 10 characters"),
  photos: z.array(z.string()).optional(),
});

type HostReviewFormData = z.infer<typeof hostReviewSchema>;

interface HostReviewFormProps {
  bookingId: number;
  homeId: number;
  hostId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HostReviewForm({
  bookingId,
  homeId,
  hostId,
  onSuccess,
  onCancel,
}: HostReviewFormProps) {
  const { toast } = useToast();
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    communication: 0,
    location: 0,
    value: 0,
    accuracy: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoOrder, setPhotoOrder] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const submitReviewMutation = useMutation({
    mutationFn: async (data: HostReviewFormData) => {
      return apiRequest("/api/host-reviews", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/host-homes", homeId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "review-status"] });
      toast({
        title: "Review submitted",
        description: "Your review has been posted successfully.",
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

    // For now, we'll skip photo upload in the MVP - can be added later
    const photos: string[] = [];

    submitReviewMutation.mutate({
      booking_id: bookingId,
      home_id: homeId,
      host_id: hostId,
      rating: ratings.overall,
      cleanliness_rating: ratings.cleanliness,
      communication_rating: ratings.communication,
      location_rating: ratings.location,
      value_rating: ratings.value,
      accuracy_rating: ratings.accuracy,
      review_text: reviewText,
      photos: photos.length > 0 ? photos : undefined,
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Rate Your Stay</h3>
          <div className="space-y-3">
            <StarRating
              rating={ratings.overall}
              onRatingChange={(rating) => setRatings({ ...ratings, overall: rating })}
              showLabel
              label="Overall Experience"
              data-testid="rating-overall"
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
            <StarRating
              rating={ratings.location}
              onRatingChange={(rating) => setRatings({ ...ratings, location: rating })}
              showLabel
              label="Location"
              data-testid="rating-location"
            />
            <StarRating
              rating={ratings.value}
              onRatingChange={(rating) => setRatings({ ...ratings, value: rating })}
              showLabel
              label="Value"
              data-testid="rating-value"
            />
            <StarRating
              rating={ratings.accuracy}
              onRatingChange={(rating) => setRatings({ ...ratings, accuracy: rating })}
              showLabel
              label="Accuracy"
              data-testid="rating-accuracy"
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
            placeholder="Share your experience with future guests..."
            rows={5}
            className="w-full"
            data-testid="input-review-text"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 10 characters ({reviewText.length}/10)
          </p>
        </div>

        {/* Photo upload - coming soon in next phase */}

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
