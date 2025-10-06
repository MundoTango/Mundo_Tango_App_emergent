# My Bookings (Guest View) Documentation

**Last Updated:** October 6, 2025  
**Status:** ✅ Production-Ready - Aurora Tide Transformation Complete  
**Design System:** [Aurora Tide Documentation](../design-systems/aurora-tide.md)

---

## 1. Overview

- **Route**: `/my-bookings`
- **Purpose**: Guest-facing booking management dashboard with trip timeline, status tracking, and review submission
- **ESA Framework Layer**: Layer 27 (Marketplace) + Layer 9 (UI Framework)

---

## 2. Aurora Tide Design System Implementation

### Glassmorphic Components

The My Bookings page uses Aurora Tide's glassmorphic card system for booking cards:

```typescript
import { GlassCard } from '@/components/glass/GlassComponents';
import { StaggerContainer, ScaleIn } from '@/components/animations/FramerMotionWrappers';
import { PulseButton, MagneticButton } from '@/components/interactions/MicroInteractions';

// Booking Cards Grid
<StaggerContainer staggerDelay={0.1}>
  {bookings.map(booking => (
    <ScaleIn key={booking.id} delay={0.05}>
      <GlassCard 
        depth={2}
        className="border-cyan-200/30 dark:border-cyan-500/30 p-6"
        data-testid={`card-booking-${booking.id}`}
      >
        <BookingContent booking={booking} />
      </GlassCard>
    </ScaleIn>
  ))}
</StaggerContainer>
```

### Framer Motion Animations

**Card Entrance:**
- StaggerContainer for booking grid (0.1s stagger delay)
- ScaleIn for individual booking cards (0.05s delay)
- FadeIn for empty state message

**Status Transitions:**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  className="status-badge"
>
  {status}
</motion.div>
```

### MT Ocean Theme Gradients

**Status Badges:**

**Approved (Upcoming):**
```tsx
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300 to-cyan-400 text-cyan-900 dark:text-cyan-50">
  {t('bookings.status.approved', 'Approved')}
</span>
```

**Pending:**
```tsx
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-200 to-amber-400 text-amber-900 dark:text-amber-50">
  {t('bookings.status.pending', 'Pending')}
</span>
```

**Completed:**
```tsx
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-300 to-teal-400 text-teal-900 dark:text-teal-50">
  {t('bookings.status.completed', 'Completed')}
</span>
```

**Host Avatar Gradient:**
```tsx
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
  {host.initials}
</div>
```

### Micro-interactions

**Cancel Button (Magnetic):**
```tsx
<MagneticButton
  strength={0.15}
  onClick={handleCancel}
  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 glass-card"
  data-testid={`button-cancel-${booking.id}`}
>
  <XCircle className="w-4 h-4 mr-2" />
  {t('bookings.cancel', 'Cancel Booking')}
</MagneticButton>
```

**Leave Review CTA (Pulse):**
```tsx
<PulseButton
  onClick={handleReview}
  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg"
  data-testid={`button-review-${booking.id}`}
>
  <Star className="w-4 h-4 mr-2" />
  {t('bookings.leave_review', 'Leave Review')}
</PulseButton>
```

### i18next Translations

All text uses translation keys under `housing.my_bookings.*`:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Page header
{t('housing.my_bookings.title', 'My Bookings')}
{t('housing.my_bookings.subtitle', 'Manage your tango accommodation')}

// Trip timeline
{t('housing.my_bookings.upcoming', 'Upcoming Trips')}
{t('housing.my_bookings.past', 'Past Trips')}
{t('housing.my_bookings.pending', 'Pending Requests')}

// Booking details
{t('housing.my_bookings.nights', { 
  defaultValue: '{{count}} night', 
  defaultValue_plural: '{{count}} nights', 
  count: nights 
})}
{t('housing.my_bookings.guests', {
  defaultValue: '{{count}} guest',
  defaultValue_plural: '{{count}} guests',
  count: guestCount
})}

// Actions
{t('housing.my_bookings.view_details', 'View Details')}
{t('housing.my_bookings.contact_host', 'Contact Host')}
{t('housing.my_bookings.get_directions', 'Get Directions')}

// Empty states
{t('housing.my_bookings.no_upcoming', 'No upcoming bookings')}
{t('housing.my_bookings.no_past', 'No past trips yet')}
{t('housing.my_bookings.browse_cta', 'Browse Properties')}
```

### Dark Mode Support

```tsx
<GlassCard className="
  bg-white/80 dark:bg-slate-900/80
  border-cyan-200/30 dark:border-cyan-500/30
">
  {/* Property image */}
  <div className="relative rounded-lg overflow-hidden">
    <img 
      src={property.image} 
      alt={property.title}
      className="w-full h-48 object-cover"
    />
    <div className="absolute top-3 right-3">
      <ConnectionBadge degree={connection.degree} />
    </div>
  </div>

  {/* Booking info */}
  <div className="mt-4">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
      {property.title}
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
      {formatDateRange(checkIn, checkOut)}
    </p>
  </div>

  {/* Status and actions */}
  <div className="mt-4 flex items-center justify-between">
    <StatusBadge status={booking.status} />
    <div className="flex gap-2">
      {canCancel && <MagneticButton>Cancel</MagneticButton>}
      {canReview && <PulseButton>Review</PulseButton>}
    </div>
  </div>
</GlassCard>
```

---

## 3. Features

### Trip Timeline Sections

1. **Upcoming Trips** - Approved bookings with future check-in dates
2. **Pending Requests** - Bookings awaiting host approval
3. **Past Trips** - Completed stays with review prompts

### Booking Card Information

- Property photo with connection badge overlay
- Property title and location
- Host name with avatar (MT Ocean gradient)
- Check-in/check-out dates
- Guest count and total nights
- Booking status badge
- Action buttons (View, Cancel, Review, Contact)

### Interactive Elements

**Cancel Booking:**
- Only available for pending/approved bookings
- Magnetic button with confirmation dialog
- Refund policy display

**Leave Review:**
- Pulse button for completed stays
- Opens review modal with star rating
- Bidirectional rating system

**Contact Host:**
- Direct messaging link
- Shows host's response time

---

## 4. Data-testid Coverage

```typescript
// Page elements
<div data-testid="page-my-bookings" />
<div data-testid="section-upcoming" />
<div data-testid="section-pending" />
<div data-testid="section-past" />

// Booking cards
<GlassCard data-testid={`card-booking-${booking.id}`} />
<span data-testid={`status-${booking.id}`} />

// Actions
<MagneticButton data-testid={`button-cancel-${booking.id}`} />
<PulseButton data-testid={`button-review-${booking.id}`} />
<button data-testid={`button-view-${booking.id}`} />
<button data-testid={`button-contact-${booking.id}`} />

// Empty states
<div data-testid="empty-upcoming" />
<div data-testid="empty-past" />
```

---

## 5. API Endpoints

- `GET /api/bookings/my-bookings` - Fetch user's bookings
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/reviews` - Submit review for completed stay

---

## 6. Related Documentation

- [Aurora Tide Design System](../design-systems/aurora-tide.md)
- [Review Components](./reviews.md)
- [Booking System](../../booking-system.md)
- [Guest Onboarding](./GuestOnboarding.md)

---

**Last Transformation:** October 6, 2025 - Aurora Tide Complete ✨
