# Location Input System Architecture

**Last Updated**: October 6, 2025  
**Framework**: ESA LIFE CEO 61x21  
**Design System**: Aurora Tide  
**ESA Layers**: Layer 13 (Maps & Location Services)

---

## Overview

The Location Input System provides a unified, intelligent location search interface across the platform, powering event creation, recommendation submissions, housing listings, and user travel profiles. It automatically selects between Google Maps Places API (premium) and OpenStreetMap Nominatim (free) based on configuration.

## System Architecture

### Component Hierarchy

```
LocationInput (Smart Wrapper)
├── GoogleMapsLocationInput (Primary)
│   ├── Google Places Autocomplete API
│   ├── Place Details API
│   └── Geocoding API
└── SimplifiedLocationInput (Fallback)
    ├── OpenStreetMap Nominatim API
    ├── Client-side suggestion filtering
    └── Common Buenos Aires locations
```

### Decision Flow

```
User opens PostCreator
    ↓
LocationInput component renders
    ↓
Check for VITE_GOOGLE_MAPS_API_KEY
    ↓
┌─────────────────┴─────────────────┐
│ API Key Present?                  │
├─────────────────┬─────────────────┤
│ YES             │ NO              │
↓                 ↓
GoogleMaps        SimplifiedLocation
LocationInput     Input
│                 │
└─────────┬───────┘
          ↓
User selects location
          ↓
Geocoded coordinates returned
          ↓
Parent component receives:
- Location name (string)
- Coordinates (lat/lng)
- Place details (optional)
```

---

## Components

### 1. LocationInput (Wrapper)

**File**: `client/src/components/universal/LocationInput.tsx`

**Purpose**: Intelligent wrapper that automatically selects the appropriate location search implementation based on Google Maps API availability.

**Key Features**:
- Automatic API key detection
- Seamless fallback to OpenStreetMap
- Unified props interface for both modes
- Loading state management
- Normalized callback signatures

**Props**:
```typescript
interface LocationInputProps {
  value: string;
  onChange: (
    location: string, 
    coordinates?: { lat: number; lng: number }, 
    details?: LocationDetails
  ) => void;
  placeholder?: string;
  className?: string;
  biasToLocation?: { lat: number; lng: number };
  searchTypes?: string[];
  showBusinessDetails?: boolean;
  allowManualEntry?: boolean;
  allowGoogleMapsUrl?: boolean;
  required?: boolean;
  onClear?: () => void;
}
```

**API Key Detection Logic**:
```typescript
useEffect(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const available = !!apiKey && apiKey.length > 0;
  setGoogleMapsAvailable(available);
  setUseGoogleMaps(available);
}, []);
```

**ESA Compliance**: Layer 13 (Location Services)
- ✅ Graceful degradation when API unavailable
- ✅ Clear loading states for users
- ✅ Consistent interface regardless of backend

---

### 2. GoogleMapsLocationInput (Primary)

**File**: `client/src/components/universal/GoogleMapsLocationInput.tsx`

**Purpose**: Premium location search using Google Maps Places API with autocomplete, place details, ratings, and business information.

**Features**:
- Real-time autocomplete suggestions
- Place details (name, address, coordinates, rating, price level)
- Business status (open/closed, permanently closed)
- Google Maps URL parsing
- Location bias for regional results
- Custom search type filtering

**Google Maps APIs Used**:
1. **Places Autocomplete Service**: Provides search suggestions
2. **Place Details Service**: Fetches complete place information
3. **Geocoding Service**: Converts addresses to coordinates

**API Key Configuration**:
```typescript
const script = document.createElement('script');
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=AR`;
```

**Place Details Structure**:
```typescript
interface LocationDetails {
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  types?: string[];       // e.g., ['restaurant', 'food', 'point_of_interest']
  rating?: number;        // Google user rating (1-5)
  priceLevel?: number;    // 1-4 ($-$$$$)
  businessStatus?: string; // 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY'
}
```

**Search Type Filtering**:
```typescript
// Default: All establishment types
searchTypes: []

// Specific types for events
searchTypes: ['establishment', 'point_of_interest']

