# Host Bookings Dashboard Documentation

**Last Updated:** October 6, 2025  
**Status:** ✅ Production-Ready - Aurora Tide Transformation Complete  
**Design System:** [Aurora Tide Documentation](../design-systems/aurora-tide.md)

---

## 1. Overview

- **Route**: `/host-bookings`
- **Purpose**: Host-facing booking management dashboard with request approval, calendar integration, and guest communication
- **ESA Framework Layer**: Layer 27 (Marketplace) + Layer 9 (UI Framework)

---

## 2. Aurora Tide Design System Implementation

### Glassmorphic Components

The Host Bookings dashboard uses Aurora Tide's glassmorphic system:

```typescript
import { GlassCard } from '@/components/glass/GlassComponents';
import { StaggerContainer, ScaleIn, FadeIn } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';

// Filter Panel
<FadeIn delay={0.1}>
  <GlassCard 
    depth={2} 
    className="border-cyan-200/30 dark:border-cyan-500/30 p-6 mb-6"
  >
    <FilterControls />
  </GlassCard>
</FadeIn>

// Booking Cards Grid
<StaggerContainer staggerDelay={0.1}>
  {bookings.map(booking => (
    <ScaleIn key={booking.id} delay={0.05}>
      <GlassCard 
        depth={2}
        className="border-cyan-200/30 dark:border-cyan-500/30 p-6"
        data-testid={`card-booking-${booking.id}`}
      >
        <BookingRequestCard booking={booking} />
      </GlassCard>
    </ScaleIn>
  ))}
</StaggerContainer>
```

### Framer Motion Animations

**Card Entrance:**
- FadeIn for filter panel (0.1s delay)
- StaggerContainer for booking grid (0.1s stagger)
- ScaleIn for individual cards (0.05s delay)

**Status Update Animation:**
```typescript
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
>
  {updatedStatus}
</motion.div>
```

### MT Ocean Theme Gradients

**Status Filter Chips:**

**All (Active):**
```tsx
<button className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
  {t('host_bookings.filter.all', 'All Requests')}
</button>
```

**Pending:**
```tsx
<button className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-200 to-amber-400 text-amber-900">
  {t('host_bookings.filter.pending', 'Pending')}
</button>
```

**Status Badges:**

**Pending Review:**
```tsx
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-200 to-amber-400 text-amber-900 dark:text-amber-50 font-medium">
  {t('host_bookings.status.pending', 'Pending')}
</span>
```

**Approved:**
```tsx
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300 to-cyan-400 text-cyan-900 dark:text-cyan-50 font-medium">
  {t('host_bookings.status.approved', 'Approved')}
</span>
```

**Declined:**
```tsx
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-300 to-red-400 text-red-900 dark:text-red-50 font-medium">
  {t('host_bookings.status.declined', 'Declined')}
</span>
```

**Guest Avatar Gradient:**
```tsx
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
  {guest.initials}
</div>
```

### Micro-interactions

**Accept Button (Pulse):**
```tsx
<PulseButton
  onClick={handleAccept}
  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg"
  data-testid={`button-accept-${booking.id}`}
>
  <Check className="w-4 h-4 mr-2" />
  {t('host_bookings.accept', 'Accept')}
</PulseButton>
```

**Decline Button (Magnetic):**
```tsx
<MagneticButton
  strength={0.15}
  onClick={handleDecline}
  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 glass-card"
  data-testid={`button-decline-${booking.id}`}
>
  <XCircle className="w-4 h-4 mr-2" />
  {t('host_bookings.decline', 'Decline')}
</MagneticButton>
```

### i18next Translations

All text uses translation keys under `housing.host_bookings.*`:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Page header
{t('housing.host_bookings.title', 'Booking Requests')}
{t('housing.host_bookings.subtitle', 'Manage guest requests for your properties')}

// Filter options
{t('housing.host_bookings.filter.all', 'All Requests')}
{t('housing.host_bookings.filter.pending', 'Pending')}
{t('housing.host_bookings.filter.approved', 'Approved')}
{t('housing.host_bookings.filter.declined', 'Declined')}
{t('housing.host_bookings.filter.completed', 'Completed')}

