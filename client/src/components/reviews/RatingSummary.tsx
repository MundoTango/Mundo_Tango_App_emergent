import { useTranslation } from 'react-i18next';
import { StarRating } from "./StarRating";
import { GlassCard } from '../glass/GlassComponents';
import { Progress } from "@/components/ui/progress";
import { FadeIn } from '../animations/FramerMotionWrappers';
import type { HostReview } from "@shared/schema";

interface RatingSummaryProps {
  reviews: HostReview[];
}

interface CategoryRatings {
  overall: number[];
  cleanliness: number[];
  communication: number[];
  location: number[];
  value: number[];
  accuracy: number[];
}

export function RatingSummary({ reviews }: RatingSummaryProps) {
  const { t } = useTranslation();
  
  if (!reviews || reviews.length === 0) {
    return (
      <FadeIn>
        <GlassCard depth={2} className="p-6 text-center border-cyan-200/30 dark:border-ocean-500/30">
          <p className="text-slate-600 dark:text-slate-400">
            {t('housing.reviews.no_reviews', 'No reviews yet')}
          </p>
        </GlassCard>
      </FadeIn>
    );
  }

  // Calculate category averages
  const categoryRatings: CategoryRatings = {
    overall: [],
    cleanliness: [],
    communication: [],
    location: [],
    value: [],
    accuracy: [],
  };

  reviews.forEach((review) => {
    categoryRatings.overall.push(review.rating);
    if (review.cleanliness_rating) categoryRatings.cleanliness.push(review.cleanliness_rating);
    if (review.communication_rating) categoryRatings.communication.push(review.communication_rating);
    if (review.location_rating) categoryRatings.location.push(review.location_rating);
    if (review.value_rating) categoryRatings.value.push(review.value_rating);
    if (review.accuracy_rating) categoryRatings.accuracy.push(review.accuracy_rating);
  });

  const calculateAverage = (ratings: number[]) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
  };

  const averageRating = calculateAverage(categoryRatings.overall);

  // Calculate star distribution
  const starDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
    percentage: (reviews.filter((r) => Math.round(r.rating) === stars).length / reviews.length) * 100,
  }));

  return (
    <FadeIn>
      <GlassCard depth={2} className="p-6 border-cyan-200/30 dark:border-ocean-500/30">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 dark:from-cyan-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} readonly size="lg" />
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {t('housing.reviews.review_count', {
                  defaultValue: '{{count}} review',
                  defaultValue_plural: '{{count}} reviews',
                  count: reviews.length
                })}
              </p>
            </div>

            {/* Star Distribution */}
            <div className="space-y-2">
              {starDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 dark:text-slate-300 w-12">
                    {t('housing.reviews.stars', { defaultValue: '{{count}} stars', count: stars })}
                  </span>
                  <div className="flex-1 glass-card glass-depth-1 rounded-full overflow-hidden h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              {t('housing.reviews.rating_breakdown', 'Rating Breakdown')}
            </h3>
            <div className="space-y-3">
              {categoryRatings.cleanliness.length > 0 && (
                <GlassCard depth={1} className="p-3 border-cyan-200/20 dark:border-cyan-800/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t('housing.reviews.cleanliness', 'Cleanliness')}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={calculateAverage(categoryRatings.cleanliness)}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 w-8">
                        {calculateAverage(categoryRatings.cleanliness).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}
              {categoryRatings.communication.length > 0 && (
                <GlassCard depth={1} className="p-3 border-cyan-200/20 dark:border-cyan-800/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t('housing.reviews.communication', 'Communication')}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={calculateAverage(categoryRatings.communication)}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 w-8">
                        {calculateAverage(categoryRatings.communication).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}
              {categoryRatings.location.length > 0 && (
                <GlassCard depth={1} className="p-3 border-cyan-200/20 dark:border-cyan-800/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t('housing.reviews.location', 'Location')}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={calculateAverage(categoryRatings.location)}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 w-8">
                        {calculateAverage(categoryRatings.location).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}
              {categoryRatings.value.length > 0 && (
                <GlassCard depth={1} className="p-3 border-cyan-200/20 dark:border-cyan-800/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t('housing.reviews.value', 'Value')}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={calculateAverage(categoryRatings.value)}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 w-8">
                        {calculateAverage(categoryRatings.value).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}
              {categoryRatings.accuracy.length > 0 && (
                <GlassCard depth={1} className="p-3 border-cyan-200/20 dark:border-cyan-800/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t('housing.reviews.accuracy', 'Accuracy')}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={calculateAverage(categoryRatings.accuracy)}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 w-8">
                        {calculateAverage(categoryRatings.accuracy).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  );
}
