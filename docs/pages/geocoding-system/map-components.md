# Map Components - Usage Guide

## Overview

This guide explains how to use the unified map components in the Life CEO & Mundo Tango platform. All maps share common infrastructure for consistency and ease of use.

---

## Quick Start

### 1. Basic Map Usage

```typescript
import UnifiedMapBase from '@/components/maps/UnifiedMapBase';

export default function MyMap() {
  const [map, setMap] = useState<L.Map | null>(null);
  
  return (
    <UnifiedMapBase 
      center={[-34.6037, -58.3816]}  // Buenos Aires
      zoom={12}
      onMapReady={setMap}
    />
  );
}
```

### 2. Map with Markers

```typescript
import { useEffect, useState } from 'react';
import L from 'leaflet';
import UnifiedMapBase, { useMapMarkers } from '@/components/maps/UnifiedMapBase';
import { createCustomMarker, MARKER_ICONS, MAP_COLORS } from '@/utils/leafletConfig';

export default function EventMap({ events }) {
  const [map, setMap] = useState(null);
  const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

  useEffect(() => {
    if (!map) return;
    
    clearMarkers();
    
    events.forEach(event => {
      if (event.latitude && event.longitude) {
        const icon = createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar);
        const marker = L.marker([event.latitude, event.longitude], { icon }).addTo(map);
        marker.bindPopup(`<h3>${event.title}</h3>`);
        addMarker(marker);
      }
    });
    
    fitBoundsToMarkers(map);
  }, [events, map]);

  return <UnifiedMapBase onMapReady={setMap} />;
}
```

### 3. Map with Legend

```typescript
import UnifiedMapLegend from '@/components/maps/UnifiedMapLegend';

export default function MapWithLegend() {
  return (
    <UnifiedMapBase>
      <UnifiedMapLegend
        title="Event Locations"
        items={[
          { color: MAP_COLORS.event, label: 'Events', count: 5 },
          { color: MAP_COLORS.housing, label: 'Housing', count: 3 }
        ]}
      />
    </UnifiedMapBase>
  );
}
```

### 4. Community Hub Map (Multi-Layer with Filters)

**NEW (Oct 2025)** - Unified map with 3-layer filtering system and icon-matched markers.

```typescript
import CommunityMapWithLayers from '@/components/Community/CommunityMapWithLayers';

export default function CommunityHubTab({ group }) {
  const cityCenter = group.city ? getCoordinatesForCity(group.city) : [-34.6037, -58.3816];
  
  return (
    <div className="h-[900px]">
      <CommunityMapWithLayers
        groupSlug={group.slug}
        city={group.city}
        country={group.country}
        center={cityCenter}
      />
    </div>
  );
}
```

**Features:**
- 3-layer visualization (Events, Housing, Recommendations)
- Icon-matched markers (Calendar/Home/MapPin) with MT Ocean gradients
- Glassmorphic filter bar with 12 filter options
- Real-time API integration
- Aurora Tide design compliance

**See:** `docs/pages/community/journey-community-hub-complete-oct-2025.md` for full implementation details.

---

## Components Reference

### UnifiedMapBase

Reusable Leaflet map container with consistent configuration.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `[number, number]` | `[-34.6037, -58.3816]` | Map center [lat, lng] |
| `zoom` | `number` | `12` | Initial zoom level (1-19) |
| `children` | `ReactNode` | - | Overlays (legend, filters) |
| `className` | `string` | `'h-full w-full rounded-lg'` | Container CSS classes |
| `onMapReady` | `(map: L.Map) => void` | - | Callback when map initialized |
| `fitBounds` | `boolean` | `false` | Auto-fit to markers |

**Example:**

```typescript
<UnifiedMapBase 
  center={[40.7128, -74.0060]}  // New York
  zoom={10}
  onMapReady={(map) => console.log('Map ready!', map)}
  className="h-[500px] rounded-xl border"
>
  <MyCustomLegend />
</UnifiedMapBase>
```

---

### UnifiedMapLegend

Themed legend component for map overlays.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `LegendItem[]` | **required** | Legend items to display |
| `title` | `string` | `'Map Legend'` | Legend title |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Legend position |

