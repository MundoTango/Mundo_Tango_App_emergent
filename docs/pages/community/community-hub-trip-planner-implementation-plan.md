# Community Hub Trip Planner - ESA Implementation Plan

**Version:** 1.0  
**Last Updated:** October 7, 2025  
**Status:** 📋 Planning Phase  
**Framework:** ESA LIFE CEO 61x21 Master Orchestration  
**Design System:** Aurora Tide

---

## Executive Summary

**Objective:** Transform the Community Hub from a passive information display into an intelligent trip planning tool that aggregates Events, Housing, and Recommendations into a unified, date-driven itinerary builder with deep integration to the user's Travel Module.

**Core Value Proposition:**  
*"I'm planning to be in Buenos Aires for 2 weeks - where do I stay, what do I do, and where do I dance?"*

### Key Features
- ✅ **Trip Dates First:** Users enter destination + dates before seeing any results
- ✅ **Unified Trip View:** Single interface consolidating Events, Housing, Recommendations
- ✅ **Itinerary Builder:** "Plan Trip" tab with day-by-day schedule
- ✅ **Smart Filtering:** Duration slider, budget selector, interests, travel style
- ✅ **Map Layer Toggles:** Show/hide Events, Housing, Recommendations markers
- ✅ **Travel Module Integration:** Saved trips sync to user profile
- ✅ **Aurora Tide Design:** Full glassmorphic compliance

---

## ESA Framework Layer Mapping

### Primary Layers

| Layer | Name | Role in Trip Planner |
|-------|------|---------------------|
| **Layer 21** | User Management | Travel preferences, saved trips |
| **Layer 22** | Group Management | City-specific community hub |
| **Layer 23** | Events Management | Event filtering by trip dates |
| **Layer 28** | Marketplace | Housing availability filtering |
| **Layer 27** | Recommendations | Interest-based recommendations |
| **Layer 31-46** | Intelligence Infrastructure | **Future:** AI trip planning agent |
| **Layer 15** | Search & Discovery | Elasticsearch trip search |
| **Layer 11** | Real-time Features | Live availability updates |
| **Layer 14** | File Management | Itinerary PDF export |

### Secondary Layers
- **Layer 8:** Client Framework (React state management)
- **Layer 10:** Component Library (shadcn/ui date pickers, sliders)
- **Layer 16:** Notifications (Trip reminders, availability alerts)
- **Layer 18:** Analytics (Trip planning funnel tracking)

---

## Architecture Overview

### Current State (Before)
```
GroupDetailPageMT.tsx
├── Tab: Posts
├── Tab: Events (all events)
├── Tab: Members
├── Tab: Community Hub
│   ├── Interactive Map
│   ├── Housing List
│   └── Recommendations List
└── Tab: Housing (duplicate)
```

### New Architecture (After)
```
GroupDetailPageMT.tsx
├── Tab: Posts
├── Tab: Events
├── Tab: Members
├── Tab: Trip Planner (replaces Community Hub)
│   ├── 🎯 Trip Configuration (dates, filters)
│   ├── 🗺️ Unified Map (layer toggles)
│   ├── 📋 Results Grid (Events + Housing + Recommendations)
│   └── 📅 Itinerary View (day-by-day schedule)
└── Tab: Housing
```

### Data Flow
```
1. User enters trip dates + filters
   ↓
2. Parallel API calls:
   - GET /api/events?city=:city&startDate=:start&endDate=:end
   - GET /api/housing?city=:city&available=:start-:end
   - GET /api/recommendations?city=:city&interests=:interests&budget=:budget
   ↓
3. Aggregate results with unified scoring
   ↓
4. Display on map (with layer toggles) + grid view
   ↓
5. User adds items to itinerary
   ↓
6. Save to Travel Module (POST /api/travel-plans)
```

---

## Component Structure

### New Components

#### 1. `TripPlannerHub.tsx` (Main Container)
```typescript
interface TripPlannerHubProps {
  citySlug: string;
  cityName: string;
  cityCoordinates: [number, number];
}

export function TripPlannerHub({ citySlug, cityName, cityCoordinates }: TripPlannerHubProps) {
  const [tripConfig, setTripConfig] = useState<TripConfig | null>(null);
  const [view, setView] = useState<'map' | 'grid' | 'itinerary'>('grid');
  const [mapLayers, setMapLayers] = useState({
    events: true,
    housing: true,
    recommendations: true
  });
  
  return (
    <div className="trip-planner-hub">
      {!tripConfig ? (
        <TripConfigurationWizard onComplete={setTripConfig} />
      ) : (
        <>
          <TripFiltersBar config={tripConfig} onChange={setTripConfig} />
          <ViewToggle view={view} onChange={setView} />
          <MapLayerToggles layers={mapLayers} onChange={setMapLayers} />
          
          {view === 'map' && (
            <UnifiedTripMap 
              config={tripConfig} 
              layers={mapLayers}
              center={cityCoordinates}
            />
          )}
          {view === 'grid' && (
            <TripResultsGrid config={tripConfig} />
          )}
          {view === 'itinerary' && (
            <ItineraryBuilder config={tripConfig} />
          )}
        </>
      )}
    </div>
  );
}
```

