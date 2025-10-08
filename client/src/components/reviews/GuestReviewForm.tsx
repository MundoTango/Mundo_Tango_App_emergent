import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from '../glass/GlassComponents';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GuestReviewFormProps {
  bookingId: number;
  guestId: number;
  reviewerId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GuestReviewForm({
  bookingId,
  guestId,
  reviewerId,
  onSuccess,
  onCancel,
}: GuestReviewFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [ratings, setRatings] = useState({
    overall: 0,
    respect: 0,
    cleanliness: 0,
    communication: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [wouldHostAgain, setWouldHostAgain] = useState(true);

  const submitReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/reviews/guest", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: t('housing.reviews.submit_success_title', 'Review submitted'),
        description: t('housing.reviews.guest_review_success_desc', 'Your guest review has been posted successfully.'),
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

    submitReviewMutation.mutate({
      booking_id: bookingId,
      guest_id: guestId,
      reviewer_id: reviewerId,
      rating: ratings.overall,
      respect_rating: ratings.respect,
      cleanliness_rating: ratings.cleanliness,
      communication_rating: ratings.communication,
      would_host_again: wouldHostAgain,
      review_text: reviewText,
    });
  };

  return (
    <GlassCard depth={4} className="p-6 border-cyan-200/30 dark:border-ocean-500/30">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t('housing.reviews.rate_your_guest', 'Rate Your Guest')}
          </h3>
          <div className="space-y-3">
            <StarRating
              rating={ratings.overall}
              onRatingChange={(rating) => setRatings({ ...ratings, overall: rating })}
              showLabel
              label={t('housing.reviews.overall_experience', 'Overall Experience')}
              data-testid="rating-overall"
            />
            <StarRating
              rating={ratings.respect}
              onRatingChange={(rating) => setRatings({ ...ratings, respect: rating })}
              showLabel
              label={t('housing.reviews.respect_property', 'Respect for Property')}
              data-testid="rating-respect"
            />
            <StarRating
              rating={ratings.cleanliness}
              onRatingChange={(rating) => setRatings({ ...ratings, cleanliness: rating })}
              showLabel
              label={t('housing.reviews.cleanliness', 'Cleanliness')}
              data-testid="rating-cleanliness"
            />
            <StarRating
              rating={ratings.communication}
              onRatingChange={(rating) => setRatings({ ...ratings, communication: rating })}
              showLabel
              label={t('housing.reviews.communication', 'Communication')}
              data-testid="rating-communication"
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
            placeholder={t('housing.reviews.guest_review_placeholder', 'Share your experience hosting this guest...')}
            rows={5}
            className="w-full glass-card glass-depth-1 border-cyan-200/30 dark:border-ocean-500/30 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            data-testid="input-review-text"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('housing.reviews.min_characters', 'Minimum 10 characters')} ({reviewText.length}/10)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="would-host-again"
            checked={wouldHostAgain}
            onChange={(e) => setWouldHostAgain(e.target.checked)}
            className="w-4 h-4 rounded border-cyan-300 text-ocean-500 focus:ring-cyan-500"
            data-testid="checkbox-would-host-again"
          />
          <label htmlFor="would-host-again" className="text-sm text-slate-700 dark:text-slate-300">
            {t('housing.reviews.would_host_again', 'I would host this guest again')}
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="glass-card glass-depth-1 border-slate-200/30 dark:border-slate-600/30"
              data-testid="button-cancel"
            >
              {t('housing.reviews.cancel', 'Cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitReviewMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
            data-testid="button-submit-review"
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
