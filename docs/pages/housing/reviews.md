# Housing Review System Documentation

**Last Updated:** October 6, 2025  
**Status:** ✅ Production-Ready - Aurora Tide Transformation Complete  
**Design System:** [Aurora Tide Documentation](../design-systems/aurora-tide.md)

---

## 1. Overview

- **Purpose**: Bidirectional post-stay rating system for guests and hosts
- **Components**: StarRating, ReviewCard, ReviewList, RatingSummary
- **ESA Framework Layer**: Layer 24 (Social Features) + Layer 9 (UI Framework)

---

## 2. Components

### StarRating Component

**File:** `client/src/components/reviews/StarRating.tsx`

Interactive star rating with MT Ocean Theme gradients:

```typescript
import { StarRating } from '@/components/reviews/StarRating';

<StarRating
  rating={4.5}
  size="lg"
  readonly={false}
  onChange={(newRating) => setRating(newRating)}
  data-testid="rating-input"
/>
```

#### Aurora Tide Implementation

**MT Ocean Gradient Stars:**
```tsx
// Filled star (cyan-to-teal gradient)
<Star 
  className="fill-cyan-500 text-cyan-500 dark:fill-cyan-400 dark:text-cyan-400"
  style={{
    background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}
/>

// Half-filled star (gradient with mask)
<div className="relative">
  <Star className="text-slate-300 dark:text-slate-600" />
  <Star 
    className="absolute inset-0 fill-cyan-500 dark:fill-cyan-400"
    style={{ clipPath: `inset(0 50% 0 0)` }}
  />
</div>

// Empty star
<Star className="text-slate-300 dark:text-slate-600" />
```

**Interactive Hover:**
```tsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className="focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
>
  <Star />
</motion.button>
```

**Sizes:**
- `sm`: 16px (w-4 h-4)
- `md`: 20px (w-5 h-5) - default
- `lg`: 24px (w-6 h-6)
- `xl`: 32px (w-8 h-8)

#### i18next Integration

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Accessibility label
<div aria-label={t('reviews.rating.label', {
  defaultValue: '{{rating}} out of 5 stars',
  rating: rating
})}>
  <StarRating rating={rating} />
</div>

// Rating descriptor
{t('reviews.rating.excellent', 'Excellent')} // 5 stars
{t('reviews.rating.good', 'Good')}           // 4 stars
{t('reviews.rating.average', 'Average')}     // 3 stars
{t('reviews.rating.poor', 'Poor')}           // 2 stars
{t('reviews.rating.terrible', 'Terrible')}   // 1 star
```

---

### ReviewCard Component

**File:** `client/src/components/reviews/ReviewCard.tsx`

Individual review display with glassmorphic styling:

```typescript
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { GlassCard } from '@/components/glass/GlassCard';
import { ScaleIn } from '@/components/animations/FramerMotionWrappers';

<ScaleIn delay={0.05}>
  <ReviewCard
    review={review}
    showResponse={true}
    onHelpful={handleHelpful}
    onReport={handleReport}
  />
</ScaleIn>
```

#### Aurora Tide Implementation

**Glassmorphic Card:**
```tsx
<GlassCard 
  depth={2}
  className="border-cyan-200/30 dark:border-cyan-500/30 p-6"
  data-testid={`card-review-${review.id}`}