#### 2. `TripConfigurationWizard.tsx` (Date + Filters Entry)
```typescript
interface TripConfig {
  city: string;
  startDate: Date;
  endDate: Date;
  duration: number; // calculated from dates
  budget: 'economy' | 'mid-range' | 'luxury';
  interests: string[]; // ['dancing', 'sightseeing', 'food', 'culture']
  travelStyle: 'solo' | 'couple' | 'group';
  travelers: number;
}

export function TripConfigurationWizard({ onComplete }: { onComplete: (config: TripConfig) => void }) {
  // Aurora Tide: Glassmorphic wizard with step indicators
  // Step 1: Date range picker (required first)
  // Step 2: Duration auto-calculated, show slider for adjustment
  // Step 3: Budget selector (3 glassmorphic cards)
  // Step 4: Interests multi-select (checkbox cards)
  // Step 5: Travel style selector
  // Submit → onComplete(config)
}
```

#### 3. `TripFiltersBar.tsx` (Inline Filters)
```typescript
export function TripFiltersBar({ config, onChange }: TripFiltersBarProps) {
  return (
    <GlassCard depth={2} className="sticky top-0 z-10 p-4">
      <div className="flex flex-wrap gap-4">
        {/* Trip Summary */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(config.startDate, 'MMM d')} - {format(config.endDate, 'MMM d')}</span>
          <Badge>{config.duration} days</Badge>
        </div>
        
        {/* Quick Filters */}
        <Select value={config.budget} onValueChange={(val) => onChange({...config, budget: val})}>
          <SelectTrigger><DollarSign />{config.budget}</SelectTrigger>
        </Select>
        
        <InterestsFilter selected={config.interests} onChange={(interests) => onChange({...config, interests})} />
        
        {/* Edit Trip Button */}
        <Button variant="outline" onClick={resetWizard}>
          <Edit className="h-4 w-4" /> Edit Trip
        </Button>
      </div>
    </GlassCard>
  );
}
```

#### 4. `UnifiedTripMap.tsx` (Map with Layer Toggles)
```typescript
import { createCustomMarker, MARKER_ICONS, MAP_COLORS } from '@/utils/leafletConfig';
import UnifiedMapBase, { useMapMarkers } from '@/components/maps/UnifiedMapBase';

export function UnifiedTripMap({ config, layers, center, onAddToItinerary }: UnifiedTripMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const { clearMarkers, addMarker, fitBoundsToMarkers } = useMapMarkers();
  
  const { data: events } = useQuery({ 
    queryKey: ['/api/events', config],
    enabled: layers.events 
  });
  const { data: housing } = useQuery({ 
    queryKey: ['/api/housing', config],
    enabled: layers.housing 
  });
  const { data: recommendations } = useQuery({ 
    queryKey: ['/api/recommendations', config],
    enabled: layers.recommendations 
  });
  
  useEffect(() => {
    if (!map) return;
    clearMarkers();
    
    // EVENTS: Use existing calendar icon (like EventMap.tsx)
    if (layers.events) {
      events?.forEach(event => {
        if (event.latitude && event.longitude) {
          const icon = createCustomMarker(MAP_COLORS.event, MARKER_ICONS.calendar);
          const marker = L.marker([event.latitude, event.longitude], { icon }).addTo(map);
          
          // Popup with event card + "Add to Itinerary" button
          const popupContent = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-semibold text-lg mb-2">${event.title}</h3>
              <div class="text-sm text-gray-600 space-y-1 mb-3">
                <div>${new Date(event.startDate).toLocaleDateString()}</div>
                <div>${event.location}</div>
              </div>
              <div class="flex gap-2">
                <button data-action="view-details" data-id="${event.id}" data-type="event"
                  class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90">
                  View Details
                </button>
                <button data-action="add-itinerary" data-id="${event.id}" data-type="event"
                  class="flex-1 bg-white dark:bg-gray-800 border border-cyan-500 text-cyan-600 px-3 py-1.5 rounded-lg text-sm hover:bg-cyan-50">
                  Add to Trip
                </button>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          addMarker(marker);
        }
      });
    }
    
    // HOUSING: Use existing home icon (like HousingMap.tsx)
    if (layers.housing) {
      housing?.forEach(home => {
        if (home.lat && home.lng) {
          const icon = createCustomMarker(MAP_COLORS.housing, MARKER_ICONS.home);
          const marker = L.marker([home.lat, home.lng], { icon }).addTo(map);
          
          const popupContent = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-semibold text-lg mb-2">${home.title}</h3>
              <div class="text-sm text-gray-600 space-y-1 mb-3">
                <div>${home.address}</div>
                <div>$${home.pricePerNight}/night • ${home.maxGuests} guests</div>
              </div>
              <div class="flex gap-2">
                <button data-action="view-details" data-id="${home.id}" data-type="housing"
                  class="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90">
                  View Details
                </button>
                <button data-action="add-itinerary" data-id="${home.id}" data-type="housing"
                  class="flex-1 bg-white dark:bg-gray-800 border border-turquoise-500 text-turquoise-600 px-3 py-1.5 rounded-lg text-sm hover:bg-turquoise-50">
                  Add to Trip
                </button>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          addMarker(marker);
        }
      });
    }
    
    // RECOMMENDATIONS: Use existing star icon (like RecommendationsMap.tsx)
    if (layers.recommendations) {
      recommendations?.forEach(rec => {
        if (rec.lat && rec.lng) {
          const icon = createCustomMarker(MAP_COLORS.recommendation, MARKER_ICONS.star);
          const marker = L.marker([rec.lat, rec.lng], { icon }).addTo(map);
          
          const popupContent = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-semibold text-lg mb-2">${rec.title}</h3>
              <div class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white mb-2">
                ${rec.type}
              </div>
              <div class="text-sm text-gray-600 mb-3">${rec.address || rec.city}</div>
              <div class="flex gap-2">
                <button data-action="view-details" data-id="${rec.id}" data-type="recommendation"
                  class="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90">
                  View Details
                </button>
                <button data-action="add-itinerary" data-id="${rec.id}" data-type="recommendation"
                  class="flex-1 bg-white dark:bg-gray-800 border border-pink-500 text-pink-600 px-3 py-1.5 rounded-lg text-sm hover:bg-pink-50">
                  Add to Trip
                </button>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          addMarker(marker);
        }
      });
    }
    
    // Handle button clicks via event delegation
    map.on('popupopen', () => {
      document.querySelectorAll('[data-action="view-details"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const id = target.dataset.id;
          const type = target.dataset.type;
          // Navigate to detail page
          window.location.href = `/${type}s/${id}`;
        });
      });
      
      document.querySelectorAll('[data-action="add-itinerary"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const id = parseInt(target.dataset.id!);
          const type = target.dataset.type as 'event' | 'housing' | 'recommendation';
          onAddToItinerary({ id, type });
        });
      });
    });
    
    fitBoundsToMarkers(map);
  }, [map, events, housing, recommendations, layers]);
  
  return (
    <UnifiedMapBase 
      center={center}
      zoom={13}
      onMapReady={setMap}
    />
  );
}
```

