# LocationIQ Integration Guide

## Overview

LocationIQ is a commercial geocoding and mapping service built on OpenStreetMap data with enhanced business POI (Point of Interest) coverage, fast response times, and generous free tiers. This guide provides comprehensive technical documentation for the Mundo Tango platform's LocationIQ integration.

**ESA Framework Classification:**
- **Layer 13:** External Services Integration
- **Layer 15:** Search & Discovery  
- **Layer 58:** Third-Party Integration Tracking

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [API Capabilities](#api-capabilities)
3. [Authentication & Rate Limits](#authentication--rate-limits)
4. [Forward Geocoding (Search)](#forward-geocoding-search)
5. [Reverse Geocoding](#reverse-geocoding)
6. [Autocomplete](#autocomplete)
7. [Best Practices](#best-practices)
8. [Error Handling](#error-handling)
9. [Caching Strategy](#caching-strategy)
10. [Cost Optimization](#cost-optimization)
11. [Platform Integration](#platform-integration)
12. [Troubleshooting](#troubleshooting)

---

## Service Overview

### What is LocationIQ?

LocationIQ is a geocoding API service that provides:
- **Forward Geocoding:** Convert addresses/place names → coordinates
- **Reverse Geocoding:** Convert coordinates → addresses
- **Autocomplete:** Real-time place suggestions
- **Map Tiles:** Custom map rendering (not used in our platform)
- **Routing:** Directions between points (not used in our platform)

### Why LocationIQ?

**Advantages over OpenStreetMap Nominatim:**
- ✅ **10x Faster:** Average response time <100ms vs 1000ms+
- ✅ **Better POI Coverage:** Enhanced business data (restaurants, cafes, bars)
- ✅ **No CORS Issues:** Proper CORS headers for browser requests
- ✅ **Rate Limiting:** 2 requests/second (vs Nominatim's 1 req/sec)
- ✅ **Generous Free Tier:** 10,000 searches/day free
- ✅ **Commercial Support:** SLA guarantees for paid tiers
- ✅ **Structured Addresses:** Better address component parsing

**When to Use:**
- User location search (posts, events, recommendations, housing)
- Business/restaurant search with coordinates
- City/country autocomplete
- Address validation

---

## API Capabilities

### Endpoints We Use

| Endpoint | Purpose | Rate Limit | Platform Usage |
|----------|---------|------------|----------------|
| `/v1/search` | Forward geocoding | 2 req/sec | Primary location search |
| `/v1/reverse` | Reverse geocoding | 2 req/sec | Not currently used |
| `/v1/autocomplete` | Place suggestions | 2 req/sec | Not currently used |

### Data Coverage

**Global Coverage:**
- 200+ countries
- 50M+ addresses
- 5M+ businesses (restaurants, hotels, etc.)
- All OpenStreetMap data + commercial enhancements

**Best Coverage Regions:**
- North America: Excellent
- Europe: Excellent
- South America: Very Good
- Asia: Good
- Africa: Moderate
- Oceania: Good

---

## Authentication & Rate Limits

### API Key Management

**Environment Variable:**
```bash
LOCATIONIQ_API_KEY=pk.your_api_key_here
```

**Security:**
- ✅ Stored in Replit Secrets
- ✅ Never exposed to frontend
- ✅ Backend proxy handles all API calls
- ✅ No client-side API key usage

### Rate Limits

| Tier | Daily Limit | Rate Limit | Cost |
|------|-------------|------------|------|
| **Free** | 10,000 | 2 req/sec | $0/month |
| **Professional** | 100,000 | 5 req/sec | $49/month |
| **Business** | 500,000 | 10 req/sec | $149/month |
| **Enterprise** | Unlimited | Custom | Custom |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 1633046400
```

**Handling Rate Limits:**
- Our backend caches results (24-hour TTL)
- Automatic fallback to Nominatim on 429 errors
- Cache hit rate: ~60-70% in production

---

## Forward Geocoding (Search)

### Basic Search

**Endpoint:** `GET https://us1.locationiq.com/v1/search`

**Required Parameters:**
- `key`: Your API key
- `q`: Search query (address, place name, business)
- `format`: Response format (`json`, `xml`, `jsonv2`)

**Optional Parameters:**
- `limit`: Max results (default: 10, max: 50)
- `addressdetails`: Include address components (0 or 1)
- `normalizeaddress`: Normalize address format (0 or 1)
- `dedupe`: Remove duplicate results (0 or 1)
- `viewbox`: Bias results to geographic bounds
- `bounded`: Restrict results to viewbox (0 or 1)
- `countrycodes`: Filter by country (ISO 3166-1 alpha-2)

### Example: Basic Search

**Request:**
```http
GET https://us1.locationiq.com/v1/search?key=YOUR_KEY&q=osaka+buenos+aires&format=json&limit=8&addressdetails=1
```

**Response:**
```json
[
  {
    "place_id": "234567890",
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0",
    "osm_type": "node",
    "osm_id": 987654321,
    "boundingbox": ["-34.6145", "-34.6145", "-58.4321", "-58.4321"],
    "lat": "-34.6145",
    "lon": "-58.4321",
    "display_name": "Osaka, Palermo, Buenos Aires, Argentina",
    "class": "amenity",
    "type": "restaurant",
    "importance": 0.42,
    "address": {
      "restaurant": "Osaka",
      "neighbourhood": "Palermo",
      "city": "Buenos Aires",
      "country": "Argentina",
      "country_code": "ar"
    }
  }
]
```

### Location Bias (Proximity Search)

Bias results towards a specific location using `viewbox`:

**Formula:**
```
viewbox = minLon,maxLat,maxLon,minLat
```

**Example:** Search near Buenos Aires (-34.6037, -58.3816)
```http
GET https://us1.locationiq.com/v1/search?key=YOUR_KEY&q=osaka&viewbox=-58.9816,-34.1037,-57.7816,-35.1037&bounded=0
```

**Viewbox Calculation:**
```typescript
// Create ~50km radius around user location
const latOffset = 0.45;  // ~50km
const lngOffset = 0.6;   // ~50km
const minLng = longitude - lngOffset;
const maxLng = longitude + lngOffset;
const minLat = latitude - latOffset;
const maxLat = latitude + latOffset;

const viewbox = `${minLng},${maxLat},${maxLng},${minLat}`;
```

**Bounded Parameter:**
- `bounded=0`: Bias results (soft filter) - allows global matches if local matches are poor
- `bounded=1`: Restrict results (hard filter) - only returns matches within viewbox

**Recommendation:** Use `bounded=0` for better user experience

---

## Reverse Geocoding

Convert coordinates to human-readable addresses.

### Basic Reverse Geocoding

**Endpoint:** `GET https://us1.locationiq.com/v1/reverse`

**Required Parameters:**
- `key`: Your API key
- `lat`: Latitude
- `lon`: Longitude
- `format`: Response format

**Example:**
```http
GET https://us1.locationiq.com/v1/reverse?key=YOUR_KEY&lat=-34.6037&lon=-58.3816&format=json
```

**Response:**
```json
{
  "place_id": "123456789",
  "lat": "-34.6037",
  "lon": "-58.3816",
  "display_name": "Obelisco, Microcentro, Buenos Aires, Argentina",
  "address": {
    "monument": "Obelisco",
    "neighbourhood": "Microcentro",
    "city": "Buenos Aires",
    "country": "Argentina",
    "country_code": "ar"
  }
}
```

---

## Autocomplete

Real-time place suggestions as users type (not currently implemented).

### Basic Autocomplete

**Endpoint:** `GET https://us1.locationiq.com/v1/autocomplete`

**Parameters:**
- `key`: Your API key
- `q`: Partial query (minimum 2 characters)
- `limit`: Max suggestions (default: 10)
- `countrycodes`: Filter by country

**Example:**
```http
GET https://us1.locationiq.com/v1/autocomplete?key=YOUR_KEY&q=buen&limit=5&countrycodes=ar
```

**Response:**
```json
[
  {
    "place_id": "111222333",
    "display_place": "Buenos Aires, Argentina",
    "display_address": "Buenos Aires, Argentina",
    "lat": "-34.6037",
    "lon": "-58.3816"
  }
]
```

**Implementation Notes:**
- Debounce user input (300-500ms)
- Minimum 2-3 characters before triggering
- Cache frequent searches
- Cancel previous requests on new input

---

## Best Practices

### 1. Caching Strategy

**Cache Everything:**
```typescript
const geocodingCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(query: string, lat?: string, lng?: string, limit?: number) {
  return `${query}|${lat || ''}|${lng || ''}|${limit || 8}`;
}
```

**Cache Priorities:**
- Cities/countries: 7 days TTL
- Businesses: 24 hours TTL
- Addresses: 24 hours TTL

**Benefits:**
- Reduces API calls by 60-70%
- Faster response times (<10ms for cache hits)
- Stays within free tier limits

### 2. Query Optimization

**Normalize Queries:**
```typescript
function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}
```

**Smart Defaults:**
```typescript
const searchLimit = Math.min(parseInt(limit) || 8, 20);
const addressDetails = 1;  // Always include
const normalizeAddress = 1; // Always normalize
const dedupe = 1;          // Remove duplicates
```

### 3. Error Handling

**Handle All Error Cases:**
```typescript
try {
  const response = await fetch(locationIqUrl);
  
  if (response.status === 429) {
    // Rate limit reached - fallback to Nominatim
    console.warn('⚠️ LocationIQ rate limit, using fallback');
    return await nominatimSearch(query);
  }
  
  if (response.status === 401) {
    // Invalid API key
    console.error('❌ Invalid LocationIQ API key');
    return await nominatimSearch(query);
  }
  
  if (!response.ok) {
    throw new Error(`LocationIQ error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('❌ LocationIQ request failed:', error);
  return await nominatimSearch(query); // Fallback
}
```

### 4. Performance Optimization

**Parallel Requests for Business Search:**
```typescript
// Search "osaka" + "osaka restaurant" simultaneously
const queries = [
  searchLocationIQ('osaka', lat, lng),
  searchLocationIQ('osaka restaurant', lat, lng),
];

const results = await Promise.all(queries);
const combined = dedupeResults([...results[0], ...results[1]]);
```

**Request Timeout:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

const response = await fetch(url, { 
  signal: controller.signal 
});

clearTimeout(timeout);
```

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| `200` | Success | Return results |
| `400` | Bad Request | Check query parameters |
| `401` | Unauthorized | Check API key |
| `404` | Not Found | Return empty results |
| `429` | Rate Limit | Fallback to Nominatim |
| `500` | Server Error | Retry or fallback |

### Fallback Strategy

```
LocationIQ (Primary)
  ↓ (on error/rate limit)
Nominatim (Fallback)
  ↓ (on error)
Local Database (Final)
```

**Implementation:**
```typescript
async function geocode(query: string, lat?: number, lng?: number) {
  // Try LocationIQ first
  try {
    return await locationIQSearch(query, lat, lng);
  } catch (error) {
    console.warn('LocationIQ failed, trying Nominatim');
  }
  
  // Fallback to Nominatim
  try {
    return await nominatimSearch(query, lat, lng);
  } catch (error) {
    console.warn('Nominatim failed, searching local DB');
  }
  
  // Final fallback: local recommendations database
  return await searchLocalRecommendations(query);
}
```

---

## Caching Strategy

### Memory Cache (Development)

```typescript
const geocodingCache = new Map<string, {
  data: any[];
  timestamp: number;
}>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

function getFromCache(key: string) {
  const cached = geocodingCache.get(key);
  
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    geocodingCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(key: string, data: any[]) {
  geocodingCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Limit cache size (FIFO eviction)
  if (geocodingCache.size > MAX_CACHE_SIZE) {
    const firstKey = geocodingCache.keys().next().value;
    geocodingCache.delete(firstKey);
  }
}
```

### Redis Cache (Production)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedGeocode(query: string) {
  const cacheKey = `geo:${query}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  return null;
}

async function cacheGeocode(query: string, results: any[]) {
  const cacheKey = `geo:${query}`;
  const ttl = 24 * 60 * 60; // 24 hours
  
  await redis.setex(cacheKey, ttl, JSON.stringify(results));
}
```

---

## Cost Optimization

### Staying Within Free Tier (10,000 requests/day)

**Calculation:**
- 10,000 requests/day = ~416 requests/hour
- ~7 requests/minute
- With 70% cache hit rate: ~1,400 unique searches/day

**Optimization Strategies:**

1. **Aggressive Caching**
   - 24-hour TTL for all searches
   - Pre-warm cache for popular cities
   - Cache negative results (not found)

2. **Query Deduplication**
   - Track in-flight requests
   - Prevent duplicate concurrent requests

3. **Rate Limiting**
   - Max 2 requests/second
   - Queue requests if needed

4. **Smart Fallbacks**
   - Use Nominatim for low-priority searches
   - Use local DB for known places

### Monitoring Usage

**Track Daily Usage:**
```typescript
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

function incrementUsage() {
  const today = new Date().toDateString();
  
  if (today !== lastResetDate) {
    dailyRequestCount = 0;
    lastResetDate = today;
  }
  
  dailyRequestCount++;
  
  if (dailyRequestCount > 9000) {
    console.warn('⚠️ Approaching LocationIQ daily limit:', dailyRequestCount);
  }
}
```

**Alert on High Usage:**
```typescript
if (dailyRequestCount > 9500) {
  // Switch to Nominatim for rest of day
  console.error('🚨 LocationIQ daily limit almost reached, switching to fallback');
  return await nominatimSearch(query);
}
```

---

## Platform Integration

### Backend Proxy Architecture

**Endpoint:** `/api/location/geocode`

**Why Backend Proxy?**
- ✅ Hides API key from frontend
- ✅ Enables caching
- ✅ Allows fallback logic
- ✅ Solves CORS issues
- ✅ Monitors usage

**Request Flow:**
```
Frontend → Backend Proxy → LocationIQ API
                         ↓ (on error)
                         Nominatim API
                         ↓ (on error)
                         Local Database
```

### Frontend Integration

**UnifiedLocationPicker Component:**
```typescript
import { useLocationBias } from '@/contexts/LocationBiasContext';

function UnifiedLocationPicker({ onSelectLocation }) {
  const { userLocation } = useLocationBias();
  
  const searchLocations = async (query: string) => {
    const params = new URLSearchParams({
      q: query,
      limit: '8',
    });
    
    // Add location bias if available
    if (userLocation?.latitude && userLocation?.longitude) {
      params.append('lat', userLocation.latitude.toString());
      params.append('lng', userLocation.longitude.toString());
    }
    
    // Call backend proxy (handles LocationIQ → Nominatim fallback)
    const response = await fetch(`/api/location/geocode?${params}`);
    const results = await response.json();
    
    return results;
  };
  
  // Component implementation...
}
```

### Used In:
- Post creation (`PostCreator.tsx`)
- Event creation (`CreateEventDialog.tsx`)
- Recommendation submission (`RecommendationForm.tsx`)
- Housing listings (`CreatePropertyDialog.tsx`)
- User profile location (`ProfileSettings.tsx`)

---

## Troubleshooting

### Issue: No Results Returned

**Possible Causes:**
1. Query too specific (e.g., "osaka buenos aires palermo")
2. Location doesn't exist in OSM data
3. Wrong country bias

**Solutions:**
- Simplify query (remove extra details)
- Try without location bias
- Check spelling
- Use broader search terms

### Issue: Wrong Location Results

**Example:** Searching "osaka" in Buenos Aires returns results in Japan

**Causes:**
- Missing/incorrect location bias
- Browser geolocation detected wrong country
- VPN/proxy location mismatch

**Solutions:**
1. Verify location bias coordinates
2. Use IP geolocation as fallback
3. Add country filter: `countrycodes=ar`
4. Increase viewbox bias strength

### Issue: Rate Limit Errors (429)

**Symptoms:**
- 429 HTTP status code
- "Rate limit exceeded" message

**Solutions:**
1. Check cache is working correctly
2. Verify cache TTL is appropriate
3. Implement request queuing
4. Upgrade to paid tier if needed

### Issue: Slow Response Times

**Typical Latency:**
- LocationIQ: 50-150ms
- Nominatim: 500-2000ms

**If Slower:**
1. Check network latency
2. Verify caching is enabled
3. Check backend server location
4. Consider Redis cache upgrade

---

## Response Format Reference

### Search Response Object

```typescript
interface LocationIQResult {
  place_id: string;          // Unique place identifier
  licence: string;           // Data license
  osm_type: 'node' | 'way' | 'relation';
  osm_id: number;           // OpenStreetMap ID
  boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
  lat: string;              // Latitude
  lon: string;              // Longitude
  display_name: string;     // Full formatted address
  class: string;            // OSM class (amenity, highway, building)
  type: string;             // OSM type (restaurant, road, house)
  importance: number;       // Result relevance (0-1)
  icon?: string;            // Icon URL (if available)
  address?: {
    name?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}
```

### Transformed Response (Our Format)

```typescript
interface TransformedLocation {
  description: string;      // Full display name
  isLocationIQ: boolean;    // Provider flag
  lat: string;             // Latitude
  lon: string;             // Longitude
  place_id: string;        // Unique ID
  address: object;         // Address components
  type: string;            // Place type
  class: string;           // Place class
  importance?: number;     // Relevance score
}
```

---

## API Reference Summary

### Search Endpoint

```
GET https://us1.locationiq.com/v1/search
```

**Parameters:**
- `key` (required): API key
- `q` (required): Search query
- `format` (required): `json`, `xml`, `jsonv2`
- `limit`: 1-50 (default: 10)
- `addressdetails`: 0 or 1
- `viewbox`: `minLon,maxLat,maxLon,minLat`
- `bounded`: 0 or 1
- `countrycodes`: Comma-separated ISO codes

### Reverse Endpoint

```
GET https://us1.locationiq.com/v1/reverse
```

**Parameters:**
- `key` (required): API key
- `lat` (required): Latitude
- `lon` (required): Longitude
- `format` (required): `json`, `xml`, `jsonv2`
- `addressdetails`: 0 or 1

### Autocomplete Endpoint

```
GET https://us1.locationiq.com/v1/autocomplete
```

**Parameters:**
- `key` (required): API key
- `q` (required): Partial query (min 2 chars)
- `limit`: 1-10 (default: 10)
- `countrycodes`: Comma-separated ISO codes

---

## Additional Resources

**Official Documentation:**
- Website: https://locationiq.com/
- API Docs: https://locationiq.com/docs
- Dashboard: https://my.locationiq.com/
- Status Page: https://status.locationiq.com/

**Support:**
- Email: support@locationiq.com
- GitHub: https://github.com/LocationIQ
- Community Forum: https://gis.stackexchange.com/questions/tagged/locationiq

**Alternative Services:**
- Nominatim (OSM): https://nominatim.org/
- Mapbox Geocoding: https://www.mapbox.com/geocoding
- Geoapify: https://www.geoapify.com/
- Pelias (self-hosted): https://pelias.io/

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-06 | 1.0.0 | Initial LocationIQ integration with fallback strategy |

---

## Related Documentation

- [Geocoding System Overview](../geocoding-system/index.md)
- [Map Components Guide](../geocoding-system/map-components.md)
- [Location Picker Component](../components/location-system.md)
- [ESA Layer 15: Search & Discovery](../esa-layers/layer-17-search-elasticsearch.md)
- [ESA Layer 58: Third-Party Integration](../esa-layers/index.md)