**LegendItem Type:**

```typescript
{
  color: string;      // Tailwind color (e.g., 'purple-600')
  label: string;      // Display text
  count?: number;     // Optional count badge
}
```

**Example:**

```typescript
<UnifiedMapLegend
  title="Listings"
  position="bottom-left"
  items={[
    { color: 'turquoise-500', label: 'Available', count: 12 },
    { color: 'pink-500', label: 'Booked', count: 3 }
  ]}
/>
```

---

### EventMap

Ready-to-use event location map.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `Event[]` | ✅ Yes | Array of events with coordinates |
| `cityLat` | `number` | No | Center latitude (defaults to Buenos Aires) |
| `cityLng` | `number` | No | Center longitude |
| `onEventClick` | `(event) => void` | No | Click handler for "View Details" |

**Event Type:**

```typescript
{
  id: number;
  title: string;
  startDate: string;
  location: string;
  latitude: string;   // Parse as float!
  longitude: string;  // Parse as float!
  attendeeCount?: number;
}
```

**Example:**

```typescript
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

Ready-to-use housing listings map.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `homes` | `HostHome[]` | ✅ Yes | Array of housing listings |
| `cityLat` | `number` | No | Center latitude |
| `cityLng` | `number` | No | Center longitude |
| `onHomeClick` | `(home) => void` | No | Click handler for listings |

**HostHome Type:**

```typescript
{
  id: number;
  title: string;
  address: string;
  city: string;
  lat: number;        // Already numeric!
  lng: number;        // Already numeric!
  pricePerNight: number;
  maxGuests: number;
  host?: {
    firstName: string;
    lastName: string;
  };
}
```

**Example:**

```typescript
import HousingMap from '@/components/maps/HousingMap';

<HousingMap 
  homes={homes}
  onHomeClick={(home) => navigate(`/housing/${home.id}`)}
/>
```

---

## Hooks

### useMapMarkers()

Manages marker lifecycle on a map.

**Returns:**

```typescript
{
  markers: L.Marker[];
  addMarker: (marker: L.Marker) => void;
  removeMarker: (marker: L.Marker) => void;
  clearMarkers: () => void;
  fitBoundsToMarkers: (map: L.Map, padding?: number) => void;
}
```

**Example:**

```typescript
const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();

useEffect(() => {
  clearMarkers();  // Remove all markers
  
  items.forEach(item => {
    const marker = L.marker([item.lat, item.lng]).addTo(map);
    addMarker(marker);  // Track for cleanup
  });
  
  fitBoundsToMarkers(map, 0.1);  // Auto-zoom to show all
}, [items, map]);
```

---

### useMapFilters()

Shared filter state management.

**Generic Hook:**

```typescript
const { filters, setFilters, applyFilters, clearFilters } = useMapFilters();
```

**Preset Hooks:**

```typescript
// For events
const { filters, setFilters, applyFilters } = useEventMapFilters();
const filteredEvents = applyFilters(events);

// For housing
const { filters, setFilters, applyFilters } = useHousingMapFilters();
const filteredHomes = applyFilters(homes);
```

**Example:**

```typescript
import { useEventMapFilters } from '@/hooks/useMapFilters';
import EventMapFilters from '@/components/maps/EventMapFilters';

function EventsPage() {
  const { filters, setFilters, applyFilters } = useEventMapFilters();
  const filteredEvents = applyFilters(events);
  
  return (
    <>
      <EventMapFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        compact
      />
      <EventMap events={filteredEvents} />
    </>
  );
}
```

---

## Utilities

### initializeLeaflet()

Configures Leaflet to use local icon files.

```typescript
import { initializeLeaflet } from '@/utils/leafletConfig';

// Call once before using any maps
initializeLeaflet();
```

**Note:** `UnifiedMapBase` calls this automatically.

---

### createCustomMarker(color, iconSvgPath)

Creates a custom gradient marker.

**Parameters:**
- `color` (string): Tailwind color class
- `iconSvgPath` (string): SVG path data

**Example:**

```typescript
import { createCustomMarker, MARKER_ICONS, MAP_COLORS } from '@/utils/leafletConfig';

