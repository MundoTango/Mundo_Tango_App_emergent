# Location System Troubleshooting Guide

**Last Updated**: October 6, 2025  
**Framework**: ESA LIFE CEO 61x21  
**ESA Layer**: Layer 13 (Maps & Location Services)

---

## Quick Diagnosis

### Symptom Checklist

Use this checklist to quickly identify your issue:

- [ ] **Loading spinner stuck** → [Issue #1: Infinite Loading State](#issue-1-infinite-loading-state)
- [ ] **No suggestions appearing** → [Issue #2: No Autocomplete Suggestions](#issue-2-no-autocomplete-suggestions)
- [ ] **Google Maps errors in console** → [Issue #3: Google Maps API Errors](#issue-3-google-maps-api-errors)
- [ ] **SimplifiedLocationInput not geocoding** → [Issue #4: OpenStreetMap Geocoding Failure](#issue-4-openstreetmap-geocoding-failure)
- [ ] **Coordinates not being saved** → [Issue #5: Coordinates Not Persisted](#issue-5-coordinates-not-persisted)
- [ ] **Wrong location results** → [Issue #6: Incorrect Location Bias](#issue-6-incorrect-location-bias)

---

## Common Issues

### Issue #1: Infinite Loading State

**Symptom**: LocationInput shows "Loading location search..." forever

**Root Cause**: API key check stuck in null state (Fixed in October 2025)

**ESA Layer**: Layer 13

**Fix**:
The component was updated to remove the loading state entirely. If you're still seeing this:

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Verify component version**:
   ```bash
   grep -A 5 "export default function LocationInput" client/src/components/universal/LocationInput.tsx
   ```
   Should show: `const googleMapsAvailable = !!apiKey && apiKey.length > 0;`

3. **Check console**: Look for `📍 LocationInput mode:` log message

**Expected Behavior**: Component renders instantly, either GoogleMapsLocationInput or SimplifiedLocationInput

---

### Issue #2: No Autocomplete Suggestions

**Symptom**: Type in location input, nothing appears

**Possible Causes**:
1. Google Maps mode: API key invalid/missing
2. SimplifiedLocationInput mode: Not enough characters typed
3. Network issues

**Diagnosis Steps**:

**Step 1: Check which mode is active**
```javascript
// Open browser console
console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
```

**Step 2: Google Maps Mode Checks**
```javascript
// Check if Google Maps loaded
console.log('Google Maps available:', !!window.google?.maps);

// Check Places API
console.log('Places service:', !!window.google?.maps?.places);
```

**Fix for Google Maps**:
1. Verify `.env` file has `VITE_GOOGLE_MAPS_API_KEY=AIzaSy...`
2. Restart dev server (env vars require restart)
3. Check Google Cloud Console:
   - Places API enabled?
   - Billing account active?
   - Quota not exceeded?

**Step 3: SimplifiedLocationInput Checks**

**Fix for SimplifiedLocationInput**:
1. Type at least 3 characters
2. Match must be in common locations list:
   ```typescript
   'La Viruta Tango Club, Buenos Aires'
   'Salón Canning, Buenos Aires'
   // etc.
   ```
3. Check network tab for Nominatim API calls

---

### Issue #3: Google Maps API Errors

**Symptom**: Console errors mentioning Google Maps

**Common Error Messages**:

#### Error: "Google Maps JavaScript API error: InvalidKeyMapError"
**Cause**: API key invalid or restricted

**Fix**:
1. Generate new API key in Google Cloud Console
2. Remove HTTP referrer restrictions (for development)
3. Update `.env`: `VITE_GOOGLE_MAPS_API_KEY=new-key`
4. Restart dev server

#### Error: "Google Maps JavaScript API error: RefererNotAllowedMapError"
**Cause**: Domain not whitelisted in API restrictions

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Edit API key → Application restrictions
3. Add to referrer list:
   - `localhost:5000/*`
   - `*.replit.dev/*` (for Replit deployments)
4. Save and wait 5 minutes for propagation

#### Error: "You have exceeded your request quota"
**Cause**: Too many API calls, quota exhausted

**Fix**:
1. Check quota usage: Google Cloud Console → APIs & Services → Dashboard
2. Temporary: Switch to SimplifiedLocationInput (remove API key)
3. Permanent: Upgrade billing plan or implement request caching

#### Error: "This API project is not authorized to use this API"
**Cause**: Places API not enabled

**Fix**:
1. Google Cloud Console → APIs & Services → Library
2. Search "Places API"
3. Click "Enable"
4. Wait 2-3 minutes for activation

---

### Issue #4: OpenStreetMap Geocoding Failure

**Symptom**: SimplifiedLocationInput doesn't return coordinates

**Common Causes**:
1. Rate limit exceeded (> 1 req/sec)
2. Network/CORS issues
3. Invalid location query

**Diagnosis**:
```javascript
// Manual test in console
fetch('https://nominatim.openstreetmap.org/search?format=json&q=Buenos Aires&limit=1')
  .then(r => r.json())
  .then(data => console.log('Nominatim response:', data))
  .catch(e => console.error('Nominatim error:', e));
```

**Fix**:

**For rate limit errors** (HTTP 429):
```typescript
// Increase debounce delay in SimplifiedLocationInput.tsx
const debouncedGeocode = debounce(geocodeLocation, 1000); // 1 second
```

**For CORS errors**:
- Nominatim allows CORS by default
- Check if ad blocker/privacy extension is blocking
- Verify no proxy/VPN interference

**For "no results" errors**:
- Try more specific query: "La Viruta, Scalabrini Ortiz, Buenos Aires"
- Check spelling of location name
- Use English transliteration if possible

---

### Issue #5: Coordinates Not Persisted

**Symptom**: Coordinates returned but not saved to database

**Diagnosis**:
```javascript
// Add logging to onChange callback
onChange={(location, coords, details) => {
  console.log('Location:', location);
  console.log('Coordinates:', coords);
  console.log('Details:', details);
  // Your existing logic
}}
```

**Common Causes**:

#### Cause A: Callback not extracting coordinates
```tsx
// ❌ Wrong: Only using location string
<LocationInput
  value={location}
  onChange={(location) => setLocation(location)} // Missing coords!
/>

// ✅ Correct: Extract all parameters
<LocationInput
  value={location}
  onChange={(location, coords, details) => {
    setLocation(location);
    setCoordinates(coords);
  }}
/>
```

#### Cause B: Database schema mismatch
```typescript
// ❌ Wrong: String fields for coordinates
latitude: text('latitude'),
longitude: text('longitude'),

// ✅ Correct: Real/Float fields
lat: real('lat'),
lng: real('lng'),
```

#### Cause C: API not saving coordinates
```typescript
// ❌ Wrong: Not passing coordinates to API
await fetch('/api/events', {
  body: JSON.stringify({ location }) // Missing coordinates!
});

// ✅ Correct: Include coordinates
await fetch('/api/events', {
  body: JSON.stringify({ 
    location,
    latitude: coords?.lat,
    longitude: coords?.lng
  })
});
```

---

### Issue #6: Incorrect Location Bias

**Symptom**: Search results show wrong city/region

**Cause**: Location bias pointing to wrong coordinates

**Fix**:
```tsx
// Default: Buenos Aires
<LocationInput
  biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
/>

// Madrid
<LocationInput
  biasToLocation={{ lat: 40.4168, lng: -3.7038 }}
/>

// New York
<LocationInput
  biasToLocation={{ lat: 40.7128, lng: -74.0060 }}
/>

// Dynamic: User's city
<LocationInput
  biasToLocation={userCity ? { 
    lat: userCity.latitude, 
    lng: userCity.longitude 
  } : undefined}
/>
```

**Note**: Bias only affects suggestion ranking, doesn't restrict results

---

## Advanced Debugging

### Enable Verbose Logging

**LocationInput.tsx**:
```typescript
useEffect(() => {
  console.log('📍 LocationInput mode:', googleMapsAvailable ? 'Google Maps' : 'SimplifiedLocationInput (OSM)');
}, [googleMapsAvailable]);
```

**GoogleMapsLocationInput.tsx**:
```typescript
// Add after place details fetch
console.log('🗺️ Place details:', place);
console.log('📊 Rating:', place.rating);
console.log('💰 Price level:', place.price_level);
```

**SimplifiedLocationInput.tsx**:
```typescript
// Add after geocoding
console.log('🌍 Nominatim response:', data);
console.log('📍 Coordinates:', locationData.latitude, locationData.longitude);
```

---

### Network Tab Analysis

**For Google Maps**:
1. Open DevTools → Network tab
2. Filter: `maps.googleapis.com`
3. Look for:
   - `AutocompleteService` requests
   - `PlaceDetailsService` requests
4. Check response codes:
   - 200: Success
   - 403: Permission denied (API key issue)
   - 429: Quota exceeded

**For OpenStreetMap**:
1. Filter: `nominatim.openstreetmap.org`
2. Look for `/search` requests
3. Check response:
   - 200 with data: Success
   - 429: Rate limit exceeded
   - Empty array: No results found

---

### Component Isolation Test

**Test LocationInput in isolation**:
```tsx
// Create test page: client/src/pages/test-location.tsx
import { useState } from 'react';
import LocationInput from '@/components/universal/LocationInput';

export default function TestLocation() {
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Location Input Test</h1>
      
      <LocationInput
        value={location}
        onChange={(loc, coords, det) => {
          console.log('onChange fired:', { loc, coords, det });
          setLocation(loc);
          setCoords(coords);
          setDetails(det);
        }}
        placeholder="Test location search..."
      />

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold">Debug Output:</h2>
        <p><strong>Location:</strong> {location || 'None'}</p>
        <p><strong>Coordinates:</strong> {coords ? `${coords.lat}, ${coords.lng}` : 'None'}</p>
        <pre className="mt-2 text-xs">{JSON.stringify(details, null, 2)}</pre>
      </div>
    </div>
  );
}
```

Access: `http://localhost:5000/test-location`

---

## Performance Issues

### Issue: Autocomplete Too Slow

**Symptom**: Suggestions take > 1 second to appear

**Causes**:
1. Network latency
2. Too many API calls (no debouncing)
3. Large response payloads

**Fixes**:

**Increase debounce delay**:
```typescript
// GoogleMapsLocationInput.tsx
const debouncedSearch = debounce((input: string) => {
  // Search logic
}, 500); // Increase from 300ms to 500ms
```

**Limit suggestions count**:
```typescript
// AutocompleteService request
autocompleteService.getPlacePredictions({
  input: searchInput,
  location: biasToLocation,
  radius: 50000,
  types: searchTypes
}, (predictions, status) => {
  if (predictions) {
    setSuggestions(predictions.slice(0, 5)); // Limit to 5
  }
});
```

**Enable session tokens** (reduces billing):
```typescript
const sessionToken = new google.maps.places.AutocompleteSessionToken();
// Pass to AutocompleteService
```

---

### Issue: High API Costs

**Symptom**: Google Maps bill is high

**Diagnosis**:
1. Check Google Cloud Console → Billing
2. Identify most expensive API calls
3. Common culprits:
   - Place Details without session tokens
   - Multiple Geocoding calls for same location
   - No caching

**Cost Reduction Strategies**:

**1. Implement session tokens** (bundles autocomplete + details):
```typescript
// Reduces cost from $0.034 to $0.017 per lookup
const sessionToken = new google.maps.places.AutocompleteSessionToken();
```

**2. Cache place details client-side**:
```typescript
const placeCache = new Map<string, any>();

function getPlaceDetails(placeId: string) {
  if (placeCache.has(placeId)) {
    return Promise.resolve(placeCache.get(placeId));
  }
  // Fetch from API
  // Store in cache
}
```

**3. Switch to SimplifiedLocationInput for low-priority use cases**:
```tsx
// Events: Use Google Maps (user-facing, accuracy critical)
<LocationInput {...props} />

// Internal tools: Use SimplifiedLocationInput (free)
<SimplifiedLocationInput {...props} />
```

---

## ESA Layer Compliance Checklist

### Layer 13: Maps & Location Services

- [ ] LocationInput provides graceful fallback
- [ ] No infinite loading states
- [ ] Clear error messages to users
- [ ] Coordinates properly formatted (lat/lng as numbers)
- [ ] Geocoding respects rate limits
- [ ] Offline functionality with common locations

### Layer 58: Third-Party Integrations

- [ ] Google Maps API key properly configured
- [ ] API error handling implemented
- [ ] Quota monitoring setup
- [ ] Billing alerts configured
- [ ] Usage analytics tracked

### Layer 47: Mobile Optimization

- [ ] Touch-friendly tap targets (44px minimum)
- [ ] Autocomplete dropdown scrollable
- [ ] Input field responsive on small screens
- [ ] Virtual keyboard doesn't obscure suggestions

---

## Environment-Specific Issues

### Development Environment

**Localhost CORS**: Google Maps should work fine
**Nominatim**: Works without restrictions

### Production (Replit)

**Domain whitelist**: Add `*.replit.dev` to Google Maps API restrictions

**HTTPS required**: Google Maps requires HTTPS in production

**Replit environment variables**:
```bash
# Add to Replit Secrets
VITE_GOOGLE_MAPS_API_KEY=your-key-here
```

---

## When to Use Which Mode

| Scenario | Recommended Mode | Reason |
|----------|-----------------|--------|
| **User-facing events** | Google Maps | Accuracy, ratings, photos |
| **Recommendations** | Google Maps | Business details, reviews |
| **Housing listings** | Google Maps | Precise addresses |
| **Internal tools** | SimplifiedLocationInput | Cost savings |
| **Offline PWA** | SimplifiedLocationInput | Works offline |
| **Development** | SimplifiedLocationInput | No API key needed |
| **Budget limited** | SimplifiedLocationInput | Free alternative |

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Review browser console for errors
3. ✅ Test in component isolation
4. ✅ Verify environment variables
5. ✅ Check network tab for API responses

### Provide This Information

When reporting location system issues:

```
**Environment:**
- Mode: Google Maps or SimplifiedLocationInput?
- Browser: Chrome 120 / Firefox 115 / Safari 17
- Environment: Development / Production
- API key configured: Yes / No

**Issue Description:**
[Describe what's happening]

**Expected Behavior:**
[Describe what should happen]

**Console Errors:**
[Paste relevant console errors]

**Steps to Reproduce:**
1. Open PostCreator
2. Click location input
3. Type "La Viruta"
4. [etc.]

**Screenshots:**
[Attach if helpful]
```

---

## Related Documentation

- [Location System Architecture](./location-system.md)
- [Geocoding System](../geocoding-system/index.md)
- [ESA Layer 13](../../ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md#layer-13)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [OpenStreetMap Nominatim](https://nominatim.org/release-docs/latest/)

---

## Appendix: Error Code Reference

### Google Maps Status Codes

| Status | Meaning | Fix |
|--------|---------|-----|
| `OK` | Success | - |
| `ZERO_RESULTS` | No results found | Try more specific query |
| `OVER_QUERY_LIMIT` | Quota exceeded | Reduce requests or upgrade plan |
| `REQUEST_DENIED` | API key issue | Check API key and restrictions |
| `INVALID_REQUEST` | Missing required params | Check request parameters |
| `UNKNOWN_ERROR` | Server error | Retry after delay |

### OpenStreetMap HTTP Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 200 | Success | - |
| 429 | Rate limit exceeded | Wait 1 second between requests |
| 500 | Server error | Retry with exponential backoff |
| 503 | Service unavailable | Try again later |

---

**Last Updated**: October 6, 2025  
**Maintained by**: ESA LIFE CEO Development Team
