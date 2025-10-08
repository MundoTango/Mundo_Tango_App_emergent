import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { format } from "date-fns";
import { StarRating } from "./StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from '../glass/GlassComponents';
import { ScaleIn } from '../animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '../interactions/MicroInteractions';
import type { HostReview, GuestReview } from "@shared/schema";

interface ReviewCardProps {
  review: HostReview | GuestReview;
  type: "host" | "guest";
  canRespond?: boolean;
}

export function ReviewCard({ review, type, canRespond = false }: ReviewCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");

  const isHostReview = type === "host";
  const hasResponse = isHostReview
    ? !!(review as HostReview).host_response
    : !!(review as GuestReview).guest_response;

  const submitResponseMutation = useMutation({
    mutationFn: async (response: string) => {
      return apiRequest(`/api/reviews/${review.id}/response`, {
        method: "PATCH",
        body: JSON.stringify({ response }),
      });
    },
    onSuccess: () => {
      toast({
        title: t('housing.reviews.response_posted_title', 'Response posted'),
        description: t('housing.reviews.response_posted_desc', 'Your response has been added successfully.'),
      });
      setShowResponseForm(false);
      setResponseText("");
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: t('housing.reviews.response_failed_title', 'Failed to post response'),
        description: error.message || t('housing.reviews.response_failed_desc', 'Please try again.'),
        variant: "destructive",
      });
    },
  });

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      toast({
        title: t('housing.reviews.response_required_title', 'Response required'),
        description: t('housing.reviews.response_required_desc', 'Please enter a response.'),
        variant: "destructive",
      });
      return;
    }

    submitResponseMutation.mutate(responseText);
  };

  return (
    <ScaleIn delay={0.05}>
      <GlassCard depth={2} className="p-6 border-cyan-200/30 dark:border-cyan-500/30" data-testid={`review-card-${review.id}`}>
        <div className="flex gap-4">
          <Avatar className="w-12 h-12 glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 text-cyan-700 dark:text-cyan-300">
              {isHostReview ? "G" : "H"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {isHostReview 
                    ? t('housing.reviews.guest_review', 'Guest Review') 
                    : t('housing.reviews.host_review', 'Host Review')}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {review.created_at && format(new Date(review.created_at), "MMMM d, yyyy")}
                </p>
              </div>
              <StarRating rating={review.rating} readonly size="sm" />
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2 mb-4">
              {isHostReview && (
                <>
                  {(review as HostReview).cleanliness_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.cleanliness', 'Cleanliness')}:
                      </span>
                      <StarRating
                        rating={(review as HostReview).cleanliness_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                  {(review as HostReview).communication_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.communication', 'Communication')}:
                      </span>
                      <StarRating
                        rating={(review as HostReview).communication_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                  {(review as HostReview).location_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.location', 'Location')}:
                      </span>
                      <StarRating
                        rating={(review as HostReview).location_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                  {(review as HostReview).value_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.value', 'Value')}:
                      </span>
                      <StarRating
                        rating={(review as HostReview).value_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                  {(review as HostReview).accuracy_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.accuracy', 'Accuracy')}:
                      </span>
                      <StarRating
                        rating={(review as HostReview).accuracy_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                </>
              )}

              {!isHostReview && (
                <>
                  {(review as GuestReview).respect_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.respect', 'Respect')}:
                      </span>
                      <StarRating
                        rating={(review as GuestReview).respect_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                  {(review as GuestReview).cleanliness_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.cleanliness', 'Cleanliness')}:
                      </span>
                      <StarRating
                        rating={(review as GuestReview).cleanliness_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                  {(review as GuestReview).communication_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-32 text-slate-600 dark:text-slate-400">
                        {t('housing.reviews.communication', 'Communication')}:
                      </span>
                      <StarRating
                        rating={(review as GuestReview).communication_rating!}
                        readonly
                        size="sm"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Review Text */}
            {review.review_text && (
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                {review.review_text}
              </p>
            )}

            {/* Photos */}
            {isHostReview && (review as HostReview).photos && (review as HostReview).photos!.length > 0 && (
              <div className="flex gap-2 mb-4">
                {(review as HostReview).photos!.map((photo, index) => (
                  <div key={index} className="glass-card glass-depth-1 p-1 rounded-lg border-cyan-200/30 dark:border-cyan-500/30">
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Response */}
            {hasResponse && (
              <GlassCard depth={1} className="mt-4 p-4 border-l-2 border-cyan-400 dark:border-cyan-500 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/30 dark:to-teal-950/30">
                <p className="text-sm font-medium text-cyan-900 dark:text-cyan-200 mb-1">
                  {isHostReview 
                    ? t('housing.reviews.host_response_label', 'Host Response') 
                    : t('housing.reviews.guest_response_label', 'Guest Response')}
                </p>
                <p className="text-sm text-cyan-700 dark:text-cyan-300">
                  {isHostReview
                    ? (review as HostReview).host_response
                    : (review as GuestReview).guest_response}
                </p>
                {(isHostReview
                  ? (review as HostReview).host_response_at
                  : (review as GuestReview).guest_response_at) && (
                  <p className="text-xs text-[var(--color-primary-hover)] dark:text-cyan-400 mt-1">
                    {format(
                      new Date(
                        (isHostReview
                          ? (review as HostReview).host_response_at
                          : (review as GuestReview).guest_response_at) as Date
                      ),
                      "MMMM d, yyyy"
                    )}
                  </p>
                )}
              </GlassCard>
            )}

            {/* Response Form */}
            {canRespond && !hasResponse && (
              <div className="mt-4">
                {!showResponseForm ? (
                  <MagneticButton
                    onClick={() => setShowResponseForm(true)}
                    strength={0.2}
                    className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 px-4 py-2 text-cyan-700 dark:text-cyan-300"
                    data-testid="button-respond"
                  >
                    {t('housing.reviews.respond_button', 'Respond')}
                  </MagneticButton>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={t('housing.reviews.response_placeholder', 'Write your response...')}
                      rows={3}
                      className="glass-card glass-depth-1 border-cyan-200/30 dark:border-cyan-500/30 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      data-testid="input-response"
                    />
                    <div className="flex gap-2">
                      <PulseButton
                        onClick={handleSubmitResponse}
                        disabled={submitResponseMutation.isPending}
                        className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-teal-500 text-white rounded-xl"
                        data-testid="button-submit-response"
                      >
                        {submitResponseMutation.isPending 
                          ? t('housing.reviews.posting', 'Posting...') 
                          : t('housing.reviews.post_response', 'Post Response')}
                      </PulseButton>
                      <MagneticButton
                        onClick={() => setShowResponseForm(false)}
                        strength={0.15}
                        className="glass-card glass-depth-1 border-slate-200/30 dark:border-slate-600/30 px-4 py-2 text-slate-700 dark:text-slate-300"
                        data-testid="button-cancel-response"
                      >
                        {t('housing.reviews.cancel', 'Cancel')}
                      </MagneticButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </ScaleIn>
  );
}
