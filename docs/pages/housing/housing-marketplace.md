# Housing Marketplace Documentation

## 1. Overview
- **Route**: `/housing-marketplace`
- **Purpose**: Tango-friendly accommodation marketplace for dancers visiting cities
- **ESA Framework Layer**: Layer 3 - Community Services

## 2. Technical Implementation

### Components
- `client/src/pages/housing-marketplace.tsx` - Main marketplace
- `HousingListingCard` - Property display cards
- `FilterPanel` - Search and filter options
- `MapView` - Map-based property search
- `BookingCalendar` - Availability calendar
- `HostProfile` - Host information display
- `PaymentOptions` - Payment preference display
- `TangoProximity` - Distance to milongas

### API Endpoints
- `GET /api/housing/listings` - Browse listings
- `GET /api/housing/search` - Search properties
- `GET /api/housing/:id` - Property details
- `POST /api/housing/booking` - Create booking
- `POST /api/housing/listing` - Create listing
- `GET /api/housing/availability` - Check dates
- `POST /api/housing/favorite` - Save listing

### Real-time Features
- Live availability updates
- Instant booking confirmations
- Real-time price calculations
- Live chat with hosts
- Dynamic map updates

### Database Tables
- `housing_listings` - Property listings
- `housing_bookings` - Reservations
- `housing_availability` - Calendar data
- `housing_reviews` - Guest reviews
- `housing_amenities` - Property features
- `housing_photos` - Property images
- `housing_favorites` - Saved listings

## 3. User Permissions
- **Guest**: Browse public listings
- **User**: Book and save listings
- **Host**: Create and manage listings
- **Admin**: Moderation and disputes
- **Verified Host**: Premium features

## 4. MT Ocean Theme Implementation
```css
/* Marketplace header gradient */
.marketplace-header {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #0F766E 75%, #155E75 100%);
  padding: 40px;
  border-radius: 16px;
}

/* Listing cards */
.listing-card {
  background: white;
  border: 2px solid rgba(94, 234, 212, 0.2);
  box-shadow: 0 4px 12px rgba(94, 234, 212, 0.1);
  transition: all 0.3s ease;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(94, 234, 212, 0.2);
  border-color: #5EEAD4;
}

/* Price badge */
.price-badge {
  background: linear-gradient(45deg, #14B8A6, #0D9488);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
}

/* Tango proximity indicator */
.tango-proximity {
  background: rgba(94, 234, 212, 0.1);
  border-left: 3px solid #5EEAD4;
  padding: 10px;
  border-radius: 4px;
}
```

## 5. Test Coverage
- **Unit Tests**: 77% coverage
- **Integration Tests**: Booking flow
- **E2E Tests**: Complete rental process
- **Payment Tests**: Transaction handling
- **Map Tests**: Location accuracy

## 6. Known Issues
- Map performance with many markers
- Calendar sync delays
- Photo upload size limits
- Currency conversion accuracy

## 7. Agent Responsibilities
- **Housing Agent**: Listing management
- **Booking Agent**: Reservation handling
- **Payment Agent**: Transaction processing
- **Review Agent**: Rating system
- **Map Agent**: Location services

## 8. Integration Points
- **Maps Service**: Property locations
- **Payment Gateway**: Booking payments
- **Calendar Service**: Availability sync
- **Messaging Service**: Host-guest chat
- **Review Service**: Rating system
- **Currency API**: Exchange rates

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Search Results**: < 1 second
- **Map Render**: < 1.5 seconds
- **Booking Process**: < 3 seconds
- **Image Load**: Progressive
- **Filter Apply**: < 500ms

## 10. Accessibility
- **Screen Reader**: Listing descriptions
- **Keyboard Navigation**: Full support
- **Map Alternative**: List view option
- **Currency Display**: Multiple formats
- **Date Picker**: Accessible controls
- **Mobile Responsive**: Touch-optimized