>
  {/* Reviewer header */}
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
      {reviewer.initials}
    </div>
    <div>
      <h4 className="font-semibold text-slate-900 dark:text-white">
        {reviewer.name}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {formatDate(review.createdAt)}
      </p>
    </div>
  </div>

  {/* Star rating */}
  <div className="mb-3">
    <StarRating rating={review.rating} readonly size="md" />
  </div>

  {/* Review text */}
  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
    {review.comment}
  </p>

  {/* Connection badge */}
  {review.connectionDegree && (
    <div className="mt-3">
      <ConnectionBadge degree={review.connectionDegree} size="sm" />
    </div>
  )}

  {/* Actions */}
  <div className="flex gap-4 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
    <MagneticButton
      onClick={handleHelpful}
      className="text-sm text-slate-600 dark:text-slate-400 glass-card px-3 py-1.5"
      data-testid={`button-helpful-${review.id}`}
    >
      <ThumbsUp className="w-4 h-4 mr-1.5" />
      {t('reviews.helpful', 'Helpful')} ({review.helpfulCount})
    </MagneticButton>
    
    <MagneticButton
      onClick={handleReport}
      className="text-sm text-slate-600 dark:text-slate-400 glass-card px-3 py-1.5"
      data-testid={`button-report-${review.id}`}
    >
      <Flag className="w-4 h-4 mr-1.5" />
      {t('reviews.report', 'Report')}
    </MagneticButton>
  </div>

  {/* Host/guest response */}
  {review.response && (
    <div className="mt-4 ml-6 p-4 rounded-lg bg-cyan-50/30 dark:bg-cyan-950/20 border border-cyan-200/30 dark:border-cyan-500/30">
      <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
        {t('reviews.response_from', 'Response from {{role}}', { role: responseRole })}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        {review.response.text}
      </p>
    </div>
  )}
</GlassCard>
```

#### i18next Translations

```typescript
// Review actions
{t('reviews.helpful', 'Helpful')}
{t('reviews.report', 'Report')}
{t('reviews.response_from', 'Response from {{role}}', { role: 'Host' })}

// Review metadata
{t('reviews.stayed_on', 'Stayed on {{date}}', { date: formatDate(checkIn) })}
{t('reviews.verified_stay', 'Verified Stay')}

// Empty response
{t('reviews.no_response', 'No response yet')}
```

---

### ReviewList Component

**File:** `client/src/components/reviews/ReviewList.tsx`

Paginated list with staggered animations:

```typescript
import { ReviewList } from '@/components/reviews/ReviewList';
import { StaggerContainer } from '@/components/animations/FramerMotionWrappers';

<ReviewList
  reviews={reviews}
  loading={isLoading}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>
```

#### Aurora Tide Implementation

```tsx
<div className="space-y-4">
  {/* Header */}
  <FadeIn>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
        {t('reviews.all_reviews', 'All Reviews')} ({totalCount})
      </h3>
      <select className="glass-card px-3 py-2 text-sm rounded-lg">
        <option>{t('reviews.sort.recent', 'Most Recent')}</option>
        <option>{t('reviews.sort.highest', 'Highest Rated')}</option>
        <option>{t('reviews.sort.lowest', 'Lowest Rated')}</option>
      </select>
    </div>
  </FadeIn>

  {/* Review cards with stagger */}
  <StaggerContainer staggerDelay={0.08}>
    {reviews.map(review => (
      <ScaleIn key={review.id}>
        <ReviewCard review={review} />
      </ScaleIn>
    ))}
  </StaggerContainer>

  {/* Load more */}
  {hasMore && (
    <FadeIn>
      <PulseButton
        onClick={onLoadMore}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl mt-6"
        data-testid="button-load-more"
      >
        {loading 
          ? t('reviews.loading', 'Loading...') 
          : t('reviews.load_more', 'Load More Reviews')
        }
      </PulseButton>
    </FadeIn>
  )}

  {/* Empty state */}
  {reviews.length === 0 && !loading && (
    <FadeIn>
      <GlassCard depth={2} className="border-cyan-200/30 dark:border-cyan-500/30 p-12 text-center">
        <Star className="w-16 h-16 mx-auto mb-4 text-cyan-500/30" />
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {t('reviews.no_reviews', 'No reviews yet')}
        </h4>
        <p className="text-slate-600 dark:text-slate-400">
          {t('reviews.first_review', 'Be the first to leave a review')}
        </p>
      </GlassCard>
    </FadeIn>
  )}
</div>
```

---

### RatingSummary Component

**File:** `client/src/components/reviews/RatingSummary.tsx`

Statistical overview with visual bars:

```typescript
import { RatingSummary } from '@/components/reviews/RatingSummary';

