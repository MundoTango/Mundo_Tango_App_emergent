# Housing Calendar System

## Overview

The housing calendar system provides hosts with a visual interface for managing property availability, viewing bookings, and blocking dates. The calendar displays confirmed bookings, pending requests, and manual blocks in an intuitive monthly/weekly view.

## Features

### Calendar Views

**Monthly View** (Default)
- Full month grid layout
- Color-coded booking indicators
- Quick status identification
- Date navigation controls
- Multi-month scroll

**Weekly View** (Future)
- Detailed 7-day view
- Hour-by-hour breakdown
- Check-in/check-out times
- Cleaning schedule slots

### Booking Indicators

**Color Coding:**
- **Turquoise** - Confirmed bookings
- **Yellow** - Pending requests
- **Gray** - Blocked dates
- **White** - Available dates

**Visual Elements:**
- Booking spans across multiple dates
- Guest name overlay on hover
- Price per night indicator
- Occupancy status dots

### Date Management

**Manual Blocking:**
1. Click on available date
2. Select block reason (maintenance, personal use, etc.)
3. Choose single date or date range
4. Add optional notes
5. Confirm block

**Unblocking:**
1. Click on blocked date
2. View block details
3. Click "Remove Block"
4. Confirm removal

**Editing Bookings:**
- View booking details on click
- Navigate to full booking card
- Cannot edit confirmed bookings directly
- Must cancel and rebook for changes

## Data Integration

### Booking Data Sources

The calendar aggregates data from:
1. **Confirmed Bookings** - From bookings table
2. **Pending Requests** - Upcoming requests
3. **Manual Blocks** - Host-created unavailability
4. **External Syncs** - iCal/Airbnb (future)

### Real-time Updates

- WebSocket integration for live updates
- Automatic refresh on booking changes
- Conflict detection and resolution
- Optimistic UI updates

## Technical Implementation

### Calendar Component Structure

```typescript
interface CalendarEvent {
  id: number;
  type: 'booking' | 'pending' | 'blocked';
  startDate: Date;
  endDate: Date;
  title: string;
  guestName?: string;
  guestCount?: number;
  status: 'confirmed' | 'pending' | 'rejected' | 'blocked';
  price?: number;
  notes?: string;
}

interface CalendarProps {
  propertyId: number;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onBlockDate: (startDate: Date, endDate: Date, reason: string) => void;
  onUnblockDate: (blockId: number) => void;
}
```

### Data Fetching

```typescript
// Fetch calendar events for property
GET /api/host-homes/:propertyId/calendar?month=2025-10

Response: {
  success: true,
  events: CalendarEvent[],
  stats: {
    occupancyRate: number,
    totalNights: number,
    bookedNights: number,
    revenue: number
  }
}
```

### Date Blocking

```typescript
// Create date block
POST /api/host-homes/:propertyId/blocks

Request: {
  startDate: Date,
  endDate: Date,
  reason: string,
  notes?: string
}

Response: {
  success: true,
  block: DateBlock
}

// Remove date block
DELETE /api/host-homes/:propertyId/blocks/:blockId
```

## Calendar Features

### 1. Occupancy Visualization

**Monthly Stats:**
- Occupancy rate percentage
- Total available nights
- Booked nights count
- Revenue for month
- Average nightly rate

**Visual Indicators:**
- Progress bar showing occupancy
- Revenue trend graph
- Comparison to previous month
- Projected earnings

### 2. Multi-Property Calendar

For hosts with multiple properties:
- Side-by-side calendar view
- Property selector dropdown
- Aggregated occupancy stats
- Cross-property conflict detection

### 3. Booking Conflicts

**Conflict Detection:**
- Overlapping booking attempts
- Check-in on checkout day
- Minimum stay requirements
- Buffer days between bookings

**Conflict Resolution:**
- Automatic conflict highlighting
- Suggested alternative dates
- Manual override for hosts
- Guest notification of conflicts

### 4. Cleaning Schedule

**Integration with bookings:**
- Automatic cleaning blocks after checkout
- Configurable cleaning duration
- Cleaning crew assignments
- Status tracking (pending, in-progress, complete)

## Availability Rules

### Minimum Stay Requirements

- Set minimum nights per season
- Weekend vs weekday minimums
- Special event minimums
- Override for trusted guests

### Advance Notice

- Minimum hours before check-in
- Same-day booking settings
- Last-minute booking multiplier
- Instant book vs approval required

### Buffer Times

- Hours between checkout/check-in
- Cleaning time allocation
- Maintenance windows
- Preparation time

## Export and Sync

### iCal Integration (Future)

**Export:**
- Generate iCal URL for property
- Update frequency settings
- Share with external platforms

**Import:**
- Import external calendars
- Auto-block imported bookings
- Conflict resolution rules
- Sync frequency

### Platform Sync (Future)

- **Airbnb Sync** - Two-way calendar sync
- **Booking.com** - Import reservations
- **VRBO** - Export availability
- **Google Calendar** - Personal calendar integration

## Mobile Optimization

### Responsive Design

- Touch-optimized date selection
- Swipe navigation between months
- Pinch-to-zoom for details
- Mobile booking cards

### Progressive Web App

- Offline calendar viewing
- Push notifications for bookings
- Home screen installation
- Background sync

## Performance Optimization

### Data Caching

- Cache calendar events per property
- Redis cache for availability queries
- Invalidation on booking changes
- Prefetch adjacent months

### Lazy Loading

- Load visible month only
- Prefetch next/previous month
- Infinite scroll implementation
- Virtualized list rendering

## Analytics Integration

### Calendar Metrics

- **Peak Seasons** - Identify high-demand periods
- **Low Occupancy** - Find gaps to fill
- **Average Length** - Typical stay duration
- **Day of Week** - Popular check-in days
- **Lead Time** - Booking advance window

### Pricing Optimization

- **Dynamic Pricing** - Adjust rates by demand
- **Seasonal Rates** - Configure seasonal pricing
- **Last-minute Deals** - Fill empty dates
- **Early Bird Discounts** - Incentivize advance bookings

## Accessibility

### Keyboard Navigation

- Arrow keys for date navigation
- Enter to select date
- Escape to close modals
- Tab for focus management

### Screen Readers

- ARIA labels for all dates
- Booking status announcements
- Calendar grid semantics
- Live region updates

## Future Enhancements

1. **Drag-and-Drop Booking Management** - Move bookings visually
2. **Multi-Select Blocking** - Block multiple non-consecutive dates
3. **Recurring Blocks** - Weekly/monthly patterns
4. **Team Calendar** - Multi-user scheduling
5. **Maintenance Tracking** - Property upkeep schedule
6. **Guest Messaging** - Calendar-integrated chat
7. **Financial Calendar** - Payment tracking overlay
8. **Seasonal Theming** - Visual themes by season

## See Also

- [Booking System](./booking-system.md) - Guest booking journey
- [Host Dashboard](./host-dashboard.md) - Managing booking requests
- [Bookings API Reference](./bookings-api.md) - API documentation
- [Housing Marketplace](./housing/index.md) - Property discovery
