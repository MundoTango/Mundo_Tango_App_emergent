# Guest Onboarding - Step 4: Location & Duration

## Overview
**Route:** `/guest-onboarding` (Step 4)  
**Purpose:** Capture preferred neighborhoods and stay duration for housing search  
**ESA Framework Layer:** Layer 8 - User Management & Layer 14 - Geolocation  

## Technical Implementation

### Components Used
- `LocationDurationStep` - Main step component
- `NeighborhoodMap` - Interactive map selector
- `NeighborhoodCards` - Visual neighborhood guides
- `DurationSlider` - Stay length selector
- `ProgressBar` - Visual progress indicator (67% complete)

### API Endpoints
- `GET /api/neighborhoods` - List all neighborhoods
- `GET /api/neighborhoods/:id/info` - Detailed area information
- `POST /api/guest-profile/location` - Save location preferences
- `GET /api/housing/availability` - Check area availability

### Real-time Features
- Interactive map with neighborhood boundaries
- Live availability indicators
- Transit time calculations
- Safety score display
- Popular areas highlighting

### Database Tables
```sql
- guest_preferences (location_data JSONB)
- neighborhoods (boundaries, characteristics)
- area_statistics (safety, pricing, amenities)
- transit_data (subway, bus routes)
```

### User Permissions
- **Public Access:** Yes (guest flow)
- **Authentication:** Optional
- **Geolocation:** Optional enhancement
- **Data Caching:** Neighborhood data cached

## MT Ocean Theme Implementation
```css
- Map with ocean blue overlay
- Neighborhood cards with wave patterns
- Selected areas in turquoise highlight
- Duration slider with gradient track
- Transit icons in coral accent
```

## Test Coverage
**Status:** ✅ Complete  
**Test File:** `tests/e2e/guest/guest-onboarding.e2e.test.ts`  
**Required Tests:** Map interaction, neighborhood selection, duration input

## Known Issues
- Map loading slow on mobile connections
- Some neighborhood descriptions outdated
- Transit data needs real-time updates

## Agent Responsibilities
- **Location Agent:** Provide area insights
- **Safety Agent:** Display safety information
- **Transport Agent:** Calculate commute times

## Integration Points
- Google Maps integration
- Transit API connections
- Safety database queries
- Pricing heat maps
- Event proximity calculations

## Performance Metrics
- Average completion: 65 seconds
- Drop-off rate: 12%
- Map interaction time: 25 seconds average
- Bundle size: 78KB (includes map)

## Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Neighborhoods | Multi-select map | Yes | Min 1, Max 5 |
| Stay Duration | Radio/Slider | Yes | Predefined ranges |
| Arrival Date | Date picker | No | Future dates only |
| Flexibility | Checkbox | No | Date flexibility |

## State Management
```typescript
interface LocationDurationState {
  neighborhoods: string[];
  stayDuration: 'short' | 'medium' | 'long' | 'extended';
  arrivalDate?: Date;
  departureDates?: Date;
  flexibleDates?: boolean;
  mapCenter?: [number, number];
  completedAt?: Date;
}
```

## Neighborhood Data
Popular Buenos Aires neighborhoods:
- **Palermo:** Trendy, parks, nightlife
- **Recoleta:** Elegant, cultural, central
- **San Telmo:** Historic, tango, markets
- **Puerto Madero:** Modern, waterfront, expensive
- **Belgrano:** Residential, quiet, family-friendly

## Duration Options
- **Short:** 1-2 weeks
- **Medium:** 3-4 weeks
- **Long:** 1-3 months
- **Extended:** 3+ months

## Map Features
- Neighborhood boundaries visualization
- Transit stations marked
- Tango venues highlighted
- Safety heat map overlay
- Average pricing indicators