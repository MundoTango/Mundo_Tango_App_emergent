# Unified Map Components Reference

## Overview
Comprehensive reference for the unified map infrastructure built on Leaflet.js with automatic geocoding, MT Ocean Theme styling, and shared components across all location-based features.

**Documentation:** `/docs/pages/geocoding-system/`  
**ESA Framework:** Layers 1-61 (Data → UI Integration)  
**Theme:** MT Ocean gradient markers with turquoise-to-blue palette

---

## Core Components

### UnifiedMapBase
**Location:** `client/src/components/maps/UnifiedMapBase.tsx`

Reusable Leaflet map container with consistent configuration, local icon paths, and automatic cleanup.

**Props:**
```typescript
interface UnifiedMapBaseProps {
  center?: [number, number];        // Default: Buenos Aires [-34.6037, -58.3816]
  zoom?: number;                    // Default: 12
  children?: ReactNode;             // Overlays (legend, filters)
  className?: string;               // Default: 'h-full w-full rounded-lg'
  onMapReady?: (map: L.Map) => void;
  fitBounds?: boolean;              // Auto-fit to markers
}
```

**Example:**
```tsx
import UnifiedMapBase from '@/components/maps/UnifiedMapBase';

<UnifiedMapBase 
  center={[40.7128, -74.0060]}
  zoom={10}
  onMapReady={(map) => setMapInstance(map)}
>
  <UnifiedMapLegend items={legendItems} />
</UnifiedMapBase>
```

**Features:**
- ✅ Local Leaflet icons (`/leaflet/`) - no CDN dependency
- ✅ OpenStreetMap tile layer
- ✅ Automatic cleanup on unmount
- ✅ Center/zoom updates without re-initialization
- ✅ testid: `unified-map-container`

---

### UnifiedMapLegend
**Location:** `client/src/components/maps/UnifiedMapLegend.tsx`

MT Ocean Theme gradient legend with color-coded items and count badges.

**Props:**
```typescript
interface UnifiedMapLegendProps {
  items: LegendItem[];
  title?: string;                    // Default: 'Map Legend'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface LegendItem {
  color: string;      // Tailwind color (e.g., 'purple-600')
  label: string;      // Display text
  count?: number;     // Optional count badge
}
```

**Example:**
```tsx
<UnifiedMapLegend
  title="Locations"
  position="bottom-left"
  items={[
    { color: 'turquoise-500', label: 'Available', count: 12 },
    { color: 'pink-500', label: 'Booked', count: 3 }
  ]}
/>
```

**Styling:**
- Glassmorphic background with backdrop blur
- MT Ocean gradient border
- Responsive positioning
- Auto-hide on mobile (optional)

---

### EventMap
**Location:** `client/src/components/EventMap.tsx`

Ready-to-use event location map with purple gradient markers and popup details.

**Props:**
```typescript
interface EventMapProps {
  events: Event[];
  cityLat?: number;
  cityLng?: number;
  onEventClick?: (event: Event) => void;
}
```

**Event Type:**
```typescript
{
  id: number;
  title: string;
  startDate: string;
  location: string;
  latitude: string;   // Parse as float: parseFloat(event.latitude)
  longitude: string;  // Parse as float: parseFloat(event.longitude)
  attendeeCount?: number;
}
```

**Features:**
- 🎨 Purple gradient markers (MAP_COLORS.event)
- 📅 Calendar icon with event date/time
- 📍 Location display
- 👥 Attendee count
- 🔗 "View Details" button (optional)
- 🗺️ Auto-fit bounds to show all events

**Example:**
```tsx
import EventMap from '@/components/EventMap';

<EventMap 
  events={filteredEvents}
  cityLat={group?.latitude}
  cityLng={group?.longitude}
  onEventClick={(event) => navigate(`/events/${event.id}`)}
/>
```

---

### HousingMap
**Location:** `client/src/components/maps/HousingMap.tsx`

Ready-to-use housing listings map with turquoise gradient markers.

**Props:**
```typescript
interface HousingMapProps {
  homes: HostHome[];
  cityLat?: number;
  cityLng?: number;
  onHomeClick?: (home: HostHome) => void;
}
```