**Marker Icons (Reusing Existing):**
- **Events:** 📅 Calendar icon (`MARKER_ICONS.calendar`, cyan gradient)
- **Housing:** 🏠 Home icon (`MARKER_ICONS.home`, turquoise gradient)  
- **Recommendations:** ⭐ Star icon (`MARKER_ICONS.star`, pink gradient)

#### 5. `MapLayerToggles.tsx` (Layer Visibility Control)
```typescript
export function MapLayerToggles({ layers, onChange }: MapLayerTogglesProps) {
  return (
    <GlassCard depth={1} className="absolute top-4 right-4 z-[1000] p-3">
      <p className="text-sm font-medium mb-2">Map Layers</p>
      
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox 
            checked={layers.events}
            onCheckedChange={(checked) => onChange({...layers, events: checked})}
          />
          <Calendar className="h-4 w-4 text-cyan-500" />
          <span className="text-sm">Events</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox 
            checked={layers.housing}
            onCheckedChange={(checked) => onChange({...layers, housing: checked})}
          />
          <Home className="h-4 w-4 text-purple-500" />
          <span className="text-sm">Housing</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox 
            checked={layers.recommendations}
            onCheckedChange={(checked) => onChange({...layers, recommendations: checked})}
          />
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">Recommendations</span>
        </label>
      </div>
    </GlassCard>
  );
}
```

#### 6. `TripResultsGrid.tsx` (Unified Results Display)
```typescript
export function TripResultsGrid({ config }: TripResultsGridProps) {
  const { data: aggregatedResults } = useQuery({
    queryKey: ['/api/trip-planner/results', config],
    queryFn: () => fetchAggregatedResults(config)
  });
  
  return (
    <div className="space-y-6">
      {/* Events Section */}
      <section>
        <h3 className="text-xl font-bold mb-4">Events During Your Trip</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregatedResults?.events.map(event => (
            <EventCard 
              key={event.id} 
              event={event}
              onAddToItinerary={(e) => addToItinerary(e, 'event')}
            />
          ))}
        </div>
      </section>
      
      {/* Housing Section */}
      <section>
        <h3 className="text-xl font-bold mb-4">Available Housing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregatedResults?.housing.map(home => (
            <HousingCard 
              key={home.id} 
              home={home}
              tripDates={config}
              onSelect={(h) => addToItinerary(h, 'housing')}
            />
          ))}
        </div>
      </section>
      
      {/* Recommendations Section */}
      <section>
        <h3 className="text-xl font-bold mb-4">Recommended Places</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregatedResults?.recommendations.map(rec => (
            <RecommendationCard 
              key={rec.id} 
              rec={rec}
              onAddToItinerary={(r) => addToItinerary(r, 'recommendation')}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
```

