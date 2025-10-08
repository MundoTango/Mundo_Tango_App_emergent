import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from '../glass/GlassComponents';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      return apiRequest("/api/reviews/host", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: t('housing.reviews.submit_success_title', 'Review submitted'),
        description: t('housing.reviews.submit_success_desc', 'Your review has been posted successfully.'),
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: t('housing.reviews.submit_failed_title', 'Failed to submit review'),
        description: error.message || t('housing.reviews.submit_failed_desc', 'Please try again.'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all ratings are set
    if (Object.values(ratings).some((r) => r === 0)) {
      toast({
        title: t('housing.reviews.missing_ratings_title', 'Missing ratings'),
        description: t('housing.reviews.missing_ratings_desc', 'Please rate all categories before submitting.'),
        variant: "destructive",
      });
      return;
    }

    if (reviewText.length < 10) {
      toast({
        title: t('housing.reviews.review_too_short_title', 'Review too short'),
        description: t('housing.reviews.review_too_short_desc', 'Please write at least 10 characters.'),
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
    <GlassCard depth={4} className="p-6 border-cyan-200/30 dark:border-ocean-500/30">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t('housing.reviews.rate_your_stay', 'Rate Your Stay')}
          </h3>
          <div className="space-y-3">
            <StarRating
              rating={ratings.overall}
              onRatingChange={(rating) => setRatings({ ...ratings, overall: rating })}
              showLabel
              label={t('housing.reviews.overall_experience', 'Overall Experience')}
             
            />
            <StarRating
              rating={ratings.cleanliness}
              onRatingChange={(rating) => setRatings({ ...ratings, cleanliness: rating })}
              showLabel
              label={t('housing.reviews.cleanliness', 'Cleanliness')}
             
            />
            <StarRating
              rating={ratings.communication}
              onRatingChange={(rating) => setRatings({ ...ratings, communication: rating })}
              showLabel
              label={t('housing.reviews.communication', 'Communication')}
             
            />
            <StarRating
              rating={ratings.location}
              onRatingChange={(rating) => setRatings({ ...ratings, location: rating })}
              showLabel
              label={t('housing.reviews.location', 'Location')}
             
            />
            <StarRating
              rating={ratings.value}
              onRatingChange={(rating) => setRatings({ ...ratings, value: rating })}
              showLabel
              label={t('housing.reviews.value', 'Value')}
             
            />
            <StarRating
              rating={ratings.accuracy}
              onRatingChange={(rating) => setRatings({ ...ratings, accuracy: rating })}
              showLabel
              label={t('housing.reviews.accuracy', 'Accuracy')}
             
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            {t('housing.reviews.your_review', 'Your Review')} <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder={t('housing.reviews.review_placeholder', 'Share your experience with future guests...')}
            rows={5}
            className="w-full glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
           
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('housing.reviews.min_characters', 'Minimum 10 characters')} ({reviewText.length}/10)
          </p>
        </div>

        {/* Photo upload - coming soon in next phase */}

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="glass-card glass-depth-1 border-slate-200/30 dark:border-slate-600/30"
             
            >
              {t('housing.reviews.cancel', 'Cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitReviewMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
           
          >
            {submitReviewMutation.isPending 
              ? t('housing.reviews.submitting', 'Submitting...') 
              : t('housing.reviews.submit_review', 'Submit Review')}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