**HostHome Type:**
```typescript
{
  id: number;
  title: string;
  address: string;
  city: string;
  lat: number;        // Already numeric (REAL type)
  lng: number;        // Already numeric (REAL type)
  pricePerNight: number;
  maxGuests: number;
  host?: {
    firstName: string;
    lastName: string;
  };
}
```

**Features:**
- 🏠 Turquoise gradient markers (MAP_COLORS.housing)
- 💰 Price per night display
- 👥 Guest capacity
- 🏡 Host information
- 🔗 "View Details" button
- 🗺️ Auto-fit bounds

---

### WorldMap (Tango Communities)
**Location:** `client/src/components/Community/WorldMap.tsx`

Global tango community map with city group markers and statistics.

**Props:**
```typescript
interface WorldMapProps {
  groups: CityGroup[];
  onCityClick?: (group: CityGroup) => void;
}
```

**Features:**
- 🌍 Global view (centered on Buenos Aires)
- 🎨 Cyan gradient markers (MAP_COLORS.community)
- 📊 Member count, event count, host count
- 🔍 City search functionality
- 📈 Real-time statistics

---

## Hooks

### useMapMarkers()
**Location:** `client/src/components/maps/UnifiedMapBase.tsx`

Manages marker lifecycle with proper cleanup and bounds fitting.

```typescript
const {
  markers,              // L.Marker[] - Current markers
  addMarker,           // (marker: L.Marker) => void
  removeMarker,        // (marker: L.Marker) => void
  clearMarkers,        // () => void
  fitBoundsToMarkers,  // (map: L.Map, padding?: number) => void
} = useMapMarkers();
```

**Usage Pattern:**
```tsx
const [map, setMap] = useState<L.Map | null>(null);
const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

useEffect(() => {
  if (!map) return;
  
  clearMarkers();  // Remove old markers
  
  items.forEach(item => {
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(map);
    addMarker(marker);  // Track for cleanup
  });
  
  fitBoundsToMarkers(map, 0.1);  // Auto-zoom
}, [items, map]);
```

---

### useMapFilters()
**Location:** `client/src/hooks/useMapFilters.ts`

Shared filter state management for map views.

**Generic Hook:**
```typescript
const {
  filters,
  setFilters,
  applyFilters,
  clearFilters,
  activeFilterCount
} = useMapFilters<T>();
```

**Preset Hooks:**
```typescript
// Events
const { filters, setFilters, applyFilters } = useEventMapFilters();

// Housing
const { filters, setFilters, applyFilters } = useHousingMapFilters();

// Community
const { filters, setFilters, applyFilters } = useCommunityMapFilters();
```

---

## Utilities

### leafletConfig.ts
**Location:** `client/src/utils/leafletConfig.ts`

Central configuration for all Leaflet maps.

**Functions:**

#### initializeLeaflet()
```typescript
initializeLeaflet(): void
```
Configures Leaflet to use local icon files. Called automatically by UnifiedMapBase.

#### createCustomMarker()
```typescript
createCustomMarker(color: string, iconSvgPath: string): L.DivIcon
```

Creates MT Ocean gradient markers.

**Parameters:**
- `color` - Tailwind color class (e.g., 'purple-600')
- `iconSvgPath` - SVG path from MARKER_ICONS

**Example:**
```typescript
const eventIcon = createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar);
const marker = L.marker([lat, lng], { icon: eventIcon });
```

**Available Icons:**
```typescript
MARKER_ICONS = {
  calendar,   // Events
  home,       // Housing
  users,      // Community
  mapPin,     // General location
  star,       // Featured/Recommendations
}
```

**Available Colors:**
```typescript
MAP_COLORS = {
  event: 'purple-600',
  housing: 'turquoise-500',
  community: 'cyan-500',
  recommendation: 'pink-500',
}
```

---

## Filter Components

### EventMapFilters
**Location:** `client/src/components/maps/EventMapFilters.tsx`

Pre-built event filtering UI.

**Props:**
```typescript
interface EventMapFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  compact?: boolean;  // Popover mode
}
```

**Filters:**
```typescript
{
  eventType: 'all' | 'milonga' | 'practica' | 'workshop' | 'festival',
  startDate: Date | null,
  endDate: Date | null,
  hasSpace: boolean
}
```

---

### HousingMapFilters
**Location:** `client/src/components/maps/HousingMapFilters.tsx`

