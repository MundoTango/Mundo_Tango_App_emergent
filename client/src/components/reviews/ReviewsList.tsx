import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { ReviewCard } from "./ReviewCard";
import { GlassCard } from '../glass/GlassComponents';
import { Star } from "lucide-react";

interface ReviewsListProps {
  homeId: number;
  hostId: number;
  currentUserId?: number;
}

export function ReviewsList({ homeId, hostId, currentUserId }: ReviewsListProps) {
  const { t } = useTranslation();

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["/api/reviews", "home", homeId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/home/${homeId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const reviews = reviewsData?.reviews || [];

  if (isLoading) {
    return (
      <GlassCard depth={1} className="p-6 border-cyan-200/30 dark:border-cyan-500/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-cyan-200 dark:bg-cyan-800/30 rounded w-1/4"></div>
          <div className="h-20 bg-cyan-200 dark:bg-cyan-800/30 rounded"></div>
          <div className="h-20 bg-cyan-200 dark:bg-cyan-800/30 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <GlassCard depth={1} className="p-8 border-cyan-200/30 dark:border-cyan-500/30">
        <div className="text-center">
          <Star className="w-12 h-12 mx-auto mb-3 text-[var(--color-primary)]" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('housing.reviews.no_reviews', 'No reviews yet. Be the first to review this property!')}
          </p>
        </div>
      </GlassCard>
    );
  }

  // Calculate average ratings
  const avgRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  return (
    <div className="space-y-6" data-testid="reviews-list">
      {/* Reviews Summary */}
      <GlassCard depth={1} className="p-6 border-cyan-200/30 dark:border-cyan-500/30">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-teal-500 bg-clip-text text-transparent">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avgRating)
                      ? 'fill-cyan-500 text-[var(--color-primary)]'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {totalReviews} {totalReviews === 1 ? t('housing.reviews.review', 'Review') : t('housing.reviews.reviews', 'Reviews')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('housing.reviews.from_verified_guests', 'From verified guests')}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <ReviewCard
            key={review.id}
            review={review}
            type="host"
            canRespond={currentUserId === hostId}
          />
        ))}
      </div>
    </div>
  );
}
