# Housing System Routing Guide

## Overview

Complete routing documentation for the Mundo Tango housing marketplace system, including all routes, navigation paths, and route parameters.

**Last Updated:** October 4, 2025

## Route Hierarchy

```
/housing-marketplace          → Main marketplace (property discovery)
├── /listing/:id             → Individual property detail page
├── /host-onboarding         → Host property listing wizard
├── /guest-onboarding        → Guest profile creation wizard
├── /my-bookings             → Guest's booking requests (all statuses)
├── /host-bookings           → Host's incoming booking dashboard
└── /host-calendar           → Host's booking calendar view
```

## Route Definitions

### 1. Housing Marketplace

**Path:** `/housing-marketplace`  
**Component:** `HousingMarketplace`  
**Access:** Public (all authenticated users)  
**File:** `client/src/pages/housing-marketplace.tsx`

**Purpose:**
- Browse available housing listings
- Search and filter properties
- View property cards with quick details
- Navigate to property detail pages

**Features:**
- Search by location, title, description
- Filter by type (apartment, room, shared, house)
- Price range slider
- View listings count and statistics

**Navigation Example:**
```typescript
import { useLocation } from 'wouter';

const [, navigate] = useLocation();
navigate('/housing-marketplace');
```

---

### 2. Property Detail Page

**Path:** `/listing/:id`  
**Component:** `ListingDetail`  
**Access:** Public (all authenticated users)  
**File:** `client/src/pages/listing-detail.tsx`

**Route Parameters:**
- `id` (required) - Property ID from `host_homes` table

**Purpose:**
- View comprehensive property information
- Browse photo gallery
- Check amenities and house rules
- Submit booking requests

**Navigation from Marketplace:**
```typescript
// Property card click handler (line 642 in housing-marketplace.tsx)
onClick={() => navigate(`/listing/${listing.id}`)}
```

**Direct Access:**
```
/listing/1
/listing/42
/listing/123
```

**API Endpoint Used:**
```
GET /api/host-homes/:id
```

---

### 3. Host Onboarding

**Path:** `/host-onboarding`  
**Component:** `HostOnboarding`  
**Access:** Authenticated users (creating first listing)  
**File:** `client/src/pages/HostOnboarding.tsx`

**Purpose:**
- Multi-step wizard for listing a property
- Collect property details, amenities, photos
- Set pricing and availability
- Publish to marketplace

**Steps:**
1. Property basics (title, description, location)
2. Capacity and room details
3. Amenities selection
4. Photo upload (up to 10 images)
5. Pricing and availability
6. Review and publish

**Navigation:**
```typescript
navigate('/host-onboarding');
```

---

### 4. Guest Onboarding

**Path:** `/guest-onboarding`  
**Component:** `GuestOnboarding`  
**Access:** New users creating guest profile  
**File:** `client/src/pages/GuestOnboarding.tsx`

**Purpose:**
- Create guest profile with preferences
- Set accommodation preferences
- Enable permanent preference persistence
- Quick booking experience

**Profile Fields:**
- Name and contact information
- Tango role and experience level
- Accommodation preferences (room type, amenities)
- Budget range
- Special requirements

**Navigation:**
```typescript
navigate('/guest-onboarding');
```

---

### 5. My Bookings (Guest View)

**Path:** `/my-bookings`  
**Component:** `MyBookings`  
**Access:** Authenticated users (as guest)  
**File:** `client/src/pages/my-bookings.tsx`

**Purpose:**
- View all booking requests submitted by user
- Track booking status (pending, approved, rejected)
- View host responses
- Manage upcoming stays

**Status Tabs:**
- All bookings
- Pending (awaiting host response)
- Confirmed (approved bookings)
- Past stays
- Cancelled

**Navigation:**
```typescript
// After successful booking submission
navigate('/my-bookings');
```

**API Endpoint Used:**
```
GET /api/bookings?role=guest
```

---

### 6. Host Bookings Dashboard

**Path:** `/host-bookings`  
**Component:** `HostBookings`  
**Access:** Property owners only  
**File:** `client/src/pages/host-bookings.tsx`

**Purpose:**
- Manage incoming booking requests
- Accept or decline bookings
- View guest information
- Track booking revenue

**Status Tabs:**
- Pending (requires host response)
- Approved (confirmed bookings)
- Rejected (declined requests)
- All bookings

**Actions:**
- Accept booking with welcome message
- Decline booking with explanation
- View guest profile
- Send messages to guests

**Navigation:**
```typescript
navigate('/host-bookings');
```

**API Endpoint Used:**
```
GET /api/bookings?role=host
```

**API Actions:**
```
PATCH /api/bookings/:id/status
```

---

### 7. Host Calendar

**Path:** `/host-calendar`  
**Component:** `HostCalendar`  
**Access:** Property owners only  
**File:** `client/src/pages/host-calendar.tsx`

**Purpose:**
- Visual calendar of all bookings
- View blocked dates and availability
- Manage multiple properties
- Quick booking overview by month

**Features:**
- Monthly/weekly calendar views
- Color-coded booking statuses
- Multi-property switcher
- Block dates manually
- Export booking schedule

**Navigation:**
```typescript
navigate('/host-calendar');
```

---

## Route Configuration (App.tsx)

All housing routes are configured in `client/src/App.tsx` starting at line 346:

```typescript
{/* ========== Housing & Marketplace Routes (7) ========== */}
<Route path="/housing-marketplace">
  <Suspense fallback={<LoadingFallback message="Loading housing marketplace..." />}>
    <HousingMarketplace />
  </Suspense>
</Route>

<Route path="/host-onboarding">
  <Suspense fallback={<LoadingFallback message="Loading host onboarding..." />}>
    <HostOnboarding />
  </Suspense>
</Route>

<Route path="/guest-onboarding">
  <Suspense fallback={<LoadingFallback message="Loading guest onboarding..." />}>
    <GuestOnboarding />
  </Suspense>
</Route>

<Route path="/listing/:id">
  <Suspense fallback={<LoadingFallback message="Loading listing details..." />}>
    <ListingDetail />
  </Suspense>
</Route>

<Route path="/my-bookings">
  <Suspense fallback={<LoadingFallback message="Loading your bookings..." />}>
    <MyBookings />
  </Suspense>
</Route>

<Route path="/host-bookings">
  <Suspense fallback={<LoadingFallback message="Loading host dashboard..." />}>
    <HostBookings />
  </Suspense>
</Route>

<Route path="/host-calendar">
  <Suspense fallback={<LoadingFallback message="Loading booking calendar..." />}>
    <HostCalendar />
  </Suspense>
</Route>
```

## Navigation Patterns

### Primary User Journeys

**Guest Booking Journey:**
```
/housing-marketplace
  → Click property card
  → /listing/:id
  → Fill booking form
  → Submit
  → /my-bookings
```

**Host Response Journey:**
```
/host-bookings
  → View pending request
  → Accept/Decline
  → Booking updated
  → Guest receives notification
```

**Host Listing Journey:**
```
/host-onboarding
  → Complete wizard steps
  → Publish property
  → /housing-marketplace (property now visible)
```

### Navigation Utilities

**Using wouter:**
```typescript
import { useLocation, Link } from 'wouter';

// Programmatic navigation
const [, navigate] = useLocation();
navigate('/listing/1');

// Link component
<Link href="/housing-marketplace">
  <a>Browse Listings</a>
</Link>
```

**With query parameters:**
```typescript
// Filter by city
navigate('/housing-marketplace?city=Buenos+Aires');

// Filter by type
navigate('/housing-marketplace?type=apartment');
```

## Route Guards & Access Control

### Authentication Required

All housing routes require authentication:

```typescript
// Checked in App.tsx via AuthContext
const { user } = useAuth();

if (!user) {
  // Redirect to login
  navigate('/login');
}
```

### Role-Based Access

**Host-Only Routes:**
- `/host-bookings` - Requires user to be a property owner
- `/host-calendar` - Requires active listings

**Check:**
```typescript
const hasListings = await db.select()
  .from(hostHomes)
  .where(eq(hostHomes.hostId, user.id));

if (hasListings.length === 0) {
  // Show "List Your Space" prompt
}
```

## Common Navigation Issues

### Issue 1: Wrong Property Route

**❌ Incorrect:**
```typescript
navigate(`/housing-marketplace/${id}`);  // Wrong path
```

**✅ Correct:**
```typescript
navigate(`/listing/${id}`);  // Matches App.tsx route
```

**Fixed:** October 4, 2025 (line 642 in housing-marketplace.tsx)

### Issue 2: Missing Route Parameters

**❌ Incorrect:**
```typescript
navigate('/listing/');  // Missing ID
```

**✅ Correct:**
```typescript
navigate(`/listing/${propertyId}`);  // Include ID
```

### Issue 3: Hardcoded IDs

**❌ Incorrect:**
```typescript
navigate('/listing/1');  // Always property #1
```

**✅ Correct:**
```typescript
navigate(`/listing/${listing.id}`);  // Dynamic ID
```

## Related Backend Routes

### API Endpoints

```
GET    /api/host-homes              → List all properties
GET    /api/host-homes/:id          → Get property details
POST   /api/host-homes              → Create new listing
PATCH  /api/host-homes/:id          → Update property
DELETE /api/host-homes/:id          → Remove listing

GET    /api/bookings                → Get user's bookings
GET    /api/bookings/:id            → Get booking details
POST   /api/bookings                → Create booking request
PATCH  /api/bookings/:id/status     → Host response (approve/reject)
DELETE /api/bookings/:id            → Cancel booking
```

See [Bookings API Reference](./bookings-api.md) for complete API documentation.

## Testing Routes

### Manual Testing

```bash
# Open marketplace
open http://localhost:5000/housing-marketplace

# View property #1
open http://localhost:5000/listing/1

# Open host dashboard
open http://localhost:5000/host-bookings
```

### Playwright Tests

```typescript
test('navigate from marketplace to property detail', async ({ page }) => {
  await page.goto('/housing-marketplace');
  await page.click('[data-testid="button-view-details-1"]');
  await expect(page).toHaveURL('/listing/1');
});
```

## Future Routes

Planned additions:

- `/listing/:id/reviews` - Property reviews page
- `/host-analytics` - Revenue and booking analytics
- `/favorites` - Saved properties
- `/messages/:bookingId` - Booking-specific messaging
- `/host-settings` - Host account settings

## Related Documentation

- [Property Detail Page](./property-detail-page.md) - Listing page features
- [Host Dashboard](./host-dashboard.md) - Managing bookings
- [Booking System](./booking-system.md) - Complete booking flow
- [Bookings API](./bookings-api.md) - API endpoints

---

**Maintained by:** ESA Development Team  
**Framework:** ESA LIFE CEO 61x21  
**Router:** wouter (React)