<RatingSummary
  averageRating={4.7}
  totalReviews={127}
  ratingDistribution={{
    5: 89,
    4: 24,
    3: 8,
    2: 4,
    1: 2
  }}
/>
```

#### Aurora Tide Implementation

```tsx
<GlassCard 
  depth={2}
  className="border-cyan-200/30 dark:border-cyan-500/30 p-6"
  data-testid="rating-summary"
>
  {/* Overall rating */}
  <div className="flex items-center gap-4 mb-6">
    <div className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
      {averageRating.toFixed(1)}
    </div>
    <div>
      <StarRating rating={averageRating} readonly size="lg" />
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        {t('reviews.based_on', {
          defaultValue: 'Based on {{count}} review',
          defaultValue_plural: 'Based on {{count}} reviews',
          count: totalReviews
        })}
      </p>
    </div>
  </div>

  {/* Rating distribution bars */}
  <div className="space-y-2">
    {[5, 4, 3, 2, 1].map(stars => {
      const count = ratingDistribution[stars] || 0;
      const percentage = (count / totalReviews) * 100;
      
      return (
        <div key={stars} className="flex items-center gap-3">
          <span className="text-sm text-slate-700 dark:text-slate-300 w-12">
            {stars} {t('reviews.stars', 'stars')}
          </span>
          
          {/* Progress bar with gradient */}
          <div className="flex-1 h-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, delay: 0.1 * (5 - stars) }}
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
            />
          </div>
          
          <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
            {count}
          </span>
        </div>
      );
    })}
  </div>
</GlassCard>
```

#### i18next Translations

```typescript
// Summary text
{t('reviews.average_rating', 'Average Rating')}
{t('reviews.based_on', {
  defaultValue: 'Based on {{count}} review',
  defaultValue_plural: 'Based on {{count}} reviews',
  count: totalReviews
})}

// Distribution labels
{t('reviews.stars', 'stars')}
{t('reviews.excellent_percentage', '{{percent}}% excellent', { percent: 70 })}
```

---

## 3. Bidirectional Rating System

### Guest Reviews Host

After checkout, guests can review:
- Overall rating (1-5 stars)
- Cleanliness rating
- Communication rating
- Accuracy rating
- Written review (optional)

### Host Reviews Guest

Hosts can review guests on:
- Overall rating (1-5 stars)
- Respectfulness
- Communication
- House rules compliance
- Written review (optional)

### Review Visibility

- Reviews become visible after **both parties** submit reviews, or 14 days after checkout
- Prevents bias in bidirectional rating
- Ensures honest feedback

---

## 4. Data-testid Coverage

```typescript
// StarRating
<div data-testid="star-rating" />
<button data-testid={`star-${index}`} />

// ReviewCard
<GlassCard data-testid={`card-review-${review.id}`} />
<button data-testid={`button-helpful-${review.id}`} />
<button data-testid={`button-report-${review.id}`} />

// ReviewList
<div data-testid="review-list" />
<button data-testid="button-load-more" />
<div data-testid="empty-reviews" />

// RatingSummary
<div data-testid="rating-summary" />
<div data-testid={`distribution-${stars}-stars`} />
```

---

## 5. API Endpoints

- `POST /api/reviews` - Submit review
- `GET /api/reviews/:propertyId` - Get property reviews
- `GET /api/reviews/pending` - Get pending reviews for user
- `POST /api/reviews/:id/helpful` - Mark review as helpful
- `POST /api/reviews/:id/report` - Report inappropriate review
- `POST /api/reviews/:id/response` - Host/guest responds to review

---

## 6. Related Documentation

- [Aurora Tide Design System](../design-systems/aurora-tide.md)
- [My Bookings](./my-bookings.md)
- [Host Bookings](./host-bookings.md)
- [Booking System](../../booking-system.md)

---

**Last Transformation:** October 6, 2025 - Aurora Tide Complete ✨
