# Mundo Tango Google Maps API Guide
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Platform:** Google Maps Platform  
**Status:** ⚠️ Integration in progress

## Overview

Mundo Tango will use **Google Maps API** for location-based features including event locations, city group mapping, travel planning, and milonga discovery. This guide covers integration patterns for production deployment.

**Status:** ⚠️ Planned for production (not yet implemented)

---

## Configuration

### **Environment Variables**

```bash
# .env
GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_MAPS_ENABLE=true

# Frontend (.env or public config)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...  # Restricted to domain
```

---

## Installation

```bash
npm install @googlemaps/js-api-loader
```

---

## Frontend Integration

### **Pattern 1: Map Component**

```typescript
// client/src/components/GoogleMap.tsx
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; title: string }>;
}

export function GoogleMap({ center, zoom = 12, markers = [] }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const googleMap = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            // MT Ocean theme (teal/cyan)
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0ea5e9' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        setMap(googleMap);
      }
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    // Add markers
    markers.forEach(marker => {
      new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title,
      });
    });
  }, [map, markers]);

  return <div ref={mapRef} className="w-full h-96 rounded-lg" />;
}
```

---

### **Pattern 2: Event Location Picker**

```typescript
import { useState } from 'react';
import { GoogleMap } from '@/components/GoogleMap';
import { Input } from '@/components/ui/input';

function EventLocationPicker() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState('');

  const handlePlaceSelect = async (placeId: string) => {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ placeId });

    const place = result.results[0];
    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
    setAddress(place.formatted_address);
  };

  return (
    <div>
      <PlacesAutocomplete
        onSelect={handlePlaceSelect}
        placeholder="Search for event location"
      />
      
      <GoogleMap
        center={location}
        markers={[{ ...location, title: address }]}
      />
    </div>
  );
}
```

---

### **Pattern 3: Places Autocomplete**

```typescript
import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface PlacesAutocompleteProps {
  onSelect: (placeId: string) => void;
  placeholder?: string;
}

export function PlacesAutocomplete({ onSelect, placeholder }: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: ['ar', 'uy', 'fr', 'de', 'us'] }, // Tango countries
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.place_id) {
        onSelect(place.place_id);
      }
    });
  }, [onSelect]);

  return (
    <Input
      ref={inputRef}
      placeholder={placeholder || 'Search for a location'}
      data-testid="input-place-autocomplete"
    />
  );
}
```

---

## Backend Integration

### **Pattern 1: Geocoding (Address → Coordinates)**

```typescript
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

async function geocodeAddress(address: string) {
  const response = await mapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  if (response.data.results.length === 0) {
    throw new Error('Address not found');
  }

  const result = response.data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
}

// Usage
app.post('/api/events', authMiddleware, async (req, res) => {
  const { address, ...eventData } = req.body;

  // Geocode address
  const location = await geocodeAddress(address);

  const [event] = await db.insert(events).values({
    ...eventData,
    lat: location.lat,
    lng: location.lng,
    address: location.formattedAddress,
    placeId: location.placeId,
  }).returning();

  res.json(apiSuccess({ data: event }));
});
```

---

### **Pattern 2: Reverse Geocoding (Coordinates → Address)**

```typescript
async function reverseGeocode(lat: number, lng: number) {
  const response = await mapsClient.reverseGeocode({
    params: {
      latlng: { lat, lng },
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  const result = response.data.results[0];
  return {
    formattedAddress: result.formatted_address,
    city: result.address_components.find(c => c.types.includes('locality'))?.long_name,
    country: result.address_components.find(c => c.types.includes('country'))?.long_name,
  };
}
```

---

### **Pattern 3: Distance Matrix (Event Distance)**

```typescript
async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const response = await mapsClient.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: [`${destination.lat},${destination.lng}`],
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  const element = response.data.rows[0].elements[0];
  return {
    distance: element.distance.value, // meters
    duration: element.duration.value, // seconds
    distanceText: element.distance.text, // "5.2 km"
    durationText: element.duration.text, // "15 mins"
  };
}

// Usage: Find nearby events
app.get('/api/events/nearby', authMiddleware, async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query; // radius in meters

  const events = await db.query.events.findMany();

  const nearbyEvents = await Promise.all(
    events.map(async event => {
      const distance = await calculateDistance(
        { lat: Number(lat), lng: Number(lng) },
        { lat: event.lat, lng: event.lng }
      );

      return {
        ...event,
        distance: distance.distance,
        distanceText: distance.distanceText,
      };
    })
  );

  const filtered = nearbyEvents
    .filter(e => e.distance <= Number(radius))
    .sort((a, b) => a.distance - b.distance);

  res.json(apiSuccess({ data: filtered }));
});
```

---

## Use Cases

### **1. City Group Auto-Assignment**

```typescript
// Assign user to city group based on location
async function assignCityGroup(userId: number, lat: number, lng: number) {
  const location = await reverseGeocode(lat, lng);

  const cityGroup = await db.query.groups.findFirst({
    where: eq(groups.city, location.city),
  });

  if (cityGroup) {
    await db.insert(groupMembers).values({
      groupId: cityGroup.id,
      userId,
    });
  }
}
```

---

### **2. Milonga Discovery Map**

```typescript
// Show all milongas on map
function MilongaMap() {
  const { data: milongas } = useQuery({
    queryKey: ['/api/events/milongas'],
  });

  const markers = milongas?.map(m => ({
    lat: m.lat,
    lng: m.lng,
    title: m.name,
  }));

  return <GoogleMap center={{ lat: -34.6037, lng: -58.3816 }} markers={markers} />;
}
```

---

### **3. Travel Planning**

```typescript
// Route between multiple tango events
async function planTangoRoute(eventIds: number[]) {
  const events = await db.query.events.findMany({
    where: inArray(events.id, eventIds),
  });

  const waypoints = events.map(e => ({
    location: { lat: e.lat, lng: e.lng },
    stopover: true,
  }));

  // Calculate optimal route
  const directionsService = new google.maps.DirectionsService();
  const route = await directionsService.route({
    origin: waypoints[0].location,
    destination: waypoints[waypoints.length - 1].location,
    waypoints: waypoints.slice(1, -1),
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING,
  });

  return route;
}
```

---

## Cost Optimization

### **1. API Key Restrictions**

```bash
# Restrict API key to:
- Specific domains (mundotango.com)
- Specific IP addresses (backend server)
- Specific APIs (Maps JavaScript API, Geocoding API, Places API)
```

### **2. Caching**

```typescript
// Cache geocoding results
const geocodeCache = new Map<string, any>();

async function cachedGeocode(address: string) {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }

  const result = await geocodeAddress(address);
  geocodeCache.set(address, result);

  return result;
}
```

---

## Next Steps

1. Create Google Cloud Project: https://console.cloud.google.com
2. Enable Maps JavaScript API, Geocoding API, Places API
3. Create API key and restrict usage
4. Implement map components
5. Test location-based features

**Related Files:**
- `client/src/components/GoogleMap.tsx` - Map component (to be created)
- `server/services/maps.ts` - Maps service (to be created)
- `docs/MT_API_CONVENTIONS.md` - API integration patterns
