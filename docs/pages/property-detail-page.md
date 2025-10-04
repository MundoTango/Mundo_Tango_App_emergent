# Property Detail Page (Listing Detail)

## Overview

The Property Detail Page displays comprehensive information about a single housing listing, allowing guests to view photos, amenities, pricing, and submit booking requests. Access via `/listing/:id`.

**File Location:** `client/src/pages/listing-detail.tsx`

## Route Configuration

**Route Path:** `/listing/:id`  
**Component:** `ListingDetail`  
**Navigation:** Lazy-loaded with Suspense fallback

```typescript
// App.tsx
<Route path="/listing/:id">
  <Suspense fallback={<LoadingFallback message="Loading listing details..." />}>
    <ListingDetail />
  </Suspense>
</Route>
```

## Page Features

### 1. Property Information Display

**Header Section:**
- Property title
- Location (city, country) with map pin icon
- Guest capacity
- Rating and review count
- Share and favorite buttons

**Photo Gallery:**
- Multi-image carousel
- Click to view different property photos
- Full-screen image viewer (future feature)

**Property Details:**
- Full description
- Host information
- Room type and bedroom/bathroom count
- House rules
- Cancellation policy

### 2. Amenities List

Icons and labels for available amenities:
- WiFi
- Kitchen
- Parking
- Air Conditioning
- Music Equipment
- Coffee Maker
- Gym
- Pool
- Workspace
- Pets Allowed
- Smoking Allowed
- Washer/Dryer

**Icon Mapping:**
```typescript
const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Kitchen': Utensils,
  'Parking': Car,
  'Air Conditioning': Wind,
  'Music Equipment': Music,
  'Coffee Maker': Coffee,
  'Gym': Dumbbell,
  'Pool': Waves,
  'Workspace': Briefcase,
  'Pets Allowed': PawPrint,
  'Smoking Allowed': Cigarette,
  'Washer': Home,
};
```

### 3. Pricing & Availability

**Price Display:**
- Price per night in local currency
- Total price calculation based on selected dates
- Service fees (if applicable)
- Taxes and additional charges

**Availability Calendar:**
- Interactive date picker for check-in/check-out
- Blocked dates shown for unavailable periods
- Minimum stay requirements
- Instant price updates on date selection

### 4. Booking Request Form

**Form Fields:**
- Check-in date (required)
- Check-out date (required)
- Number of guests (required, 1 to max capacity)
- Purpose of visit (optional)
- Message to host (optional)
- House rules acknowledgment (required checkbox)

**Validation Rules:**
- Check-in must be in the future
- Check-out must be after check-in
- Guest count cannot exceed property max
- House rules must be accepted

**Submission Flow:**
1. User fills out booking form
2. Clicks "Request to Book" button
3. Form validates all fields
4. POST request to `/api/bookings`
5. Success toast notification appears
6. Redirects to `/my-bookings` after 1.5s

## API Integration

### Fetch Property Details

**Endpoint:** `GET /api/host-homes/:id`

**Query:**
```typescript
const { data: listing, isLoading, error } = useQuery<{ data: HostHome }>({
  queryKey: [`/api/host-homes/${id}`],
  enabled: !!id,
});
```

**Response:**
```typescript
interface HostHome {
  id: number;
  hostId: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  photos: string[];
  amenities: string[];
  maxGuests: number;
  pricePerNight: number;
  availability: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Booking Request

**Endpoint:** `POST /api/bookings`

**Mutation:**
```typescript
const createBookingMutation = useMutation({
  mutationFn: async (bookingData: any) => {
    return await apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  onSuccess: () => {
    toast({
      title: 'Booking request sent!',
      description: 'The host will review your request and respond soon.',
    });
    navigate('/my-bookings');
  },
});
```

## Navigation

### Entry Points

**From Housing Marketplace:**
```typescript
// housing-marketplace.tsx (line 642)
onClick={() => navigate(`/listing/${listing.id}`)}
```

**From Group Housing Page:**
```typescript
onClick={() => navigate(`/listing/${property.id}`)}
```

**Direct URL:**
```
https://your-domain.com/listing/1
https://your-domain.com/listing/42
```

### Exit Points

**Back to Marketplace:**
- "Back to Marketplace" link in header
- Navigates to `/housing-marketplace`

**After Booking:**
- Auto-redirect to `/my-bookings` on successful booking

## Component Structure

```
ListingDetail
├── Header (Back button)
├── ImageGallery (Photo carousel)
├── PropertyInfo
│   ├── Title & Location
│   ├── Guest Capacity
│   ├── Rating & Reviews
│   └── Actions (Share, Favorite)
├── PropertyDetails
│   ├── Description
│   ├── Host Info
│   └── Amenities List
├── PricingCard (Sticky sidebar)
│   ├── Price per night
│   ├── Date picker
│   ├── Guest count selector
│   └── Total price calculation
└── BookingModal
    ├── Date Selection
    ├── Guest Count
    ├── Purpose Input
    ├── Message Textarea
    ├── House Rules Checkbox
    └── Submit Button
```

## User Experience

### Loading States

**Skeleton Display:**
- Shows while property data is being fetched
- Placeholder for images, title, description
- Prevents layout shift on data load

### Error Handling

**Property Not Found (404):**
```typescript
if (error) {
  return (
    <div className="text-center p-12">
      <h2 className="text-2xl font-bold">Property not found</h2>
      <p>This listing may have been removed or is no longer available.</p>
      <Button onClick={() => navigate('/housing-marketplace')}>
        Browse Other Listings
      </Button>
    </div>
  );
}
```

### Success Feedback

**Booking Submitted:**
- Toast notification: "Booking request sent!"
- Description: "The host will review your request and respond soon."
- Auto-redirect to My Bookings page

## Mobile Responsiveness

**Responsive Design:**
- Single column layout on mobile
- Sticky pricing card becomes bottom sheet
- Tap-friendly buttons and form inputs
- Optimized image loading
- Collapsible sections for amenities/house rules

## Future Enhancements

1. **Photo Gallery:**
   - Full-screen image viewer
   - Zoom functionality
   - Image navigation arrows

2. **Reviews Section:**
   - Display guest reviews
   - Overall rating breakdown
   - Review photos

3. **Interactive Map:**
   - Show property location
   - Nearby tango venues
   - Public transport

4. **Host Profile:**
   - Click to view full host profile
   - Response rate and time
   - Host verification badges

5. **Instant Book:**
   - Skip host approval for verified guests
   - Immediate confirmation

6. **Similar Listings:**
   - Recommendations based on current property
   - Alternative dates/prices

## Related Documentation

- [Housing Marketplace](./housing/housing-marketplace.md) - Property discovery and search
- [Booking System](./booking-system.md) - Complete booking flow
- [Bookings API](./bookings-api.md) - API reference
- [Routing Guide](./routing-guide.md) - All housing routes

---

**Last Updated:** October 4, 2025  
**Component:** `client/src/pages/listing-detail.tsx`  
**Route:** `/listing/:id`
