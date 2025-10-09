# Housing on Group Pages

## Overview

**Route:** `/group/:slug` → Housing Tab  
**Availability:** City Groups Only (type === 'city')  
**Purpose:** City-specific housing listings integration within community group pages  
**ESA Framework:** Layer 22 (Group Management) + Layer 27 (Marketplace)

The Housing tab on city group pages provides seamless access to local accommodation listings, enabling visitors and locals to find housing within the tango community context.

---

## 🎯 Key Features

### Current Implementation

✅ **City-Filtered Listings** - Automatically shows homes in the group's city  
✅ **List View** - Grid display of available housing with photos and details  
✅ **Friend Connections** - Highlights homes hosted by friends or community members  
✅ **Super Admin Actions** - Quick access to host onboarding  
✅ **Empty State Handling** - Helpful messaging when no listings exist  

### Planned Enhancements

🔄 **Map/List Toggle** - Switch between HostHomesList and HousingMap views  
🔄 **Filter Panel** - Compact mode filters for price, room type, guests  
🔄 **Housing Statistics** - Total homes, price range, availability count  
🔄 **Quick Actions** - "Become a Host", "View All Marketplace", "Search Preferences"

---

## 📍 Tab Visibility

### Conditional Rendering

The Housing tab **only appears for city groups**, not professional groups:

```typescript
// GroupDetailPageMT.tsx
const tabs = [
  { id: 'posts', label: 'Posts', icon: MessageCircle },
  { id: 'about', label: 'About', icon: Info },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'community-hub', label: 'Community Hub', icon: MapPin },
  
  // CITY-SPECIFIC TABS
  ...(group.type === 'city' ? [
    { id: 'housing', label: 'Housing', icon: Home },
    { id: 'recommendations', label: 'Recommendations', icon: Star },
  ] : [])
];
```

### URL Parameters

Users can deep-link directly to the housing tab:

```
/group/buenos-aires-tango?tab=housing
```

The tab parameter is read on mount and sets the active tab automatically.

---

## 🏗️ Technical Implementation

### Current renderHousingTab()

**Location:** `client/src/pages/GroupDetailPageMT.tsx` (lines 1124-1151)

```typescript
const renderHousingTab = () => {
  return (
    <div className="space-y-6">
      {/* Super Admin Quick Action */}
      {user?.roles?.includes('super_admin') && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Super Admin Actions</span>
          </div>
          <Button
            onClick={() => setLocation('/host-onboarding')}
            className="mt-action-button mt-action-button-primary"
          >
            <Home className="h-4 w-4" />
            Start Host Onboarding
          </Button>
        </div>
      )}
      
      {/* Housing Listings */}
      <HostHomesList 
        groupSlug={group.slug}
        city={group.city}
        showFilters={false}  // Currently disabled
      />
    </div>
  );
};
```

### Components Used

**1. HostHomesList**  
**Location:** `client/src/components/Housing/HostHomesList.tsx`

```typescript
interface HostHomesListProps {
  groupSlug?: string;
  city?: string;
  showFilters?: boolean;  // Set to false on group pages
  friendFilter?: 'all' | 'direct' | 'friend-of-friend' | 'community';
}
```

**Features:**
- Fetches homes from `/api/host-homes?city={city}&groupSlug={slug}`
- Grid layout with responsive columns (1/2/3 cols)
- Friend connection badges ("Your friend", "Friend of friend")
- Price display, room type, guest capacity
- "Request Stay" button (routes to `/guest-onboarding?hostHomeId={id}`)
- Empty state with helpful messaging

**2. HousingMap** (Not Yet Integrated)  
**Location:** `client/src/components/maps/HousingMap.tsx`

```typescript
interface HousingMapProps {
  homes: HostHome[];
  cityLat?: number;
  cityLng?: number;
  onHomeClick?: (home: HostHome) => void;
}
```

**Will provide:**
- Turquoise gradient markers with home icons
- Popup details with price, guests, host info
- "View Details" button in popup
- Auto-fit bounds to show all markers
- Legend with listing count

---

## 🎨 MT Ocean Theme Styling

### Current Design

**Super Admin Card:**
```css
background: #F3E8FF;        /* Purple 50 */
border: 2px solid #DDD6FE;  /* Purple 200 */
color: #6B21A8;             /* Purple 900 */
```

**Housing Listings:**
- Grid cards with white background
- Turquoise hover effects (`border-turquoise-500`)
- Glassmorphic friend badges
- Gradient price badges (black/70% opacity)
- MT Ocean gradient host avatars

### Planned Enhancements

**View Toggle:**
```css
.view-toggle-button {
  background: linear-gradient(135deg, #38B2AC 0%, #06B6D4 100%);
  border-radius: 8px;
  transition: all 0.3s ease;
}
```

**Statistics Card:**
```css
.housing-stats-card {
  background: linear-gradient(135deg, 
    rgba(94, 234, 212, 0.1) 0%, 
    rgba(6, 182, 212, 0.05) 100%
  );
  border: 2px solid rgba(94, 234, 212, 0.3);
  backdrop-filter: blur(10px);
}
```

