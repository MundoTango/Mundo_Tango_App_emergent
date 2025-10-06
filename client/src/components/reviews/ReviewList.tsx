import { useTranslation } from 'react-i18next';
import { ReviewCard } from "./ReviewCard";
import { ScaleIn, StaggerContainer } from '../animations/FramerMotionWrappers';
import { GlassCard } from '../glass/GlassComponents';
import { Star } from 'lucide-react';
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
  emptyMessage,
}: ReviewListProps) {
  const { t } = useTranslation();
  
  const defaultEmptyMessage = emptyMessage || t('housing.reviews.no_reviews', 'No reviews yet');
  
  if (!reviews || reviews.length === 0) {
    return (
      <ScaleIn delay={0.1}>
        <GlassCard depth={2} className="text-center py-12 border-cyan-200/30 dark:border-cyan-500/30" data-testid="empty-reviews">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 glass-card glass-depth-1 rounded-full flex items-center justify-center border-cyan-200/30 dark:border-cyan-500/30">
              <Star className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">{defaultEmptyMessage}</p>
          </div>
        </GlassCard>
      </ScaleIn>
    );
  }

  return (
    <StaggerContainer staggerDelay={0.08}>
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
    </StaggerContainer>
  );
}
