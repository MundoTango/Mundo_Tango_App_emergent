# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 28: Location Agent
**Division:** Core Layer | **Category:** Geolocation  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** Location Data & Geocoding Management  
**Responsibility:** Geocode addresses, reverse geocoding, location-based search, distance calculations

**Core Operations:**
```typescript
// Geocode address (Google Maps API)
async function geocodeAddress(address: string) {
  const response = await mapsClient.geocode({
    params: { address, key: process.env.GOOGLE_MAPS_API_KEY! },
  });

  const result = response.data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
}

// Find nearby events
async function findNearbyEvents(lat: number, lng: number, radius: number = 50000) {
  // Simplified distance calculation
  const events = await db.query.events.findMany({
    where: eq(events.isActive, true),
  });

  return events.filter(event => {
    const distance = calculateDistance(lat, lng, event.lat, event.lng);
    return distance <= radius;
  });
}

// Calculate distance (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
```

**Features:** Geocoding, reverse geocoding, location search, distance calculations, city detection  
**Related:** Layer 18 (Event), Layer 24 (Group), Google Maps API