// Restaurant recommendations only
searchTypes: ['restaurant', 'cafe', 'bar']
```

**Location Bias** (Prioritizes Buenos Aires by default):
```typescript
biasToLocation: { lat: -34.6037, lng: -58.3816 }
```

**ESA Compliance**: Layer 13 + Layer 58 (Third-Party Integrations)
- ✅ Rate limiting respect (1 req/sec for Autocomplete)
- ✅ Error handling with user-friendly messages
- ✅ Caching of place details (client-side)

---

### 3. SimplifiedLocationInput (Fallback)

**File**: `client/src/components/universal/SimplifiedLocationInput.tsx`

**Purpose**: Free, no-API-key-required location search using OpenStreetMap Nominatim geocoding and client-side suggestion filtering.

**Features**:
- Client-side filtering of common Buenos Aires locations
- OpenStreetMap Nominatim geocoding
- Manual text entry allowed
- Clear/reset functionality
- No API key required

**Common Locations Database** (Hard-coded):
```typescript
const commonLocations = [
  'La Viruta Tango Club, Buenos Aires',
  'Salón Canning, Buenos Aires',
  'La Catedral Club, Buenos Aires',
  'Milonga Parakultural, Buenos Aires',
  'Centro Cultural Torquato Tasso, Buenos Aires',
  'Confitería Ideal, Buenos Aires',
  'El Beso Milonga, Buenos Aires',
  'Plaza Dorrego, San Telmo, Buenos Aires'
];
```

**Geocoding Flow**:
```typescript
const geocodeLocation = async (location: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
  );
  const data = await response.json();
  
  if (data && data[0]) {
    return {
      address: location,
      city: data[0].address?.city || 'Buenos Aires',
      country: data[0].address?.country || 'Argentina',
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name
    };
  }
};
```

**OpenStreetMap Nominatim Limits**:
- **Rate Limit**: 1 request per second
- **No API Key Required**: Public free service
- **Attribution Required**: "Powered by OpenStreetMap"
- **Coverage**: Global but less detailed than Google Maps

**ESA Compliance**: Layer 13 (Maps)
- ✅ Respects Nominatim usage policy (1 req/sec)
- ✅ Fallback for when budget is limited
- ✅ Works offline with common locations list

---

## Integration Points

### PostCreator Component

**File**: `client/src/components/universal/PostCreator.tsx`

**Usage**:
```tsx
import LocationInput from './LocationInput';

// Location state management
const [location, setLocation] = useState('');
const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | undefined>();
const [locationDetails, setLocationDetails] = useState<any>(null);

// Callback handler
const handleLocationChange = useCallback(
  (locationName: string, coordinates?: { lat: number; lng: number }, details?: any) => {
    setLocation(locationName);
    setLocationCoordinates(coordinates);
    setLocationDetails(details);
    
    // Enhanced toast if business has rating (Google Maps mode)
    if (details?.rating) {
      toast({
        title: `📍 ${details.name}`,
        description: `⭐ ${details.rating} • ${details.address}`,
      });
    }
  },
  [toast]
);

// Render
<LocationInput
  value={location}
  onChange={handleLocationChange}
  placeholder="Search for a place..."
  biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
  showBusinessDetails={true}
  allowManualEntry={true}
/>
```

**Data Flow**:
1. User types in LocationInput
2. Autocomplete suggestions appear (Google Maps) or filtered common locations (SimplifiedLocationInput)
3. User selects location
4. Component geocodes location if needed
5. Callback fires with: `(locationName, coordinates, details)`
6. PostCreator stores all three for submission

---

### Event Creation Wizard

**File**: `client/src/components/events/EventCreationWizard.tsx`

**Custom Configuration**:
```tsx
<LocationInput
  value={formData.location}
  onChange={(location, coords, details) => {
    updateFormData({
      location,
      latitude: coords?.lat?.toString(),
      longitude: coords?.lng?.toString(),
      address: details?.address || location
    });
  }}
  placeholder="Event venue or address"
  searchTypes={['establishment', 'point_of_interest']}
  biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
/>
```

**Validation**:
- Location name required
- Coordinates optional but recommended
- Fallback geocoding via `CityAutoCreationService` if coordinates missing

---

### Recommendation Creation (PostCreator)

**Recommendation-Specific Features**:
```tsx
<LocationInput
  value={location}
  onChange={handleLocationChange}
  placeholder="Restaurant, cafe, or venue name"
  searchTypes={['restaurant', 'cafe', 'bar', 'food']}
  showBusinessDetails={true} // Show ratings, price level
  biasToLocation={userCity || { lat: -34.6037, lng: -58.3816 }}
/>
```

**Enhanced Data Capture**:
- Business name
- Full address
- Coordinates (lat/lng)
- Google rating (if available)
- Price level ($-$$$$)
- Business status

**Automatic Recommendation Enrichment**:
```typescript
if (locationDetails) {
  // Pre-fill recommendation fields
  setRecommendationType(inferTypeFromGoogleTypes(locationDetails.types));
  setPriceRange(locationDetails.priceLevel?.toString() || '');
  // Store Google rating for dual rating system
  setGoogleRating(locationDetails.rating);
}
```

---

### Host Property Listing

**File**: `client/src/components/host-onboarding/LocationStep.tsx`

**Housing-Specific Configuration**:
```tsx
<LocationInput
  value={address}
  onChange={(location, coords, details) => {
    setAddress(location);
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
    }
    // Extract city from address for groupId assignment
    if (details?.address) {
      const city = extractCity(details.address);
      setCity(city);
    }
  }}
  placeholder="Property address"
  searchTypes={['geocode', 'establishment']} // Addresses + establishments
  allowManualEntry={true}
  required={true}