#### 7. `ItineraryBuilder.tsx` (Day-by-Day Schedule)
```typescript
export function ItineraryBuilder({ config }: ItineraryBuilderProps) {
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const tripDays = eachDayOfInterval({ start: config.startDate, end: config.endDate });
  
  const saveToTravelModule = useMutation({
    mutationFn: async () => {
      return fetch('/api/travel-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${config.city} Trip - ${format(config.startDate, 'MMM yyyy')}`,
          city: config.city,
          startDate: config.startDate,
          endDate: config.endDate,
          budget: config.budget,
          travelStyle: config.travelStyle,
          itinerary: itineraryItems,
          syncToProfile: true // Key integration flag
        })
      });
    },
    onSuccess: () => {
      toast({ title: '✅ Trip saved to your Travel Module!' });
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Your Itinerary</h3>
        <Button onClick={() => saveToTravelModule.mutate()}>
          <Save className="h-4 w-4 mr-2" />
          Save My Trip
        </Button>
      </div>
      
      {tripDays.map((day, index) => (
        <GlassCard key={day.toString()} depth={2} className="p-4">
          <h4 className="font-semibold mb-3">
            Day {index + 1}: {format(day, 'EEEE, MMMM d')}
          </h4>
          
          {/* Morning / Afternoon / Evening sections */}
          <div className="space-y-4">
            <TimeSlot 
              period="morning" 
              items={itineraryItems.filter(i => i.day === index && i.period === 'morning')}
              onAdd={(item) => addItemToDay(index, 'morning', item)}
            />
            <TimeSlot 
              period="afternoon" 
              items={itineraryItems.filter(i => i.day === index && i.period === 'afternoon')}
              onAdd={(item) => addItemToDay(index, 'afternoon', item)}
            />
            <TimeSlot 
              period="evening" 
              items={itineraryItems.filter(i => i.day === index && i.period === 'evening')}
              onAdd={(item) => addItemToDay(index, 'evening', item)}
            />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
```

---

## API Endpoints

### New Endpoints

#### 1. Aggregated Trip Results
```typescript
GET /api/trip-planner/results
Query Parameters:
  - city: string (required)
  - startDate: ISO date (required)
  - endDate: ISO date (required)
  - budget: 'economy' | 'mid-range' | 'luxury'
  - interests: string[] (comma-separated)
  - travelStyle: 'solo' | 'couple' | 'group'

Response:
{
  events: Event[], // filtered by date range
  housing: Housing[], // filtered by availability
  recommendations: Recommendation[], // filtered by interests + budget
  stats: {
    totalEvents: number,
    availableHousing: number,
    matchingRecommendations: number
  }
}
```

#### 2. Save Trip to Travel Module
```typescript
POST /api/travel-plans
Body:
{
  name: string,
  city: string,
  startDate: Date,
  endDate: Date,
  budget: string,
  travelStyle: string,
  itinerary: ItineraryItem[],
  syncToProfile: boolean // If true, updates user.travelHistory
}

Response:
{
  success: true,
  tripId: number,
  profileUpdated: boolean
}
```

#### 3. Modified Event Endpoint
```typescript
GET /api/events
Query Parameters:
  - city: string
  - startDate: ISO date (NEW - filter events >= startDate)
  - endDate: ISO date (NEW - filter events <= endDate)
  - groupId: number (optional)

Backend Logic:
const events = await db.query.events.findMany({
  where: and(
    eq(events.city, city),
    gte(events.startDate, startDate),
    lte(events.startDate, endDate) // Event starts within trip window
  ),
  orderBy: asc(events.startDate)
});
```

#### 4. Modified Housing Endpoint
```typescript
GET /api/housing
Query Parameters:
  - city: string
  - available: string (format: "YYYY-MM-DD:YYYY-MM-DD")
  - budget: string (optional)

Backend Logic:
const [tripStart, tripEnd] = available.split(':');
const availableHousing = await db.query.housing.findMany({
  where: and(
    eq(housing.city, city),
    eq(housing.status, 'active'),
    // Check no conflicting bookings
    not(exists(
      db.select().from(bookings).where(
        and(
          eq(bookings.housingId, housing.id),
          or(
            between(bookings.checkIn, tripStart, tripEnd),
            between(bookings.checkOut, tripStart, tripEnd)
          )
        )
      )
    ))
  )
});
```

#### 5. Modified Recommendations Endpoint
```typescript
GET /api/recommendations
Query Parameters:
  - city: string
  - interests: string[] (filter by category)
  - budget: string (filter by priceRange)

Backend Logic:
const recommendations = await db.query.recommendations.findMany({
  where: and(
    eq(recommendations.city, city),
    interests.length > 0 
      ? inArray(recommendations.category, interests)
      : undefined,
    budget 
      ? eq(recommendations.priceRange, budget)
      : undefined
  ),
  orderBy: desc(recommendations.rating)
});
```

---

## Database Schema Updates

### New Tables

#### `travel_plans` (Integration with Travel Module)
```typescript
export const travelPlans = pgTable('travel_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  duration: integer('duration').notNull(), // calculated: days
  budget: varchar('budget', { length: 50 }), // economy/mid-range/luxury
  travelStyle: varchar('travel_style', { length: 50 }), // solo/couple/group
  interests: text('interests').array(), // ['dancing', 'food', 'culture']
  itinerary: jsonb('itinerary'), // Array of ItineraryItem objects
  createdFrom: varchar('created_from', { length: 50 }).default('community-hub'), // tracking source
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

#### `itinerary_items` (Many-to-Many with polymorphic relations)
```typescript
export const itineraryItems = pgTable('itinerary_items', {
  id: serial('id').primaryKey(),
  travelPlanId: integer('travel_plan_id').references(() => travelPlans.id).notNull(),
  day: integer('day').notNull(), // 0-indexed day of trip
  period: varchar('period', { length: 20 }).notNull(), // morning/afternoon/evening
  itemType: varchar('item_type', { length: 50 }).notNull(), // event/housing/recommendation
  itemId: integer('item_id').notNull(), // Polymorphic FK
  notes: text('notes'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow()
});
```

### Schema Updates

#### `users` table (extend existing)
```typescript
// Add to existing users table
travelPreferences: jsonb('travel_preferences'), // { budget, travelStyle, interests }
upcomingTrips: jsonb('upcoming_trips').array(), // Array of travel_plan IDs
```

#### `events` table (add indexes)
```sql
CREATE INDEX idx_events_city_dates ON events(city, start_date);
CREATE INDEX idx_events_date_range ON events(start_date, end_date);
```

#### `housing` table (add availability check)
```typescript
// No schema change needed - availability checked via bookings join
```

---

## UI/UX Removals (Duplicate Elements)

### Elements to DELETE

#### 1. "Join Community" Card/Button
**Location:** `GroupDetailPageMT.tsx` line ~1422-1426  
**Reason:** Redundant - users join via community discovery page

```typescript
// DELETE THIS:
<Button onClick={() => joinGroupMutation.mutate()}>
  {statusText.action === 'Join Community' && 'Join Community'}
</Button>
```

#### 2. "Start Host Onboarding" Duplicate
**Location:** `GroupDetailPageMT.tsx` line ~1459-1462  
**Reason:** Duplicate of "Become a Host" button

**KEEP:**
```typescript
// Line ~1159 - Keep this one
<PulseButton onClick={handleBecomeHost}>
  <Home className="h-4 w-4 mr-2" />
  {t('housing.city_housing_tab.become_host', 'Become a Host')}
</PulseButton>
```

**DELETE:**
```typescript
// Line ~1459 - Remove this duplicate
<Button className="mt-action-button mt-action-button-secondary">
  Start Host Onboarding
</Button>
```

---

## Travel Module Integration

### Integration Points

#### 1. Save Trip → Profile Dashboard
```typescript
// When user saves trip from Community Hub
POST /api/travel-plans → Creates trip record
  ↓
Backend updates user.upcomingTrips array
  ↓
Profile Travel Module (Phase 2) displays trip
  ↓
User can edit/delete from profile
```

#### 2. Profile → Community Hub (Reverse Flow)
```typescript
// User views saved trip in profile
Profile Travel Module → "View in Community Hub" button
  ↓
Navigate to: /groups/:citySlug?tab=trip-planner&tripId=:id
  ↓
Trip Planner Hub loads with saved config
  ↓
User can modify and re-save
```

#### 3. Data Synchronization
```typescript
// Shared data structure
interface TravelPlan {
  id: number;
  city: string;
  dates: { start: Date; end: Date };
  config: TripConfig;
  itinerary: ItineraryItem[];
  source: 'community-hub' | 'profile-module' | 'mobile-app';
}

// Both interfaces use same API
- Community Hub: POST /api/travel-plans (creates)
- Profile Module: GET /api/travel-plans/:userId (reads)
- Profile Module: PUT /api/travel-plans/:id (updates)
```

### Future Audit Note
> **🔔 Travel Module Audit Checkpoint:**  
> When auditing the Travel Module (User Profile Phase 2), verify:
> 1. Community Hub trips appear in profile dashboard
> 2. Trip editing from profile re-opens Community Hub with pre-filled config
> 3. Itinerary syncs bidirectionally (edit in either location)
> 4. Trip deletion removes from both Community Hub and profile
> 5. Mobile app (if built) uses same `/api/travel-plans` endpoints

---

## Aurora Tide Design Compliance

### Glassmorphic Components

#### Trip Configuration Wizard
```typescript
<GlassCard depth={3} className="max-w-2xl mx-auto">
  <StaggerContainer staggerDelay={0.1}>
    <ScaleIn delay={0.1}>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
        {t('tripPlanner.wizard.title', 'Plan Your Trip')}
      </h2>
    </ScaleIn>
    
    {/* Date Picker with MT Ocean gradients */}
    <FadeIn delay={0.2}>
      <Label className="text-gray-700 dark:text-gray-300">
        {t('tripPlanner.wizard.dates', 'When are you visiting?')}
      </Label>
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={setDateRange}
        className="rounded-xl border-cyan-200 dark:border-cyan-500/30"
      />
    </FadeIn>
  </StaggerContainer>
</GlassCard>
```

#### Budget Selector Cards
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {['economy', 'mid-range', 'luxury'].map(budget => (
    <PulseButton key={budget} onClick={() => selectBudget(budget)}>
      <GlassCard 
        depth={selectedBudget === budget ? 2 : 1}
        className={selectedBudget === budget 
          ? 'border-cyan-500 bg-cyan-500/10' 
          : 'hover:border-cyan-500/50'
        }
      >
        <DollarSign className="h-8 w-8 text-cyan-600" />
        <h4 className="font-semibold capitalize">{budget}</h4>
        <p className="text-sm text-gray-600">
          {budgetDescriptions[budget]}
        </p>
      </GlassCard>
    </PulseButton>
  ))}
</div>
```

#### Map Layer Toggles (Glassmorphic Overlay)
```typescript
<GlassCard 
  depth={2} 
  className="absolute top-4 right-4 z-[1000] backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-cyan-200/50"
>
  <p className="text-sm font-semibold mb-3 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
    {t('tripPlanner.mapLayers.title', 'Map Layers')}
  </p>
  {/* Checkbox toggles */}
</GlassCard>
```

### Micro-Interactions

#### Itinerary Item Add Animation
```typescript
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.8, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <ItineraryItem item={item} />
</motion.div>
```

#### Save Trip Confetti
```typescript
const handleSaveTrip = async () => {
  await saveToTravelModule.mutateAsync();
  setShowConfetti(true);
  setTimeout(() => setShowConfetti(false), 5000);
};

{showConfetti && (
  <Confetti
    width={windowSize.width}
    height={windowSize.height}
    colors={['#5EEAD4', '#06B6D4', '#3B82F6']} // MT Ocean colors
  />
)}
```

### Internationalization (i18next)

**New Translation Keys:**
```json
{
  "tripPlanner": {
    "wizard": {
      "title": "Plan Your Trip",
      "dates": "When are you visiting?",
      "duration": "How long are you staying?",
      "budget": "What's your budget?",
      "interests": "What are you interested in?",
      "travelStyle": "Who are you traveling with?"
    },
    "filters": {
      "editTrip": "Edit Trip",
      "showMap": "Show Map",
      "showGrid": "Show Results",
      "showItinerary": "View Itinerary"
    },
    "mapLayers": {
      "title": "Map Layers",
      "events": "Events",
      "housing": "Housing",
      "recommendations": "Recommendations"
    },
    "itinerary": {
      "title": "Your Itinerary",
      "saveTrip": "Save My Trip",
      "morning": "Morning",
      "afternoon": "Afternoon",
      "evening": "Evening",
      "addItem": "Add to itinerary"
    },
    "results": {
      "events": "Events During Your Trip",
      "housing": "Available Housing",
      "recommendations": "Recommended Places"
    }
  }
}
```

---

## Customer Journeys

### Journey CH1: Configure Trip (Date-First Flow)

**Priority:** 🔴 Critical  
**Route:** `/groups/:slug?tab=trip-planner`  
**ESA Layers:** 22, 28, 31

**User Flow:**
1. Navigate to Buenos Aires community hub
2. Click "Trip Planner" tab
3. **Step 1:** Enter trip dates (date range picker)
4. **Step 2:** Duration auto-calculated, confirm with slider
5. **Step 3:** Select budget (3 glassmorphic cards)
6. **Step 4:** Choose interests (multi-select checkboxes)
7. **Step 5:** Select travel style (solo/couple/group)
8. Submit → Wizard closes, results load

**Components:**
- `TripConfigurationWizard.tsx`
- `Calendar` (shadcn/ui with range mode)
- `Slider` (duration adjustment)
- `BudgetSelector.tsx`
- `InterestsMultiSelect.tsx`
- `TravelStyleSelector.tsx`

**Success Criteria:**
- Wizard completes in < 60 seconds
- All fields validated before submit
- Config saved to session storage (persist on refresh)

---

### Journey CH2: Explore Unified Results

**Priority:** 🔴 Critical  
**Route:** `/groups/:slug?tab=trip-planner` (post-config)  
**ESA Layers:** 23, 27, 28

**User Flow:**
1. Trip config complete → Results load
2. View aggregated results (Events + Housing + Recommendations)
3. Toggle between Map / Grid / Itinerary views
4. Use map layer toggles to show/hide categories
5. Click markers → Popup with quick actions
6. Click "Add to Itinerary" on any item

**Components:**
- `TripResultsGrid.tsx`
- `UnifiedTripMap.tsx`
- `MapLayerToggles.tsx`
- `ViewToggle.tsx`

**API Calls:**
```typescript
GET /api/trip-planner/results
  ?city=buenos-aires
  &startDate=2025-11-01
  &endDate=2025-11-14
  &budget=mid-range
  &interests=dancing,food
  &travelStyle=couple
```

**Success Criteria:**
- Results load in < 2 seconds
- Map renders all markers < 1.5 seconds
- Layer toggles respond instantly
- No duplicate items across categories

---

### Journey CH3: Build Itinerary

**Priority:** ⚡ High  
**Route:** `/groups/:slug?tab=trip-planner` (Itinerary view)  
**ESA Layers:** 21, 28, 31

**User Flow:**
1. Switch to "Itinerary" view
2. See day-by-day breakdown (based on trip duration)
3. Add items to specific days + time periods
4. Drag-and-drop to reorder (optional)
5. Add personal notes to items
6. Click "Save My Trip"
7. Trip syncs to Travel Module on profile

**Components:**
- `ItineraryBuilder.tsx`
- `TimeSlot.tsx` (morning/afternoon/evening containers)
- `ItineraryItem.tsx` (draggable cards)
- `SaveTripButton.tsx` (with confetti animation)

**API Calls:**
```typescript
POST /api/travel-plans
{
  name: "Buenos Aires Adventure - Nov 2025",
  city: "buenos-aires",
  startDate: "2025-11-01",
  endDate: "2025-11-14",
  budget: "mid-range",
  travelStyle: "couple",
  itinerary: [
    { day: 0, period: 'evening', itemType: 'event', itemId: 123 },
    { day: 1, period: 'morning', itemType: 'recommendation', itemId: 456 }
  ],
  syncToProfile: true
}
```

**Success Criteria:**
- Itinerary saves in < 1 second
- Confetti animation plays on save
- Trip appears in profile Travel Module immediately
- Toast notification confirms save

---

### Journey CH4: Edit Saved Trip

**Priority:** 🟡 Medium  
**Route:** `/profile?tab=travel` → Link to `/groups/:slug?tab=trip-planner&tripId=:id`  
**ESA Layers:** 21, 22

**User Flow:**
1. User views saved trip in profile
2. Click "Edit Trip" button
3. Navigate back to Community Hub with pre-filled config
4. Modify dates, filters, or itinerary
5. Click "Update Trip"
6. Changes sync back to profile

**Components:**
- Profile Travel Module (existing)
- `TripPlannerHub.tsx` (load from tripId query param)

**API Calls:**
```typescript
GET /api/travel-plans/:tripId → Pre-fill wizard
PUT /api/travel-plans/:tripId → Update existing trip
```

---

## Testing Strategy

### Unit Tests
```typescript
// TripConfigurationWizard.test.tsx
- ✅ Date picker validates range (min 1 day, max 28 days)
- ✅ Budget selector allows only one selection
- ✅ Interests allows multiple selections
- ✅ Submit button disabled until all required fields filled

// UnifiedTripMap.test.tsx
- ✅ Map renders with correct center coordinates
- ✅ Layer toggles show/hide markers
- ✅ Marker popups display correct data
- ✅ Click marker navigates to detail page

// ItineraryBuilder.test.tsx
- ✅ Generates correct number of day cards
- ✅ Add item updates state correctly
- ✅ Save trip mutation called with correct payload
- ✅ Confetti triggers on successful save
```

### Integration Tests
```typescript
// Trip Planning Flow
- ✅ Complete wizard → Results load with filtered data
- ✅ Add items to itinerary → State persists across view changes
- ✅ Save trip → Creates record in database
- ✅ Saved trip appears in profile Travel Module

// API Integration
- ✅ Events filtered by date range
- ✅ Housing filtered by availability (no booking conflicts)
- ✅ Recommendations filtered by interests + budget
```

### E2E Tests (Playwright)
```typescript
test('User can plan and save a trip', async ({ page }) => {
  await page.goto('/groups/buenos-aires-tango?tab=trip-planner');
  
  // Step 1: Enter dates
  await page.click('[data-testid="date-picker"]');
  await page.click('[data-testid="date-2025-11-01"]');
  await page.click('[data-testid="date-2025-11-14"]');
  
  // Step 2: Select budget
  await page.click('[data-testid="budget-mid-range"]');
  
  // Step 3: Choose interests
  await page.check('[data-testid="interest-dancing"]');
  await page.check('[data-testid="interest-food"]');
  
  // Step 4: Travel style
  await page.click('[data-testid="travel-style-couple"]');
  
  // Submit
  await page.click('[data-testid="wizard-submit"]');
  
  // Verify results load
  await expect(page.locator('[data-testid="trip-results"]')).toBeVisible();
  
  // Add item to itinerary
  await page.click('[data-testid="view-itinerary"]');
  await page.click('[data-testid="add-to-itinerary-event-123"]');
  
  // Save trip
  await page.click('[data-testid="save-trip"]');
  await expect(page.locator('.toast-success')).toContainText('Trip saved');
  
  // Verify in profile
  await page.goto('/profile?tab=travel');
  await expect(page.locator('[data-testid="trip-buenos-aires"]')).toBeVisible();
});
```

---

## Performance Optimization (ESA Layer 48)

### Query Optimization
```typescript
// Parallel data fetching
const [events, housing, recommendations] = await Promise.all([
  fetchEvents(config),
  fetchHousing(config),
  fetchRecommendations(config)
]);

// Indexed database queries
CREATE INDEX idx_events_city_dates ON events(city, start_date, end_date);
CREATE INDEX idx_housing_city_status ON housing(city, status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
```

### Caching Strategy
```typescript
// React Query with smart stale times
const { data: tripResults } = useQuery({
  queryKey: ['/api/trip-planner/results', config],
  staleTime: 5 * 60 * 1000, // 5 minutes (results don't change frequently)
});

// Server-side Redis caching (future)
const cacheKey = `trip:${city}:${startDate}:${endDate}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### Bundle Size
```typescript
// Lazy load heavy components
const ItineraryBuilder = lazy(() => import('./ItineraryBuilder'));
const UnifiedTripMap = lazy(() => import('./UnifiedTripMap'));

// Code splitting by view
<Suspense fallback={<LoadingSkeleton />}>
  {view === 'itinerary' && <ItineraryBuilder />}
  {view === 'map' && <UnifiedTripMap />}
</Suspense>
```

---

## Known Limitations & Future Enhancements

### Phase 1 Limitations (Current Scope)
- ❌ No AI-powered trip suggestions (Layer 31-46 - Phase 2)
- ❌ No multi-city itineraries (single city per trip)
- ❌ No collaborative trip planning (share with friends)
- ❌ No budget tracking (actual vs. planned spend)
- ❌ No weather integration
- ❌ No flight/transport booking

### Phase 2 Enhancements (Q1 2026)
- [ ] **AI Trip Agent (ESA Layer 35-37):**
  - Personalized trip suggestions based on user history
  - "Smart Fill" itinerary with ML recommendations
  - Conflict detection (double bookings, travel time)
  
- [ ] **Multi-City Routes:**
  - Plan Buenos Aires → Montevideo → São Paulo
  - Optimize travel sequence
  - Train/bus integration

- [ ] **Social Features:**
  - Share trip with friends
  - Collaborative editing
  - Trip voting (group decisions)

- [ ] **Budget Management:**
  - Expense tracking during trip
  - Budget alerts (80% spent)
  - Currency conversion

### Phase 3 Enhancements (Q2 2026)
- [ ] **Mobile App Integration:**
  - Offline itinerary access
  - GPS-based notifications ("Event nearby!")
  - Real-time trip updates

---

## Deployment Checklist

### Pre-Deployment
- [ ] All LSP errors resolved (0 TypeScript errors)
- [ ] Database migrations run successfully
- [ ] All API endpoints tested (Postman/Insomnia)
- [ ] i18next translations complete (68 languages)
- [ ] Aurora Tide design audit passed
- [ ] Performance metrics validated (< 2s results load)

### ESA Layer Validation
- [ ] **Layer 21:** User travel preferences saved correctly
- [ ] **Layer 22:** Group management integration working
- [ ] **Layer 23:** Event filtering by dates accurate
- [ ] **Layer 28:** Housing availability check reliable
- [ ] **Layer 27:** Recommendation filtering functional
- [ ] **Layer 15:** Search & discovery operational
- [ ] **Layer 11:** Real-time updates functioning

### Post-Deployment Monitoring
- [ ] Track trip creation rate (analytics)
- [ ] Monitor API response times (< 2s SLA)
- [ ] Check error rates (< 1% target)
- [ ] Validate Travel Module sync (100% accuracy)

---

## Documentation Artifacts

### Files to Create (Build Phase)
1. `client/src/components/trip-planner/TripPlannerHub.tsx`
2. `client/src/components/trip-planner/TripConfigurationWizard.tsx`
3. `client/src/components/trip-planner/TripFiltersBar.tsx`
4. `client/src/components/trip-planner/UnifiedTripMap.tsx`
5. `client/src/components/trip-planner/MapLayerToggles.tsx`
6. `client/src/components/trip-planner/TripResultsGrid.tsx`
7. `client/src/components/trip-planner/ItineraryBuilder.tsx`
8. `server/routes/tripPlannerRoutes.ts`
9. `shared/schema.ts` (add travel_plans, itinerary_items tables)

### Documentation to Update
- [ ] `replit.md` - Add Community Hub Trip Planner feature entry
- [ ] `docs/pages/community/journey-ch1-configure-trip.md`
- [ ] `docs/pages/community/journey-ch2-explore-results.md`
- [ ] `docs/pages/community/journey-ch3-build-itinerary.md`
- [ ] `docs/pages/community/journey-ch4-edit-saved-trip.md`
- [ ] `docs/pages/travel-module/integration-with-community-hub.md` (future audit note)

---

## Summary

**What We're Building:**
A city-specific trip planning tool embedded in Group Detail pages that transforms passive community hubs into active travel planning interfaces.

**Key Innovation:**
Date-first workflow that filters ALL content (Events, Housing, Recommendations) by trip dates, creating a cohesive "plan your trip" experience.

**Integration Win:**
Deep connection with existing Travel Module on user profiles, creating a bidirectional planning ecosystem (plan from community → save to profile → edit from profile → return to community).

**ESA Compliance:**
Full adherence to ESA LIFE CEO 61x21 framework across 10+ layers, with Aurora Tide design system integration and comprehensive i18next internationalization.

**Ready for Build Phase:** ✅  
All architecture decisions documented. Proceed to implementation when switching to Build mode.

---

**Last Updated:** October 7, 2025  
**Next Action:** Switch to Build mode and begin implementation starting with duplicate element removal (Task 2)
