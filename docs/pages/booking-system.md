# Housing Booking System

## Overview

The housing booking system provides a complete guest journey from property discovery through booking request management. It integrates with the Mundo Tango community platform to enable tango dancers to find and book accommodations with local hosts.

## Complete Guest Journey

### 1. Property Discovery

**Entry Points:**
- **Main Marketplace** (`/housing`) - Browse all available properties
- **Group Housing Tab** (`/groups/:groupId/housing`) - City-specific housing for group members

**Features:**
- Inline Airbnb-style search filters
- Real-time filtering by city, price range, room type, guest capacity
- Friend filter for seeing friends' properties
- Map view with property markers
- Statistics cards showing total listings, average price, available properties

### 2. Property Details

Navigate to listing detail page (`/listing/:id`) to view:
- Photo gallery (up to 10 photos)
- Full property description and amenities
- House rules and host information
- Location on interactive map
- Availability calendar
- Pricing information

### 3. Booking Request

**Form Fields:**
- Check-in date (calendar picker)
- Check-out date (calendar picker)
- Number of guests (dropdown)
- Purpose of visit (dropdown with tango-specific options)
- Personal message to host
- House rules acknowledgment checkbox

**Validation:**
- Check-in date must be in the future
- Check-out must be after check-in
- Guest count must be within property limits
- All required fields must be completed
- House rules must be acknowledged

**Price Calculation:**
- Automatically calculates number of nights
- Displays total price (nights × price per night)
- Shows pricing breakdown

### 4. My Bookings

View and manage all booking requests at `/my-bookings`:

**Booking Card Information:**
- Property title and image
- Status badge (pending/confirmed/rejected)
- Location (city, country)
- Check-in and check-out dates
- Number of nights
- Number of guests
- Purpose of visit
- Guest message to host
- Total price
- Request submission date

**Available Actions:**
- Cancel pending requests
- View booking details
- Contact host (future feature)

## Data Flow

### Booking Creation

1. User fills out booking form on listing detail page
2. Form validation ensures all required fields are complete
3. Frontend sends POST request to `/api/bookings`
4. Backend validates request with Zod schema
5. Backend calculates total price (nights × price per night)
6. Booking record created with status "pending"
7. User redirected to My Bookings page
8. Success toast notification shown

### Booking Retrieval

1. Frontend requests GET `/api/bookings?role=guest`
2. Backend queries bookings by user ID
3. Backend enriches each booking with:
   - Property details (title, location, photos)
   - Guest information (name, email, avatar)
   - Calculated nights count
   - Full hostHome object for navigation
4. Frontend displays enriched bookings in card layout

## Guest Preferences

The system persists guest travel preferences for streamlined repeat bookings:

**Stored Preferences:**
- Preferred room type (private room, shared room, entire place)
- Preferred visit purposes
- Average stay duration
- Typical guest count
- Budget range

**Auto-fill Behavior:**
- Guest preferences automatically populate booking form
- User can override for specific bookings
- Preferences updated based on booking history

## Status Workflow

### Booking Statuses

1. **Pending** - Initial state when booking request submitted
2. **Confirmed** - Host accepted the booking request
3. **Rejected** - Host declined the booking request
4. **Cancelled** - Guest cancelled the request

### Status Transitions

```
pending → confirmed (host accepts)
pending → rejected (host declines)
pending → cancelled (guest cancels)
```

## Technical Implementation

### Schema

```typescript
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => users.id),
  hostHomeId: integer("host_home_id").notNull().references(() => hostHomes.id),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  purpose: varchar("purpose", { length: 100 }),
  message: text("message"),
  hasReadRules: boolean("has_read_rules").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  hostResponse: text("host_response"),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});
```

### API Endpoints

**Create Booking**
```
POST /api/bookings
Request Body: {
  hostHomeId: number,
  checkInDate: string (ISO),
  checkOutDate: string (ISO),
  guestCount: number,
  purpose: string,
  message: string,
  hasReadRules: boolean
}
Response: { success: true, booking: Booking, message: string }
```

**Get Bookings**
```
GET /api/bookings?role=guest
Response: {
  success: true,
  bookings: EnrichedBooking[]
}

EnrichedBooking includes:
- All booking fields
- propertyTitle, propertyLocation, propertyImage
- guestName, guestEmail, guestAvatar
- nights (calculated)
- hostHome (full object)
```

## Future Enhancements

1. **Real-time Notifications** - Notify guests when host responds
2. **Host Messaging** - In-app messaging between guest and host
3. **Calendar Sync** - Export bookings to Google Calendar, iCal
4. **Review System** - Guest reviews of properties after stay
5. **Payment Integration** - Stripe payment processing for confirmed bookings
6. **Booking Modifications** - Allow guests to request date changes
7. **Automatic Reminders** - Email reminders before check-in
8. **Cancellation Policy** - Configurable cancellation windows and refunds

## See Also

- [Host Dashboard](./host-dashboard.md) - Managing incoming booking requests
- [Calendar System](./calendar-system.md) - Visual booking calendar
- [Bookings API Reference](./bookings-api.md) - Complete API documentation
- [Housing Marketplace](./housing/index.md) - Property discovery and search