---

## 🔐 User Permissions & Context

### Role-Based Features

| User Type | Can View | Can Book | Can List | Special Features |
|-----------|----------|----------|----------|------------------|
| **Unauthenticated** | ✅ | ❌ | ❌ | Browse only |
| **Visitor** | ✅ | ✅ | ❌ | "Request Stay" button |
| **Local Resident** | ✅ | ✅ | ✅ | "Become a Host" CTA |
| **Super Admin** | ✅ | ✅ | ✅ | Quick host onboarding access |

### City RBAC Integration

Uses `CityRbacService` to determine user context:

```typescript
const userContext = CityRbacService.getUserCityContext(
  user,
  group.city || '',
  userMemberships,
  userFollowing,
  group.id
);

// Returns: { isLocal, isVisitor, hasGuestProfile, hasHostProfile }
```

**Display Logic:**
- **Locals without host profile** → Show "Become a Host" CTA
- **Visitors without guest profile** → Show "Complete Guest Profile" prompt
- **Super admins** → Show host onboarding quick action
- **All users** → Display relevant listings based on city

---

## 🔄 Data Flow

### Loading Sequence

```
1. User clicks Housing tab
   ↓
2. URL updates to ?tab=housing
   ↓
3. renderHousingTab() executes
   ↓
4. HostHomesList mounts
   ↓
5. Query: GET /api/host-homes?city={group.city}&groupSlug={group.slug}
   ↓
6. Backend filters homes by city
   ↓
7. Returns homes with coordinates, photos, host data
   ↓
8. React Query caches response (5min staleTime)
   ↓
9. Render grid of housing cards
   ↓
10. User clicks "Request Stay" → Navigate to /guest-onboarding
```

### API Request Example

```bash
GET /api/host-homes?city=Buenos%20Aires&groupSlug=buenos-aires-tango
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Cozy Studio in Palermo",
      "city": "Buenos Aires",
      "lat": -34.5889,
      "lng": -58.4164,
      "pricePerNight": 45,
      "maxGuests": 2,
      "roomType": "private_room",
      "photos": [{"url": "...", "displayOrder": 0}],
      "host": {
        "id": 5,
        "name": "María González",
        "profileImage": "..."
      },
      "friendConnection": "direct"
    }
  ]
}
```

---

## 📊 Filter System

### Current State

**Filters are currently disabled** on group pages (`showFilters={false}`), but HostHomesList supports:

```typescript
const filters = {
  priceRange: { min: 0, max: 500 },
  roomType: 'all' | 'entire_place' | 'private_room' | 'shared_room',
  maxGuests: number,
  friendFilter: 'all' | 'friends' | 'friends-of-friends'
};
```

### Planned Integration

**Compact Mode Filters** (for group pages):

```typescript
<HousingMapFilters 
  filters={filters}
  onFiltersChange={setFilters}
  compact={true}  // Popover mode for group pages
/>
```

**Features:**
- Popover trigger button with filter count badge
- Price range slider
- Room type selector
- Guest count input
- Friend connection toggle
- "Clear All" button

---

## 🎯 User Journeys

### Journey 1: Visitor Finds Housing

```
1. User visits city group (e.g., /group/buenos-aires-tango)
2. User is identified as visitor (not from Buenos Aires)
3. User clicks "Housing" tab
4. Sees listings in Buenos Aires
5. Notices friend's listing highlighted with badge
6. Clicks "Request Stay" on friend's listing
7. Redirected to /guest-onboarding?hostHomeId=123
8. Completes guest profile
9. Booking request sent to host
```

### Journey 2: Local Becomes Host

```
1. Local user visits their city group
2. Clicks "Housing" tab
3. Sees message "No listings yet" or few listings
4. RBAC detects user is local without host profile
5. Sees "Become a Host" CTA card
6. Clicks "Start Host Onboarding"
7. Redirected to /host-onboarding
8. Completes 8-step wizard
9. Property listed in city group housing tab
```

### Journey 3: Super Admin Adds Listing

```
1. Super admin visits any city group
2. Clicks "Housing" tab
3. Sees purple "Super Admin Actions" card at top
4. Clicks "Start Host Onboarding"
5. Completes host flow for any city
6. Listing appears in relevant city group
```

---

## 🚀 Planned Enhancements

### Phase 1: View Toggle (In Progress)

**Implementation:**
```typescript
const [housingView, setHousingView] = useState<'list' | 'map'>('list');

return (
  <div className="space-y-6">
    {/* View Toggle */}
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Housing in {group.city}</h3>
      <Tabs value={housingView} onValueChange={setHousingView}>
        <TabsList>
          <TabsTrigger value="list" data-testid="housing-view-list">
            <List className="h-4 w-4 mr-2" />
            List
          </TabsTrigger>
          <TabsTrigger value="map" data-testid="housing-view-map">
            <MapPin className="h-4 w-4 mr-2" />
            Map
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
    
    {/* Render based on view */}
    {housingView === 'list' ? (
      <HostHomesList {...props} />
    ) : (
      <HousingMap 
        homes={homes}
        cityLat={group.latitude}
        cityLng={group.longitude}
      />
    )}
  </div>
);
```

