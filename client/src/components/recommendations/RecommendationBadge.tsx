import { MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RecommendationBadgeProps {
  type: string; // restaurant, cafe, hotel, venue
  rating?: number; // 1-5 stars
  priceLevel?: string; // '$', '$$', '$$$'
  city?: string;
  country?: string;
}

// ESA LIFE CEO 61x21 - Layer 28: Recommendations Badge Component
// Aurora Tide Design System Compliant

const getCategoryInfo = (type: string) => {
  const categories = {
    restaurant: { emoji: '🍽️', label: 'Restaurant', color: 'from-orange-500 to-red-500' },
    cafe: { emoji: '☕', label: 'Cafe', color: 'from-amber-500 to-orange-500' },
    hotel: { emoji: '🏨', label: 'Hotel', color: 'from-blue-500 to-indigo-500' },
    venue: { emoji: '💃', label: 'Venue', color: 'from-purple-500 to-pink-500' },
  };

  return categories[type.toLowerCase() as keyof typeof categories] || {
    emoji: '📍',
    label: type,
    color: 'from-cyan-500 to-teal-500'
  };
};

export default function RecommendationBadge({ 
  type, 
  rating, 
  priceLevel,
  city,
  country
}: RecommendationBadgeProps) {
  const { t } = useTranslation();
  const categoryInfo = getCategoryInfo(type);

  return (
    <div 
      className="mt-3 p-3 rounded-lg bg-gradient-to-r from-cyan-50/80 to-teal-50/80 dark:from-cyan-950/30 dark:to-teal-950/30 border border-cyan-200/50 dark:border-cyan-800/50 backdrop-blur-sm"
      data-testid="badge-recommendation"
    >
      {/* Category and Location Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Category Badge with MT Ocean Gradient */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${categoryInfo.color} text-white text-sm font-medium shadow-sm`}
            data-testid={`badge-category-${type.toLowerCase()}`}
          >
            <span className="text-base leading-none">{categoryInfo.emoji}</span>
            <span>{t(`recommendations.categories.${type.toLowerCase()}`, categoryInfo.label)}</span>
          </div>

          {/* Price Level */}
          {priceLevel && (
            <div 
              className="px-2 py-1 rounded-md bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700"
              data-testid={`badge-price-${priceLevel}`}
            >
              {priceLevel}
            </div>
          )}
        </div>

        {/* Rating */}
        {rating && rating > 0 && (
          <div 
            className="flex items-center gap-1 text-amber-500 dark:text-amber-400"
            data-testid={`badge-rating-${rating}`}
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-current' : 'fill-none opacity-30'}`}
              />
            ))}
            <span className="ml-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              {rating}/5
            </span>
          </div>
        )}
      </div>

      {/* Location */}
      {city && (
        <div 
          className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400"
          data-testid="badge-location"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>
            {city}{country && `, ${country}`}
          </span>
        </div>
      )}
    </div>
  );
}