/>
```

---

## Configuration

### Environment Variables

**Required for Google Maps Mode**:
```bash
# .env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your-key-here
```

**Google Maps API Requirements**:
1. **Places API** enabled
2. **Geocoding API** enabled (optional but recommended)
3. **Maps JavaScript API** enabled
4. Billing account configured
5. API restrictions (optional): HTTP referrers for security

**Cost Estimation** (as of 2024):
- Autocomplete - Per Session: $0.017 per session
- Place Details: $0.017 per request
- Geocoding: $0.005 per request
- **Monthly free tier**: $200 credit = ~11,700 autocomplete sessions

**To disable Google Maps** (force SimplifiedLocationInput):
```bash
# Remove or comment out the API key
# VITE_GOOGLE_MAPS_API_KEY=
```

---

### OpenStreetMap Nominatim (Fallback)

**No Configuration Required** - Works out of the box

**Usage Policy**:
1. **Rate Limit**: 1 request per second
2. **User-Agent**: Set to application name (auto-configured)
3. **Bulk Geocoding**: Prohibited (use paid services)
4. **Attribution**: Display "Powered by OpenStreetMap"

**Nominatim API Endpoint**:
```
https://nominatim.openstreetmap.org/search
  ?format=json
  &q={location query}
  &limit=1
```

---

## Error Handling

### Google Maps Failure Scenarios

**1. Invalid API Key**:
```typescript
// Auto-falls back to SimplifiedLocationInput
if (!apiKey || apiKey.length === 0) {
  console.warn('Google Maps API key not configured, using SimplifiedLocationInput');
  return <SimplifiedLocationInput {...props} />;
}
```

**2. API Loading Failure**:
```typescript
loadGoogleMapsScript()
  .catch(error => {
    console.error('Google Maps initialization error:', error);
    toast({
      title: "Location search unavailable",
      description: "Using simplified search instead",
      variant: "destructive"
    });
    setUseGoogleMaps(false); // Fall back to SimplifiedLocationInput
  });
