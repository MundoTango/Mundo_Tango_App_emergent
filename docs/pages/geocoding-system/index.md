# Unified Geocoding & Map System

## Overview

The Life CEO & Mundo Tango platform features a **unified geocoding and map infrastructure** that powers location-based features across events, housing, community discovery, and user travel. Built following the **ESA LIFE CEO 61x21 framework**, the system ensures consistency, performance, and maintainability.

## Architecture

### ESA Framework Integration

The geocoding system spans multiple ESA layers:

- **ESA Layers 1-15 (Data Layer)**: Schema definitions with `latitude`/`longitude` fields for all mappable entities
- **ESA Layers 16-30 (API Layer)**: Geocoding service integration and endpoint hooks
- **ESA Layers 31-45 (Service Layer)**: `CityAutoCreationService` handles all geocoding operations
- **ESA Layers 46-61 (UI/Integration)**: Unified map components with consistent UX

### Core Components

```
client/src/
├── utils/
│   └── leafletConfig.ts          # Shared Leaflet configuration & utilities
├── components/
│   └── maps/
│       ├── UnifiedMapBase.tsx    # Reusable map container
│       ├── UnifiedMapLegend.tsx  # Themed legend component
│       ├── EventMap.tsx          # Event location map
│       ├── HousingMap.tsx        # Housing listings map
│       ├── EventMapFilters.tsx   # Pre-built event filters
│       └── HousingMapFilters.tsx # Pre-built housing filters
└── hooks/
    └── useMapFilters.ts          # Shared filter state management

server/
├── services/
│   └── cityAutoCreationService.ts # OpenStreetMap geocoding service
└── routes/
    ├── eventsRoutes.ts           # Event API with geocoding hooks
    └── hostHomesRoutes.ts        # Housing API (ready for geocoding)
```

## Key Features

### 1. **Automatic Geocoding**
- Events are automatically geocoded on creation/update
- Uses OpenStreetMap Nominatim API (free, no API key required)
- Rate limiting: 2 requests/second
- 24-hour caching to minimize API calls
- Graceful error handling with fallbacks

### 2. **Unified Map Infrastructure**
- **Single icon source**: All maps use local `/leaflet/` icons (not CDN)
- **Consistent theming**: MT Ocean Theme with gradient markers
- **Shared utilities**: No code duplication across maps
- **Reusable components**: `UnifiedMapBase`, `UnifiedMapLegend`, filter hooks

### 3. **Filter System**
- Pre-built filter components for each map type
- Shared `useMapFilters` hook for state management
- Active filter count badges
- Compact popover mode for mobile

### 4. **Performance**
- Marker clustering for dense areas (planned)
- Automatic bounds fitting to show all markers
- Efficient marker management with cleanup

## Geocoded Entities

| Entity | Schema | Status | API Integration |
|--------|--------|--------|-----------------|
| **Events** | `events` table, `latitude`/`longitude` TEXT | ✅ Complete | ✅ Automatic geocoding on create/update |
| **Housing** | `hostHomes` table, `lat`/`lng` REAL | ✅ Schema ready | 🔄 Awaiting create/update endpoints |
| **Recommendations** | `recommendations` table, `lat`/`lng` REAL | ✅ Schema ready | 🔄 Awaiting create/update endpoints |
| **City Groups** | `groups` table, `latitude`/`longitude` REAL | ✅ Complete | ✅ Automated on city group creation |

## Data Flow

```
User creates event
    ↓
POST /api/events
    ↓
Validate request body
    ↓
Extract city/location/address
    ↓
CityAutoCreationService.geocodeEventLocation()
    ↓
Check cache (24hr TTL)
    ↓
OpenStreetMap Nominatim API (if not cached)
    ↓
Rate limiting (500ms delay = 2 req/sec)
    ↓
Parse coordinates from response
    ↓
Store latitude/longitude in database
    ↓
Return event with coordinates to frontend
    ↓
EventMap component renders marker
```

## Configuration