### Phase 2: Housing Statistics

**Statistics Card:**
```typescript
<div className="housing-stats-card p-6 rounded-lg">
  <div className="grid grid-cols-4 gap-6">
    <div className="text-center">
      <Home className="h-8 w-8 mx-auto mb-2 text-turquoise-500" />
      <div className="text-2xl font-bold">{totalHomes}</div>
      <div className="text-sm text-gray-600">Total Homes</div>
    </div>
    <div className="text-center">
      <DollarSign className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
      <div className="text-2xl font-bold">${avgPrice}</div>
      <div className="text-sm text-gray-600">Avg/Night</div>
    </div>
    <div className="text-center">
      <Star className="h-8 w-8 mx-auto mb-2 text-pink-500" />
      <div className="text-2xl font-bold">{avgRating}</div>
      <div className="text-sm text-gray-600">Avg Rating</div>
    </div>
    <div className="text-center">
      <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
      <div className="text-2xl font-bold">{availableHomes}</div>
      <div className="text-sm text-gray-600">Available</div>
    </div>
  </div>
</div>
```

### Phase 3: Quick Actions

**Action Buttons:**
```typescript
<div className="flex gap-3">
  <Button onClick={() => setLocation('/host-onboarding')}>
    <Home className="h-4 w-4 mr-2" />
    Become a Host
  </Button>
  <Button variant="outline" onClick={() => setLocation('/housing-marketplace')}>
    <Search className="h-4 w-4 mr-2" />
    View All Marketplace
  </Button>
  <Button variant="outline" onClick={() => setLocation('/guest-onboarding')}>
    <Settings className="h-4 w-4 mr-2" />
    Search Preferences
  </Button>
</div>
```

---

## 🧪 Testing

### Current Test Coverage

**Manual Tests:**
- ✅ Tab appears for city groups only
- ✅ Listings filtered by city
- ✅ Friend connection badges display correctly
- ✅ Empty state shows helpful message
- ✅ Super admin card appears for admins only
- ✅ "Request Stay" button navigates properly

### Planned E2E Tests

**Test File:** `tests/e2e/group-housing-tab.e2e.test.ts`

```typescript
describe('Group Page Housing Tab', () => {
  test('shows housing tab for city groups only', async ({ page }) => {
    await page.goto('/group/buenos-aires-tango');
    await expect(page.locator('[data-testid="tab-housing"]')).toBeVisible();
    
    await page.goto('/group/tango-teachers-network');
    await expect(page.locator('[data-testid="tab-housing"]')).not.toBeVisible();
  });
  
  test('displays city-filtered listings', async ({ page }) => {
    await page.goto('/group/buenos-aires-tango?tab=housing');
    await expect(page.locator('text=Buenos Aires')).toHaveCount.greaterThan(0);
  });
  
  test('toggles between list and map views', async ({ page }) => {
    await page.goto('/group/buenos-aires-tango?tab=housing');
    await page.click('[data-testid="housing-view-map"]');
    await expect(page.locator('[data-testid="unified-map-container"]')).toBeVisible();
  });
});
```

---

## 📖 Related Documentation

### Housing System
- [Housing System Hub](./index.md) - Complete housing documentation
- [Housing Marketplace](./housing-marketplace.md) - Main marketplace page
- [Host Onboarding](./HostOnboarding.md) - Property listing flow
- [Guest Onboarding](./GuestOnboarding.md) - Guest preferences

### Integration Points
- [Group Detail Page](../social/GroupDetailPageMT.md) - Parent component
- [City RBAC Service](../social/city-group-auto-creation.md) - User context logic
- [Geocoding System](../geocoding-system/index.md) - Map integration
- [HousingMap Component](../geocoding-system/map-components.md) - Map view

### Framework
- [ESA Layer 22: Group Management](../esa-layers/layer-22-group-management.md)
- [ESA Layer 27: Marketplace](../esa-layers/layer-27-marketplace.md)
- [ESA Framework Guide](/docs/ESA.md)

---

## 🆘 Troubleshooting

### Issue: Housing tab not appearing

**Check:**
1. Group type is 'city' (`group.type === 'city'`)
2. Tab is included in conditional tabs array
3. No TypeScript errors in browser console

### Issue: No listings showing

**Check:**
1. API endpoint returns data for the city
2. `group.city` matches listing city exactly
3. Network tab shows successful API response
4. React Query cache is not stale

### Issue: Friend badges not showing

**Check:**
1. User is authenticated
2. `friendConnection` field exists in API response
3. Social graph populated (friends/followers)
4. RBAC service calculating connections

---

*Last Updated: October 4, 2025*  
*Status: Core features implemented, enhancements in progress*  
*Maintained By: Housing & Marketplace Team*