// Booking details
{t('housing.host_bookings.guest', 'Guest')}
{t('housing.host_bookings.property', 'Property')}
{t('housing.host_bookings.dates', 'Dates')}
{t('housing.host_bookings.nights', {
  defaultValue: '{{count}} night',
  defaultValue_plural: '{{count}} nights',
  count: nights
})}
{t('housing.host_bookings.guests_count', {
  defaultValue: '{{count}} guest',
  defaultValue_plural: '{{count}} guests',
  count: guestCount
})}

// Connection badge
{t('housing.host_bookings.connection.direct', '1st degree connection')}
{t('housing.host_bookings.connection.friend_of_friend', '2nd degree connection')}
{t('housing.host_bookings.connection.community', 'Community member')}

// Actions
{t('housing.host_bookings.view_profile', 'View Guest Profile')}
{t('housing.host_bookings.message', 'Send Message')}
{t('housing.host_bookings.accept_confirm', 'Confirm and accept this booking?')}
{t('housing.host_bookings.decline_reason', 'Reason for declining (optional)')}

// Empty states
{t('housing.host_bookings.no_pending', 'No pending requests')}
{t('housing.host_bookings.no_bookings', 'No booking requests yet')}
```

### Dark Mode Support

```tsx
<GlassCard className="
  bg-white/80 dark:bg-slate-900/80
  border-cyan-200/30 dark:border-cyan-500/30
">
  {/* Header with status */}
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      <GuestAvatar guest={guest} />
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {guest.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('host_bookings.requested', 'Requested')} {formatDate(requestedAt)}
        </p>
      </div>
    </div>
    <StatusBadge status={booking.status} />
  </div>

  {/* Property and dates */}
  <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {property.title}
        </p>
        <p className="font-medium text-slate-900 dark:text-white">
          {formatDateRange(checkIn, checkOut)}
        </p>
      </div>
      <ConnectionBadge degree={connection.degree} />
    </div>
  </div>

  {/* Actions */}
  {isPending && (
    <div className="flex gap-3">
      <PulseButton className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
        Accept
      </PulseButton>
      <MagneticButton className="flex-1 glass-card text-red-600 dark:text-red-400">
        Decline
      </MagneticButton>
    </div>
  )}
</GlassCard>
```

---

## 3. Features

### Filter System

**Status Filters:**
- All Requests (default)
- Pending Review
- Approved
- Declined
- Completed

**Property Filter:**
- Filter by specific property listing
- Multi-property hosts can isolate bookings per listing

### Booking Request Card

**Guest Information:**
- Guest avatar with MT Ocean gradient
- Guest name and profile link
- Connection degree badge
- Request timestamp

**Booking Details:**
- Property name
- Check-in/check-out dates
- Number of guests
- Total nights
- Special requests/message from guest

**Actions (Pending Requests):**
- Accept (Pulse button with green gradient)
- Decline (Magnetic button with confirmation dialog)
- Message Guest
- View Guest Profile

### Real-time Updates

- Live status changes via WebSocket
- Instant badge color transitions
- Calendar auto-updates on approval
- Email notifications on status change

---

## 4. Data-testid Coverage

```typescript
// Page elements
<div data-testid="page-host-bookings" />
<GlassCard data-testid="filter-panel" />

// Filter chips
<button data-testid="filter-all" />
<button data-testid="filter-pending" />
<button data-testid="filter-approved" />
<button data-testid="filter-declined" />

// Booking cards
<GlassCard data-testid={`card-booking-${booking.id}`} />
<span data-testid={`status-${booking.id}`} />

// Actions
<PulseButton data-testid={`button-accept-${booking.id}`} />
<MagneticButton data-testid={`button-decline-${booking.id}`} />
<button data-testid={`button-message-${booking.id}`} />
<button data-testid={`button-profile-${booking.id}`} />

// Empty state
<div data-testid="empty-bookings" />
```

---

## 5. API Endpoints

- `GET /api/bookings/host` - Fetch bookings for host's properties
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/approve` - Approve booking request
- `PUT /api/bookings/:id/decline` - Decline booking request
- `POST /api/messages` - Send message to guest

---

## 6. Related Documentation

- [Aurora Tide Design System](../design-systems/aurora-tide.md)
- [Host Calendar](../calendar-system.md)
- [Host Dashboard](../../host-dashboard.md)
- [Host Onboarding](./HostOnboarding.md)

---

**Last Transformation:** October 6, 2025 - Aurora Tide Complete ✨