const eventIcon = createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar);
const housingIcon = createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home);

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

Pre-built event filtering UI.

**Props:**

| Prop | Type | Required |
|------|------|----------|
| `filters` | `EventFilters` | ✅ Yes |
| `onFiltersChange` | `(filters) => void` | ✅ Yes |
| `compact` | `boolean` | No (default: false) |

**Filters:**

```typescript
{
  eventType: 'all' | 'milonga' | 'practica' | 'workshop' | 'festival',
  startDate: Date | null,
  endDate: Date | null,
  hasSpace: boolean
}
```

**Example:**

```typescript
<EventMapFilters 
  filters={filters}
  onFiltersChange={setFilters}
  compact  // Popover mode for mobile
/>
```

---

### HousingMapFilters

Pre-built housing filtering UI.

**Props:**

| Prop | Type | Required |
|------|------|----------|
| `filters` | `HousingFilters` | ✅ Yes |
| `onFiltersChange` | `(filters) => void` | ✅ Yes |
| `compact` | `boolean` | No |

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

### 1. Map with Search

```typescript
function MapWithSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  
  // Filter items by search
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <input 
        type="search" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search locations..."
      />
      <UnifiedMapBase onMapReady={setMap}>
        {/* Render markers for filteredItems */}
      </UnifiedMapBase>
    </>
  );
}
```

### 2. Map with View Toggle (List/Map)

```typescript
function ViewToggleMap() {
  const [view, setView] = useState<'list' | 'map'>('list');
  
  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setView('list')}>List</button>
        <button onClick={() => setView('map')}>Map</button>
      </div>
      
      {view === 'list' ? (
        <div>{/* List view */}</div>
      ) : (
        <EventMap events={events} />
      )}
    </>
  );
}
```

### 3. Multi-Type Map

```typescript
function CombinedMap() {
  const [map, setMap] = useState(null);
  const { clearMarkers, addMarker } = useMapMarkers();
  
  useEffect(() => {
    if (!map) return;
    clearMarkers();
    
    // Add event markers
    events.forEach(event => {
      const marker = L.marker([event.lat, event.lng], {
        icon: createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar)
      }).addTo(map);
      addMarker(marker);
    });
    
    // Add housing markers
    homes.forEach(home => {
      const marker = L.marker([home.lat, home.lng], {
        icon: createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home)
      }).addTo(map);
      addMarker(marker);
    });
  }, [events, homes, map]);
  
  return (
    <UnifiedMapBase onMapReady={setMap}>
      <UnifiedMapLegend items={[
        { color: MAP_COLORS.event, label: 'Events', count: events.length },
        { color: MAP_COLORS.housing, label: 'Housing', count: homes.length }
      ]} />
    </UnifiedMapBase>
  );
}
```

---

## Troubleshooting

### Markers Not Showing

**Problem:** Map displays but no markers appear.

**Solutions:**
1. Check coordinates are valid numbers
2. Parse string coordinates: `parseFloat(event.latitude)`
3. Verify Leaflet icons exist in `public/leaflet/`
4. Check browser console for errors

### Map Not Centering

**Problem:** Map doesn't fit all markers.

**Solution:**

```typescript
useEffect(() => {
  if (map && markers.length > 0) {
    fitBoundsToMarkers(map, 0.1);  // 10% padding
  }
}, [map, markers]);
```

### Icons Loading from CDN

**Problem:** Network errors for marker icons.

**Solution:** Icons should load from `/leaflet/` not CDN. Check:

```typescript
import { initializeLeaflet } from '@/utils/leafletConfig';
initializeLeaflet();  // Sets local paths
```

---

## Best Practices

1. **Always parse coordinates**: `parseFloat()` for string coordinates
2. **Clean up markers**: Use `clearMarkers()` before adding new ones
3. **Test with empty data**: Handle `events.length === 0` gracefully
4. **Use testids**: Add `data-testid` to map containers for testing
5. **Mobile optimization**: Use `compact` mode for filters on small screens

---

## Related Documentation

- [Architecture Overview](./index.md)
- [API Reference](./api-reference.md)
- [ESA Framework](/docs/ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md)
