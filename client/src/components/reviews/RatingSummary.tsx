import { StarRating } from "./StarRating";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No reviews yet</p>
      </Card>
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
    <Card className="p-6" data-testid="rating-summary">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2" data-testid="average-rating">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} readonly size="lg" />
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Star Distribution */}
          <div className="space-y-2">
            {starDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm w-12">{stars} stars</span>
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="font-semibold mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {categoryRatings.cleanliness.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Cleanliness</span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={calculateAverage(categoryRatings.cleanliness)}
                    readonly
                    size="sm"
                  />
                  <span className="text-sm font-medium w-8">
                    {calculateAverage(categoryRatings.cleanliness).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {categoryRatings.communication.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Communication</span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={calculateAverage(categoryRatings.communication)}
                    readonly
                    size="sm"
                  />
                  <span className="text-sm font-medium w-8">
                    {calculateAverage(categoryRatings.communication).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {categoryRatings.location.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Location</span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={calculateAverage(categoryRatings.location)}
                    readonly
                    size="sm"
                  />
                  <span className="text-sm font-medium w-8">
                    {calculateAverage(categoryRatings.location).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {categoryRatings.value.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Value</span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={calculateAverage(categoryRatings.value)}
                    readonly
                    size="sm"
                  />
                  <span className="text-sm font-medium w-8">
                    {calculateAverage(categoryRatings.value).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {categoryRatings.accuracy.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Accuracy</span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={calculateAverage(categoryRatings.accuracy)}
                    readonly
                    size="sm"
                  />
                  <span className="text-sm font-medium w-8">
                    {calculateAverage(categoryRatings.accuracy).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