Pre-built housing filtering UI.

**Filters:**
```typescript
{
  priceRange: { min: number, max: number },
  minGuests: number,
  amenities: string[]
}
```

---

## Common Patterns

### 1. Map with Toggle View
```tsx
const [view, setView] = useState<'list' | 'map'>('list');

<Tabs value={view} onValueChange={setView}>
  <TabsList>
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="map">Map</TabsTrigger>
  </TabsList>
  
  <TabsContent value="list">
    <ListingGrid items={items} />
  </TabsContent>
  
  <TabsContent value="map">
    <EventMap events={items} />
  </TabsContent>
</Tabs>
```

### 2. Map with Filters
```tsx
const { filters, setFilters, applyFilters } = useEventMapFilters();
const filteredEvents = applyFilters(events);

return (
  <>
    <EventMapFilters filters={filters} onFiltersChange={setFilters} />
    <EventMap events={filteredEvents} />
  </>
);
```

### 3. Multi-Entity Map
```tsx
const [map, setMap] = useState(null);
const { clearMarkers, addMarker } = useMapMarkers();

useEffect(() => {
  if (!map) return;
  clearMarkers();
  
  events.forEach(event => {
    const marker = L.marker([event.lat, event.lng], {
      icon: createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar)
    }).addTo(map);
    addMarker(marker);
  });
  
  homes.forEach(home => {
    const marker = L.marker([home.lat, home.lng], {
      icon: createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home)
    }).addTo(map);
    addMarker(marker);
  });
}, [events, homes, map]);
```

---

## Geocoding Integration

### Automatic Geocoding Service
**Service:** `server/services/cityAutoCreationService.ts`

All entities can be automatically geocoded on creation/update:

```typescript
import { CityAutoCreationService } from '../services/cityAutoCreationService';

const coords = await CityAutoCreationService.geocodeEventLocation(
  city,
  location,
  address
);

if (coords) {
  // Store coordinates
  await db.insert(entity).values({
    ...data,
    latitude: coords.latitude,
    longitude: coords.longitude
  });
}
```

**Features:**
- OpenStreetMap Nominatim API (free, no key required)
- 24-hour caching
- 2 requests/second rate limiting
- Graceful error handling

**See:** `/docs/pages/geocoding-system/api-reference.md`

---

## Troubleshooting

### Markers Not Appearing
1. Check coordinates are valid numbers
2. Parse string coordinates: `parseFloat(event.latitude)`
3. Verify Leaflet icons exist in `public/leaflet/`
4. Check browser console for errors

### Map Not Centering
```typescript
useEffect(() => {
  if (map && markers.length > 0) {
    fitBoundsToMarkers(map, 0.1);  // 10% padding
  }
}, [map, markers]);
```

### Icons Loading from CDN
Check initialization:
```typescript
import { initializeLeaflet } from '@/utils/leafletConfig';
initializeLeaflet();  // Sets local icon paths
```

---

## Testing

### Test IDs
All map components include testids:
```typescript
data-testid="unified-map-container"
data-testid="map-legend"
data-testid="event-marker-{id}"
data-testid="housing-marker-{id}"
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('map displays events correctly', async ({ page }) => {
  await page.goto('/group/1');
  await page.click('[data-testid="tab-map"]');
  
  const map = page.locator('[data-testid="unified-map-container"]');
  await expect(map).toBeVisible();
  
  const markers = page.locator('[data-testid^="event-marker-"]');
  await expect(markers).toHaveCount(10);
});
```

---

## Performance

### Metrics
- Map initialization: < 500ms
- Marker rendering (100 items): < 1s
- Filter application: < 100ms
- Bounds fitting: < 200ms

### Optimization Tips
1. Use marker clustering for 100+ items
2. Implement virtual scrolling for large datasets
3. Debounce filter changes
4. Lazy load map on tab switch

---

## Related Documentation
- [Geocoding System Overview](/docs/pages/geocoding-system/index.md)
- [Geocoding API Reference](/docs/pages/geocoding-system/api-reference.md)
- [Map Components Usage Guide](/docs/pages/geocoding-system/map-components.md)
- [ESA Framework](/docs/ESA.md)

---

*Last Updated: October 2025*  
*Version: 1.0.0*  
*Owner: Maps & Location Team*
