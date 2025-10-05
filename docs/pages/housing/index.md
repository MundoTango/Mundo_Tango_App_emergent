# Housing System - Complete Documentation Hub

## Overview

The Housing System provides tango-friendly accommodation marketplace functionality across the Life CEO & Mundo Tango platform. Built following **ESA LIFE CEO 61×21 framework**, the system enables dancers to find and offer housing in tango communities worldwide.

**Current Status:** ✅ Fully Implemented  
**ESA Layers:** 1 (Database), 2 (API), 8 (Client), 9 (UI), 12 (Media), 27 (Marketplace)  
**Theme:** MT Ocean (#5EEAD4 → #155E75) with glassmorphic design

---

## 📚 Documentation Index

### Core Features

1. **[Housing Marketplace](./housing-marketplace.md)**  
   Main marketplace page with search, filters, and listing management
   - Route: `/housing-marketplace`
   - Features: Browse listings, search, filters, bookings
   - Components: HousingListingCard, FilterPanel, BookingCalendar

2. **[Housing on Group Pages](./housing-on-group-page.md)** ⭐ NEW  
   City-specific housing tab integration on group detail pages
   - Route: `/group/:slug` → Housing tab
   - Features: City-filtered listings, map/list views, quick actions
   - Components: HostHomesList, HousingMap, HousingMapFilters

3. **[Host Onboarding](./HostOnboarding.md)**  
   Step-by-step wizard for property listing creation
   - Route: `/host-onboarding`
   - 8 Steps: Property type → Details → Location → Photos → Pricing → Review
   - Features: Auto-save, geocoding, image optimization

4. **[Guest Onboarding](./GuestOnboarding.md)**  
   Guest preference collection for housing recommendations
   - Route: `/guest-onboarding`
   - Steps: Accommodation → Budget → Location → Preferences
   - Features: Smart matching, saved searches, alerts

---

## 🗺️ Map Integration

### Unified Map Infrastructure

All housing maps use the **CDN-free unified map system** with MT Ocean theme:

- **HousingMap Component:** `client/src/components/maps/HousingMap.tsx`
- **Turquoise Gradient Markers:** MAP_COLORS.housing (`turquoise-500`)
- **Local Icons:** `/public/leaflet/` (zero CDN dependencies)
- **Automatic Geocoding:** OpenStreetMap Nominatim API

**Documentation:**
- [Map Components Guide](../geocoding-system/map-components.md)
- [CDN-Free Migration](../geocoding-system/cdn-free-migration.md)
- [Unified Map Components](../components/UnifiedMapComponents.md)

### Housing Map Features

```typescript
<HousingMap 
  homes={filteredHomes}
  cityLat={group?.latitude}
  cityLng={group?.longitude}
  onHomeClick={(home) => navigate(`/housing/${home.id}`)}
/>
```

- **Turquoise markers** with home icon
- **Popup details:** Price, guests, host info, "View Details" button
- **Auto-fit bounds** to show all listings
- **Legend support** with listing counts

---

## 🏗️ Technical Architecture

### Database Schema

**Host Homes Table:**
```sql
CREATE TABLE host_homes (
  id SERIAL PRIMARY KEY,
  host_id INTEGER REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  property_type VARCHAR(50),  -- entire_place, private_room, shared_room
  room_type VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  lat REAL,                   -- Geocoded latitude
  lng REAL,                   -- Geocoded longitude
  price_per_night DECIMAL(10,2),
  max_guests INTEGER,
  bedroom_count INTEGER,
  bathroom_count INTEGER,
  amenities TEXT[],
  photos JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/host-homes` | GET | Browse/search listings | Public |
| `/api/host-homes/:id` | GET | Get listing details | Public |
| `/api/host-homes` | POST | Create listing | Host required |
| `/api/host-homes/:id` | PUT | Update listing | Owner/Admin |
| `/api/host-homes/:id` | DELETE | Delete listing | Owner/Admin |
| `/api/housing/booking` | POST | Create booking | Authenticated |
| `/api/host/onboarding/start` | POST | Start host flow | Authenticated |
| `/api/guest/onboarding/start` | POST | Start guest flow | Authenticated |

### Key Components

**Housing Components:**
```
client/src/components/Housing/
└── HostHomesList.tsx       # Main listing component with filters

client/src/components/maps/
├── HousingMap.tsx          # Unified map with turquoise markers
└── HousingMapFilters.tsx   # Pre-built filter UI
```

**Usage Locations:**
1. `/housing-marketplace` - Full marketplace page
2. `/group/:slug` - City group housing tab
3. `/host-onboarding` - Host setup wizard
4. `/guest-onboarding` - Guest preference flow

---

## 🎨 MT Ocean Theme Implementation

### Color Palette

```css
/* Housing brand colors */
--housing-primary: #38B2AC;      /* Turquoise 500 */
--housing-secondary: #06B6D4;    /* Cyan 500 */
--housing-accent: #F50057;       /* Pink 500 */
--housing-gradient: linear-gradient(135deg, #38B2AC 0%, #06B6D4 100%);
```

### Component Styling

**Listing Cards:**
```css
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
```

**Map Markers:**
```typescript
// Turquoise gradient markers with home icon
createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home)
```

---

## 📍 Implementation Guide

### Adding Housing to a New Page

**1. Import Components:**
```typescript
import HostHomesList from '@/components/Housing/HostHomesList';
import HousingMap from '@/components/maps/HousingMap';
import { useHousingMapFilters } from '@/hooks/useMapFilters';
```

**2. Setup State:**
```typescript
const [view, setView] = useState<'list' | 'map'>('list');
const { filters, setFilters, applyFilters } = useHousingMapFilters();
```

**3. Fetch Data:**
```typescript
const { data: homes } = useQuery({
  queryKey: ['/api/host-homes', { city, ...filters }],
});

const filteredHomes = applyFilters(homes || []);
```

**4. Render UI:**
```typescript
<Tabs value={view} onValueChange={setView}>
  <TabsList>
    <TabsTrigger value="list">List View</TabsTrigger>
    <TabsTrigger value="map">Map View</TabsTrigger>
  </TabsList>
  
  <TabsContent value="list">
    <HostHomesList homes={filteredHomes} city={city} />
  </TabsContent>
  
  <TabsContent value="map">
    <HousingMap homes={filteredHomes} cityLat={lat} cityLng={lng} />
  </TabsContent>
</Tabs>
```

---

## 🔐 User Permissions

### Role-Based Access

| Role | Browse | Book | List Property | Manage Own | Admin Functions |
|------|--------|------|---------------|------------|-----------------|
| **Guest (unauthenticated)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Host (verified)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

### City-Specific Features

**City Groups Only:**
- Housing tab visible on group detail page
- City-filtered listings automatically
- Local/Visitor status-based recommendations

**Professional Groups:**
- No housing tab
- Housing available via main marketplace only

---

## 🔄 Data Flow

### User Searches for Housing

```
User visits city group → Housing tab
    ↓
GET /api/host-homes?city=Buenos%20Aires
    ↓
Filter homes by city in database
    ↓
Return homes with coordinates
    ↓
Render HostHomesList or HousingMap
    ↓
User clicks "View Details"
    ↓
Navigate to /housing/:id (future)
```

### Host Lists Property

```
User clicks "Become a Host"
    ↓
Navigate to /host-onboarding
    ↓
Complete 8-step wizard
    ↓
Upload photos → Cloudinary
    ↓
Geocode address → OpenStreetMap
    ↓
POST /api/host-homes
    ↓
Save to database with coordinates
    ↓
Property appears in marketplace
```

---

## 📊 Performance Metrics

### Current Performance

- **Marketplace Load:** < 1.2s (100 listings)
- **Map Rendering:** < 800ms (50 markers)
- **Search Query:** < 300ms
- **Image Load:** Progressive with lazy loading
- **API Response:** < 200ms (cached), < 1s (database)

### Optimization Features

- ✅ Lazy loading for images
- ✅ Virtual scrolling for large lists (planned)
- ✅ React Query caching (5min staleTime)
- ✅ Debounced search input
- ✅ Marker clustering for dense areas (planned)

---

## 🧪 Testing

### Test Coverage

**Unit Tests:**
- HostHomesList component rendering
- Filter logic validation
- Price calculation
- Date availability checking

**E2E Tests:**
- Complete host onboarding flow
- Guest search and booking
- Map interaction
- Filter application

**Test Files:**
```
tests/e2e/housing/
├── host-onboarding.e2e.test.ts
├── guest-onboarding.e2e.test.ts
├── marketplace.e2e.test.ts
└── group-housing-tab.e2e.test.ts  (planned)
```

---

## 🐛 Known Issues

1. **Mobile Map Performance** - Loading can be slow on 3G connections
2. **Image Optimization** - Some host photos need better compression
3. **Filter Persistence** - Filters don't persist across page navigations
4. **Clustering** - No marker clustering for 100+ listings yet

**Tracked In:** Project issue tracker

---

## 🚀 Future Enhancements

### Planned Features

1. **Smart Recommendations** - AI-powered host matching based on preferences
2. **Instant Booking** - One-click booking for verified hosts
3. **Calendar Sync** - iCal integration for availability
4. **Reviews & Ratings** - Guest feedback system
5. **Favorite Searches** - Save search criteria
6. **Price Alerts** - Notifications when prices drop
7. **Virtual Tours** - 360° property views
8. **Chat Integration** - Direct host messaging

### Technical Roadmap

- [ ] Implement review/rating system
- [ ] Add calendar availability blocking
- [ ] Integrate payment processing (Stripe)
- [ ] Build admin moderation dashboard
- [ ] Add ML-based pricing suggestions
- [ ] Implement dispute resolution workflow

---

## 📖 Related Documentation

### Housing Specific
- [Housing Marketplace](./housing-marketplace.md)
- [Housing on Group Pages](./housing-on-group-page.md)
- [Host Onboarding](./HostOnboarding.md)
- [Guest Onboarding](./GuestOnboarding.md)
- [Guest Step 1: Accommodation](./guest/guest-step1-accommodation.md)
- [Guest Step 4: Location](./guest/guest-step4-location.md)
- [Marketplace Route Fix](./marketplace-route-fix.md) ⚠️ Oct 5, 2025 - 404 fix

### System Integration
- [Group Detail Page](../social/GroupDetailPageMT.md)
- [Geocoding System](../geocoding-system/index.md)
- [Map Components](../geocoding-system/map-components.md)
- [Unified Map Components](../components/UnifiedMapComponents.md)
- [ESA Framework](/docs/ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE.md)

---

## 🆘 Support & Contributing

**For Questions:**
- Check this documentation first
- Review ESA framework guidelines
- Consult team via project communication channels

**For Bug Reports:**
- Include steps to reproduce
- Attach screenshots if UI-related
- Note browser and device information

**For Feature Requests:**
- Describe user problem being solved
- Provide use cases and examples
- Consider ESA framework alignment

---

*Last Updated: October 4, 2025*  
*Documentation Version: 1.0.0*  
*Maintained By: Housing & Marketplace Team*