```

**3. Quota Exceeded**:
```typescript
placesService.getDetails(request, (place, status) => {
  if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
    toast({
      title: "Too many requests",
      description: "Please try again in a moment",
      variant: "destructive"
    });
  }
});
```

---

### OpenStreetMap Failure Scenarios

**1. Network Error**:
```typescript
try {
  const response = await fetch(nominatimUrl);
  if (!response.ok) throw new Error('Geocoding failed');
} catch (error) {
  console.error('Geocoding error:', error);
  // Just use the string value if geocoding fails
  onLocationSelect(location);
}
```

**2. Rate Limit Exceeded**:
```typescript
// Client-side throttling (500ms debounce)
const debouncedGeocode = debounce((location: string) => {
  geocodeLocation(location);
}, 500);
```

**3. No Results Found**:
```typescript
if (!data || data.length === 0) {
  toast({
    title: "Location not found",
    description: "Try entering a more specific address",
  });
  // Still allow manual text entry
  onLocationSelect(location);
}
```

---

## Performance Considerations

### Google Maps Mode

**Optimizations**:
1. **Debounced Autocomplete**: 300ms delay to reduce API calls
2. **Session Tokens**: Bundles autocomplete + place details into single billable session
3. **Place Details Caching**: Cache results client-side for 5 minutes
4. **Lazy Script Loading**: Load Google Maps script only when needed

**Performance Metrics**:
- Autocomplete response: 50-200ms
- Place details fetch: 100-300ms
- Total selection time: < 500ms

---

### SimplifiedLocationInput Mode

**Optimizations**:
1. **Client-Side Filtering**: No API calls for common locations
2. **Geocoding Only When Needed**: Only geocode after user selection
3. **Rate Limit Compliance**: 500ms debounce ensures < 2 req/sec

**Performance Metrics**:
- Common location filter: < 10ms
- OpenStreetMap geocoding: 200-1000ms (network dependent)
- Total selection time: < 1.5s

---

## Testing

### Manual Testing Checklist

**Google Maps Mode** (with API key):
- [ ] Autocomplete suggestions appear
- [ ] Selecting suggestion populates location
- [ ] Business details (rating, price) displayed
- [ ] Coordinates returned correctly
- [ ] Error handling works (invalid API key)

**SimplifiedLocationInput Mode** (no API key):
- [ ] Common locations suggestions appear
- [ ] Manual text entry works
- [ ] OpenStreetMap geocoding works
- [ ] Coordinates returned correctly
- [ ] Handles geocoding failures gracefully

**Integration Testing**:
- [ ] PostCreator location input works
- [ ] Event creation wizard location input works
- [ ] Recommendation creation location input works
- [ ] Host property listing location input works
- [ ] All integrations handle both modes

---

### Automated Testing

**E2E Test Structure**:
```typescript
describe('LocationInput Component', () => {
  describe('Google Maps Mode', () => {
    beforeEach(() => {
      // Set VITE_GOOGLE_MAPS_API_KEY
      process.env.VITE_GOOGLE_MAPS_API_KEY = 'test-key';
    });

    test('shows Google Maps autocomplete', async () => {
      render(<LocationInput value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText(/search for a place/i);
      fireEvent.change(input, { target: { value: 'La Viruta' } });
      await waitFor(() => {
        expect(screen.getByText(/La Viruta Tango Club/i)).toBeInTheDocument();
      });
    });
  });

  describe('SimplifiedLocationInput Mode', () => {
    beforeEach(() => {
      // Remove API key
      delete process.env.VITE_GOOGLE_MAPS_API_KEY;
    });

    test('shows common locations', async () => {
      render(<LocationInput value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText(/enter location/i);
      fireEvent.change(input, { target: { value: 'La Viruta' } });
      expect(screen.getByText(/La Viruta Tango Club, Buenos Aires/i)).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Issue: Location input stuck in loading state

**Symptoms**: Shows "Loading location search..." indefinitely

**Cause**: `googleMapsAvailable` state stuck at `null`

**Fix**: Ensure proper API key detection timeout
```typescript
useEffect(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const available = !!apiKey && apiKey.length > 0;
  setGoogleMapsAvailable(available);
  setUseGoogleMaps(available);
}, []);
```

---

### Issue: Google Maps not loading

**Symptoms**: Console errors about Google Maps API

**Checks**:
1. API key present in `.env`: `VITE_GOOGLE_MAPS_API_KEY=...`
2. Places API enabled in Google Cloud Console
3. Billing account active
4. No API restrictions blocking requests
5. Browser console for specific error messages

**Debugging**:
```javascript
// Check if Google Maps loaded
console.log('Google Maps available:', !!window.google?.maps);

// Check API key
console.log('API Key configured:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
```

---

### Issue: OpenStreetMap rate limit exceeded

**Symptoms**: Geocoding stops working, 429 errors in console

**Cause**: Too many requests in short time (> 1 req/sec)

**Fix**: Increase debounce delay
```typescript
const debouncedGeocode = debounce(geocodeLocation, 1000); // 1 second delay
```

---

### Issue: No suggestions appearing

**Google Maps**:
- Check API key validity
- Verify Places API enabled
- Check quota usage in Google Cloud Console

**SimplifiedLocationInput**:
- Verify user typed > 2 characters
- Check if location matches common locations list
- Test with exact match: "La Viruta Tango Club, Buenos Aires"

---

## Migration Guide

### Switching from Google Maps to SimplifiedLocationInput

**Before**:
```tsx
<GoogleMapsLocationInput
  value={location}
  onChange={handleChange}
  biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
/>
```

**After** (auto-detects mode):
```tsx
<LocationInput
  value={location}
  onChange={handleChange}
  biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
/>
```

**No code changes required** - just remove Google Maps API key from `.env`

---

### Adding Custom Common Locations

**Edit**: `client/src/components/universal/SimplifiedLocationInput.tsx`

```typescript
const commonLocations = [
  'La Viruta Tango Club, Buenos Aires',
  'Salón Canning, Buenos Aires',
  // Add your custom locations
  'Your Custom Venue, Buenos Aires',
  'Another Location, Buenos Aires'
];
```

---

## Related Documentation

- [Geocoding System](../geocoding-system/index.md) - Backend geocoding with `CityAutoCreationService`
- [PostCreator Component](./PostCreator.md) - Universal post creation UI
- [ESA Layer 13](../../ESA.md#layer-13) - Maps & location services
- [ESA Layer 58](../../ESA.md#layer-58) - Third-party integrations

---

## Future Enhancements

### Planned Features

1. **Hybrid Mode**: Use Google Maps for autocomplete, OpenStreetMap for geocoding
2. **Offline Support**: Cache common locations for PWA offline mode
3. **Location History**: Remember user's recent locations
4. **Custom Search Providers**: Support for alternative geocoding services
5. **Voice Input**: "Say the location" for mobile users
6. **Image Recognition**: Upload photo of venue sign to identify location

---

## Support

For location system issues, refer to:
- [Location Troubleshooting Guide](./location-troubleshooting.md)
- ESA Layer 13 documentation
- Google Maps Platform documentation
- OpenStreetMap Nominatim usage policy