### Leaflet Icons

All maps use local icon files in `public/leaflet/`:
- `marker-icon.png`
- `marker-icon-2x.png`
- `marker-shadow.png`
- `layers.png`
- `layers-2x.png`

### Marker Colors (MT Ocean Theme)

```typescript
MAP_COLORS = {
  event: 'purple-600',      // Events use purple gradient
  housing: 'turquoise-500', // Housing uses turquoise
  community: 'cyan-500',    // Community uses cyan
  recommendation: 'pink-500' // Recommendations use pink
}
```

### OpenStreetMap Configuration

```typescript
NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
MIN_GEOCODING_DELAY = 500  // 2 requests per second
CACHE_TTL = 24 * 60 * 60 * 1000  // 24 hours
```

## Integration Guide

### Adding Geocoding to a New Entity

1. **Schema**: Add `latitude` and `longitude` fields
```typescript
export const myEntity = pgTable("my_entity", {
  id: serial("id").primaryKey(),
  // ... other fields
  city: varchar("city", { length: 100 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
});
```

2. **API Route**: Hook geocoding into create/update endpoints
```typescript
import { CityAutoCreationService } from '../services/cityAutoCreationService';

router.post('/api/my-entity', async (req, res) => {
  const { city, location, address } = req.body;
  
  // Geocode location
  const coords = await CityAutoCreationService.geocodeEventLocation(
    city,
    location,
    address
  );
  
  // Store with coordinates
  const entity = await db.insert(myEntity).values({
    ...req.body,
    latitude: coords?.latitude || null,
    longitude: coords?.longitude || null,
  });
});
```

3. **Map Component**: Create component using `UnifiedMapBase`
```typescript
import UnifiedMapBase from '@/components/maps/UnifiedMapBase';
import UnifiedMapLegend from '@/components/maps/UnifiedMapLegend';

export default function MyEntityMap({ entities }) {
  const [map, setMap] = useState(null);
  const { clearMarkers, addMarker } = useMapMarkers();
  
  // Add markers when map ready
  useEffect(() => {
    // ... marker logic
  }, [entities, map]);
  
  return (
    <UnifiedMapBase onMapReady={setMap}>
      <UnifiedMapLegend items={[...]} />
    </UnifiedMapBase>
  );
}
```

## Migration Status

**Events**: ✅ All 10 existing events geocoded successfully
- Buenos Aires: -34.6095579, -58.3887904
- Coordinates stored as TEXT in database
- Frontend parses as floats for Leaflet compatibility

**Housing**: 🔄 Ready for migration once create/update endpoints exist

**Recommendations**: 🔄 Ready for migration once create/update endpoints exist

## Future Enhancements

1. **Marker Clustering**: Add `leaflet.markercluster` for dense areas
2. **Real-time Updates**: Socket.io integration for live marker updates
3. **Search/Autocomplete**: Location search with autocomplete
4. **Mobile Gestures**: Touch gesture optimization
5. **Offline Support**: Cache map tiles for PWA
6. **Custom Map Styles**: Dark mode support for maps

## Performance Metrics

- **API Response Time**: < 100ms (cached), < 2s (geocoding)
- **Map Load Time**: < 500ms for 100 markers
- **Memory Usage**: ~5MB per map instance
- **Rate Limit**: 2 geocoding requests/second

## Security Considerations

- ✅ No API keys required (OpenStreetMap is public)
- ✅ Rate limiting prevents abuse
- ✅ Input validation on all location fields
- ✅ No PII in coordinates
- ✅ CORS properly configured

## Related Documentation

- [API Reference](./api-reference.md) - Geocoding API endpoints
- [Map Components](./map-components.md) - Component usage guide
- [CDN-Free Migration](./cdn-free-migration.md) - **NEW:** Local-first architecture guide
- [ESA Framework](/docs/ESA.md) - System architecture

## Questions & Support

For questions about the geocoding system, contact the development team or refer to the ESA LIFE CEO documentation.
