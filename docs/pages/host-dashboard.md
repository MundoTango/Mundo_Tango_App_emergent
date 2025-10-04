# Host Dashboard

## Overview

The Host Dashboard provides a centralized interface for property owners to manage incoming booking requests, view booking history, and monitor property performance. Access the dashboard at `/host-bookings`.

## Features

### 1. Booking Request Management

**Request Cards Display:**
- Guest name and profile photo
- Property requested
- Check-in and check-out dates
- Number of nights and guests
- Purpose of visit
- Guest message
- Total booking value
- Request submission date

**Available Actions:**
- Accept booking request
- Decline booking request with optional message
- View guest profile
- View full property details

### 2. Status Filters

Filter bookings by status:
- **All Bookings** - View all requests regardless of status
- **Pending** - Requests awaiting host response
- **Confirmed** - Accepted bookings
- **Rejected** - Declined requests

### 3. Multi-Property Management

For hosts with multiple properties:
- Switch between properties using dropdown
- View aggregated statistics across all properties
- Property-specific booking history
- Performance metrics per property

## Booking Response Flow

### Accepting a Booking

1. Host reviews booking request details
2. Clicks "Accept" button on booking card
3. Confirmation dialog appears
4. Optional: Add welcome message to guest
5. Backend updates booking status to "confirmed"
6. Guest receives notification (future feature)
7. Booking appears in "Confirmed" tab
8. Calendar automatically updated with blocked dates

### Declining a Booking

1. Host reviews booking request
2. Clicks "Decline" button
3. Modal opens requesting decline reason
4. Host provides explanation (required)
5. Backend updates status to "rejected"
6. Guest receives notification with reason
7. Booking moves to "Rejected" tab
8. Dates remain available for other guests

## Dashboard Statistics

### Booking Metrics

- **Total Requests** - All-time booking requests received
- **Pending Requests** - Awaiting host response
- **Acceptance Rate** - Percentage of confirmed vs total requests
- **Average Response Time** - Time to respond to requests
- **Upcoming Stays** - Number of confirmed future bookings
- **Monthly Revenue** - Total booking value for current month

### Performance Indicators

- **Response Rate** - Percentage of requests responded to
- **Listing Views** - Property page views
- **Conversion Rate** - Bookings / views ratio
- **Guest Satisfaction** - Average review rating (future)

## Technical Implementation

### Data Enrichment

The host bookings API enriches each booking with:

```typescript
{
  // Core booking data
  id: number,
  status: 'pending' | 'confirmed' | 'rejected',
  checkInDate: Date,
  checkOutDate: Date,
  guestCount: number,
  totalPrice: number,
  
  // Enriched property data
  propertyTitle: string,
  propertyLocation: string,
  propertyImage: string,
  
  // Enriched guest data
  guestName: string,
  guestEmail: string,
  guestAvatar: string | null,
  
  // Calculated fields
  nights: number,
  
  // Full objects for navigation
  hostHome: {
    id: number,
    title: string,
    location: string,
    photos: string[],
    pricePerNight: number,
  }
}
```

### API Endpoints

**Get Host Bookings**
```
GET /api/bookings?role=host
Response: {
  success: true,
  bookings: EnrichedBooking[]
}
```

**Respond to Booking**
```
PATCH /api/bookings/:id/respond
Request Body: {
  status: 'confirmed' | 'rejected',
  hostResponse?: string
}
Response: {
  success: true,
  booking: UpdatedBooking,
  message: string
}
```

### Storage Interface

```typescript
interface IStorage {
  // Get all bookings for a specific host
  getBookingsByHost(userId: number): Promise<Booking[]>;
  
  // Get bookings for specific property
  getBookingsByProperty(hostHomeId: number): Promise<Booking[]>;
  
  // Update booking status
  updateBookingStatus(
    bookingId: number,
    status: 'confirmed' | 'rejected',
    hostResponse?: string
  ): Promise<Booking>;
  
  // Get host's properties
  getHostHomesByUser(userId: number): Promise<HostHome[]>;
}
```

## Host Calendar Integration

The dashboard integrates with the visual booking calendar:
- **Calendar View** button navigates to `/host-calendar`
- Shows all confirmed bookings on interactive calendar
- Blocks out unavailable dates
- Color-coded by booking status
- Monthly and weekly views available

## Best Practices for Hosts

### Response Time
- Respond to requests within 24 hours
- Quick responses improve search ranking
- Auto-decline after 72 hours (future feature)

### Communication
- Provide clear decline reasons
- Include helpful welcome messages
- Set expectations for check-in/check-out

### Calendar Hygiene
- Keep calendar updated with blocks
- Mark maintenance periods
- Sync with external calendars

### Guest Screening
- Review guest profile and reviews
- Check alignment with house rules
- Verify purpose matches property type

## Notification System (Future)

### Email Notifications
- New booking request received
- Booking request reminder (24h, 48h)
- Booking confirmed by host
- Upcoming check-in reminder
- Guest checkout notification

### In-App Notifications
- Real-time booking request alerts
- Message from guest
- Calendar conflict warnings
- Review submission requests

## Performance Optimization

### Data Loading
- Bookings paginated (20 per page)
- Lazy load booking details
- Cache enriched booking data
- Prefetch guest profiles

### Real-time Updates
- WebSocket connection for instant updates
- Automatic refresh on booking changes
- Optimistic UI updates
- Conflict resolution for simultaneous actions

## Access Control

### Authorization
- Only property owner can view bookings
- Host must be verified to receive bookings
- Multi-host properties use role-based access
- Admin override for support escalations

### Data Privacy
- Guest contact info revealed only after acceptance
- Personal messages encrypted
- Booking history private to host/guest
- Analytics anonymized

## Future Enhancements

1. **Bulk Actions** - Accept/decline multiple requests
2. **Smart Pricing** - Dynamic pricing suggestions
3. **Auto-Accept** - Automatic acceptance based on criteria
4. **Guest Screening Scores** - AI-powered risk assessment
5. **Revenue Forecasting** - Projected earnings
6. **Competitor Analysis** - Market rate comparisons
7. **Performance Tips** - AI suggestions for improving listings
8. **Export to CSV** - Booking history download

## See Also

- [Booking System](./booking-system.md) - Guest booking journey
- [Calendar System](./calendar-system.md) - Visual calendar management
- [Bookings API Reference](./bookings-api.md) - Complete API docs
- [Housing Marketplace](./housing/index.md) - Property listings
