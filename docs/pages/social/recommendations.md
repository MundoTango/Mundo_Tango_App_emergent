# City Group Recommendations System

## Overview

The **User-Generated Recommendations** system enables community members to share and discover local gems (restaurants, cafes, hotels, venues) within their city groups. Built with Aurora Tide Design System principles, it features glassmorphic effects, MT Ocean Theme gradients, and seamless dark mode support.

## Architecture

### System Type
**User-Generated Recommendations** (Phase 1)
- Members manually create recommendations through the PostCreator UI
- Community-driven content with photos, descriptions, and ratings
- City-specific filtering and categorization
- Future: AI-powered recommendation engine (Phase 2 - see `coming-soon.md`)

### Technology Stack
- **Frontend**: React + Aurora Tide Design System
- **Backend**: Express.js REST API
- **Database**: PostgreSQL via Drizzle ORM
- **Design**: Glassmorphic components, MT Ocean gradients
- **Geocoding**: OpenStreetMap Nominatim API

## Database Schema

```typescript
// shared/schema.ts
export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  postId: integer('post_id').references(() => posts.id),
  groupId: integer('group_id').references(() => groups.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // restaurant, cafe, hotel, venue
  address: text('address'),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull(),
  lat: real('lat'),
  lng: real('lng'),
  photos: text('photos').array(),
  rating: integer('rating'), // 1-5 stars
  priceLevel: varchar('price_level', { length: 10 }), // '$', '$$', '$$$'
  tags: text('tags').array(),
  
  // ESA Layer 28: Social Connection Filters (from Housing system)
  whoCanView: varchar('who_can_view', { length: 50 }).default('anyone'), 
  // Options: 'anyone', '1st_degree', '2nd_degree', '3rd_degree', 'custom_closeness'
  minimumClosenessScore: integer('minimum_closeness_score').default(0), 
  // 0-100 threshold for custom_closeness filter
  
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## API Endpoints

### Base Path: `/api/recommendations`

#### GET `/api/recommendations`
Fetch recommendations with optional filters

**Query Parameters:**

*Standard Filters:*
- `city` (string, optional): Filter by city name
- `type` (string, optional): Filter by category (restaurant, cafe, hotel, venue)
- `priceLevel` (string, optional): Filter by price ('$', '$$', '$$$')
- `minRating` (number, optional): Minimum star rating (1-5)
- `tags` (string[], optional): Filter by tags
- `limit` (number, optional): Results per page (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

*Social Connection Filters:*
- `connectionDegree` (string, optional): Filter by relationship
  - `anyone`: All recommendations (default)
  - `1st_degree`: Direct friends only
  - `2nd_degree`: Friends + friends-of-friends
  - `3rd_degree`: Within 3 degrees of separation
  - `custom_closeness`: Friends above closeness threshold
- `minClosenessScore` (number, optional): Minimum closeness score (0-100, used with `custom_closeness`)

*Local/Visitor Filters:*
- `localStatus` (string, optional): Filter by recommender's relationship to city
  - `all`: All recommendations (default)
  - `local`: Only from users whose home city matches recommendation city
  - `visitor`: Only from users visiting/passing through
  
*Cultural Expertise Filter:*
- `originCountry` (string, optional): Filter by recommender's home country
  - Example: `originCountry=South Korea` to find Korean users' recommendations
  - Matches against `user.country` field

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 42,
      "title": "La Esquina Tango Cafe",
      "description": "Amazing coffee and traditional Argentine pastries",
      "type": "cafe",
      "address": "123 Corrientes Ave",
      "city": "Buenos Aires",
      "country": "Argentina",
      "lat": -34.6037,
      "lng": -58.3816,
      "photos": ["https://example.com/photo1.jpg"],
      "rating": 5,
      "tags": ["coffee", "pastries", "tango"],
      "user": {
        "id": 42,
        "name": "Maria Rodriguez",
        "username": "maria_tango",
        "profileImage": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

#### GET `/api/recommendations/:id`
Get single recommendation by ID

#### GET `/api/recommendations/user/:userId`
Get all recommendations by a specific user

#### POST `/api/recommendations`
Create new recommendation (requires authentication)

**Request Body:**
```json
{
  "title": "La Esquina Tango Cafe",
  "description": "Amazing coffee and pastries near the milonga",
  "type": "cafe",
  "address": "123 Corrientes Ave",
  "city": "Buenos Aires",
  "state": "CABA",
  "country": "Argentina",
  "lat": -34.6037,
  "lng": -58.3816,
  "photos": ["https://example.com/photo.jpg"],
  "rating": 5,
  "tags": ["coffee", "pastries", "tango"]
}
```

#### PATCH `/api/recommendations/:id`
Update recommendation (requires ownership)

#### DELETE `/api/recommendations/:id`
Soft-delete recommendation (requires ownership)

## Frontend Components

### PostCreator Integration

The recommendation UI is embedded in the universal `PostCreator` component, activated by clicking the recommendation icon (🗺️ or 📍).

**Aurora Tide Design Features:**
- **Glassmorphic Container**: `backdrop-blur-xl` with gradient overlays
- **MT Ocean Gradients**: Turquoise (#5EEAD4) → Cyan (#14B8A6) → Teal (#0D9488) → Blue (#155E75)
- **Dark Mode**: Full support with `dark:` variant classes
- **Smooth Animations**: `animate-in slide-in-from-top-4` for panel expansion
- **Micro-interactions**: Hover effects on buttons, scale transforms

**Category Selection:**
```tsx
<select data-testid="select-recommendation-type">
  <option value="restaurant">🍽️ Restaurant</option>
  <option value="cafe">☕ Cafe</option>
  <option value="hotel">🏨 Hotel</option>
  <option value="venue">💃 Venue</option>
</select>
```

**Price Range Buttons:**
- Budget ($): Light glassmorphic button
- Moderate ($$): Mid-tier glassmorphic button
- Luxury ($$$): Premium glassmorphic button
- Selected state: Full MT Ocean gradient with enhanced shadow

**Location Input:**
- Integrates with `LocationInput` component
- Auto-geocoding via OpenStreetMap Nominatim
- Visual confirmation badge with glassmorphic styling

## Storage Methods

```typescript
// server/storage.ts
interface IStorage {
  createRecommendation(data: RecommendationData): Promise<Recommendation>;
  getRecommendationById(id: number): Promise<Recommendation | null>;
  getRecommendationsByCity(city: string, limit?: number, offset?: number): Promise<Recommendation[]>;
  getRecommendationsByType(type: string, city?: string, limit?: number, offset?: number): Promise<Recommendation[]>;
  getRecommendationsByUser(userId: number, limit?: number, offset?: number): Promise<Recommendation[]>;
  updateRecommendation(id: number, data: Partial<Recommendation>): Promise<Recommendation>;
  deleteRecommendation(id: number): Promise<void>; // Soft delete
}
```

## User Experience Flow

### Creating a Recommendation

1. **Open PostCreator**: User clicks "What's on your mind?" or "New Post"
2. **Enable Recommendations**: Click recommendation icon (🗺️/📍) in toolbar
3. **Glassmorphic Panel Expands**: Aurora Tide styled panel slides in
4. **Fill Details**:
   - Select category (Restaurant/Cafe/Hotel/Venue)
   - Choose price range ($/$$/$$$$)
   - Search and select location
   - Add optional description and photos
5. **Submit**: Creates recommendation + post (if text/media included)

### Viewing Recommendations

**Display Components (To Be Implemented - Task #2):**
- `RecommendationCard`: Individual recommendation with glassmorphic design
- `RecommendationFeed`: Grid/list view with filters
- `RecommendationMap`: Interactive map showing all recommendations

**Filtering Options:**

#### Standard Filters
- **City**: Dropdown or map selection
- **Category**: Restaurant, cafe, hotel, venue
- **Price Range**: $, $$, $$$
- **Rating**: 1-5 stars
- **Tags**: Autocomplete search

#### Social Connection Filters
Recommendations can be filtered by your relationship to the recommender, using the same connection system as Housing:

- **Anyone**: See all public recommendations
- **1st Degree (Direct Friends)**: Only recommendations from your accepted friends
- **2nd Degree (Friends of Friends)**: Recommendations from friends and their friends
- **3rd Degree**: Extended network within 3 degrees of separation
- **Close Friends**: Only from friends above a minimum closeness score threshold

**Technical Implementation:**
- Leverages `ConnectionCalculationService` from Housing system
- Uses BFS algorithm to calculate connection degrees
- Closeness score (0-100) based on shared activities, events, messages
- Configurable per-recommendation via `whoCanView` field

#### Local vs Visitor Filters
Filter recommendations based on the recommender's relationship to the city:

- **All**: Show all recommendations
- **Locals Only**: Filter to users whose home city matches the recommendation city
  - User's `city` field matches recommendation's `city` field
  - Prioritizes authentic local knowledge
- **Visitors Only**: Show recommendations from people visiting/passing through
  - User's `city` field differs from recommendation's `city`
  - Captures fresh perspectives from travelers

**Use Case:** When in Buenos Aires, toggle "Locals Only" to find authentic porteno favorites, or "Visitors Only" to see what tourists discovered.

#### Cultural Expertise Filter (Origin-Based)
Match recommendations by the recommender's origin country for cultural authenticity:

- **Any Origin**: All recommendations regardless of recommender's background
- **Filter by Country**: Select specific country (e.g., "Korea", "Japan", "Italy")
  - Searches for users where `user.country === selectedCountry`
  - Ideal for finding authentic ethnic cuisine

**Real-World Example:**
```
Scenario: Looking for Korean BBQ in Buenos Aires
Filter Settings:
  - Category: Restaurant
  - Origin Country: South Korea
  - Local Status: All (or Visitors to find Korean expats)
  
Result: Korean friends who've tried Korean restaurants in BA, 
        ensuring authentic recommendations vs. fusion interpretations
```

**Combined Filter Power:**
```
"Show me Italian restaurants in Buenos Aires recommended by:
 - 1st or 2nd degree connections (people I trust)
 - From Italy (authentic expertise)
 - Who are locals or long-term visitors (know the city well)"
```

## Design System Integration

### Color Palette (MT Ocean Theme)
- Primary: Turquoise-500 (#14B8A6)
- Secondary: Cyan-500 (#06B6D4)
- Accent: Teal-500 (#0D9488)
- Deep: Blue-800 (#155E75)

### Glassmorphic Effects
```css
.recommendation-panel {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.15), rgba(20, 184, 166, 0.10));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(94, 234, 212, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5);
}
```

### Dark Mode Support
All components use dual theming:
```tsx
className="text-gray-800 dark:text-gray-200"
className="border-turquoise-300/40 dark:border-cyan-500/30"
className="from-turquoise-700 dark:from-turquoise-300"
```

## Testing

### E2E Test Coverage
- Recommendation creation flow (PostCreator)
- Category selection validation
- Price range selection
- Location autocomplete
- Database storage verification
- API endpoint responses

### Test IDs
```tsx
data-testid="select-recommendation-type"
data-testid="button-price-$"
data-testid="button-price-$$"
data-testid="button-price-$$$"
```

## Future Enhancements

### Phase 2: AI-Powered Recommendations (Coming Soon)
- Personalized suggestions based on user preferences
- Machine learning recommendation engine
- Collaborative filtering
- Sentiment analysis of reviews
- See `docs/pages/housing/coming-soon.md` for details

### Additional Features
- User reviews and ratings
- Bookmark/favorite system
- Social sharing
- Recommendation analytics
- Map clustering for dense areas
- Multi-language support via i18next

## Migration Notes

### From Treasure Map Theme → Aurora Tide
**What Changed:**
- ❌ Removed: Vintage paper texture, compass rose, amber gradients, decorative corners
- ✅ Added: Glassmorphic panels, MT Ocean gradients, modern terminology
- ✅ Standardized: "Restaurant", "Cafe", "Hotel", "Venue" (not "Dining Hall", "Cozy Tavern")
- ✅ Enhanced: Dark mode support, accessibility, semantic HTML

**Breaking Changes:**
- None (database schema unchanged)
- UI only - all APIs remain compatible

## Advanced Filtering System (ESA Layer 28)

### Architecture Overview

The recommendation filtering system implements **social intelligence** with 9 comprehensive filter parameters, combining traditional search filters with connection-based access control adapted from the Housing system.

**Status**: ✅ **PRODUCTION READY** (October 6, 2025)  
**Framework**: ESA LIFE CEO 61x21  
**Design System**: Aurora Tide with glassmorphic components

### System Components

#### 1. RecommendationAccessService
**Location**: `server/services/recommendationAccessService.ts`

Adapts the Housing system's `ConnectionCalculationService` to provide social filtering for recommendations:

**Core Methods**:
```typescript
class RecommendationAccessService {
  // Check if viewer can see a recommendation based on whoCanView setting
  async canUserViewRecommendation(
    viewerId: number,
    recommendation: any
  ): Promise<{ canView: boolean; reason?: string; connectionInfo?: ConnectionInfo }>;

  // Filter recommendations by connection degree
  async filterByConnectionDegree(
    viewerId: number,
    recommendationIds: number[],
    connectionDegree: string,
    minClosenessScore?: number
  ): Promise<number[]>;

  // Filter by local vs visitor status
  async filterByLocalStatus(
    recommendationIds: number[],
    localStatus: 'all' | 'local' | 'visitor'
  ): Promise<number[]>;

  // Filter by recommender's origin country (cultural expertise)
  async filterByOriginCountry(
    recommendationIds: number[],
    originCountry: string
  ): Promise<number[]>;

  // Apply all filters in sequence
  async applyAllFilters(
    viewerId: number,
    recommendationIds: number[],
    filters: RecommendationFilter
  ): Promise<number[]>;
}
```

**Connection Degree Algorithm**:
- Uses Breadth-First Search (BFS) to calculate degrees of separation
- Leverages Housing's `ConnectionCalculationService` for consistency
- Closeness score (0-100) based on: shared events, messages, mutual friends, activity frequency

**Access Control Logic**:
1. User always sees their own recommendations
2. `whoCanView='anyone'`: Public to all authenticated users
3. `whoCanView='1st_degree'`: Direct friends only (connection degree = 1)
4. `whoCanView='2nd_degree'`: Friends + friends-of-friends (degree ≤ 2)
5. `whoCanView='3rd_degree'`: Within 3 degrees of separation (degree ≤ 3)
6. `whoCanView='custom_closeness'`: Friends above minimum closeness score

#### 2. RecommendationFilters Component
**Location**: `client/src/components/recommendations/RecommendationFilters.tsx`

Aurora Tide glassmorphic UI component with collapsible filter panel:

**Design Features**:
- **Glassmorphic Container**: `glass-card glass-depth-2` with MT Ocean gradient
- **Collapsible Header**: Shows active filter count, expandable with smooth animations
- **Connection Level Buttons**: 5 options (Anyone, 1st/2nd/3rd Degree, Close Friends)
- **Local/Visitor Toggle**: 3-button group (Everyone, Locals, Visitors)
- **Cultural Expertise Dropdown**: 12+ countries with flag emojis
- **Category Select**: 7 categories (Restaurant, Café, Bar, Hotel, Venue, Shop, Activity)
- **Price Level Grid**: 4 buttons ($ to $$$$)
- **Rating Slider**: 0-5 stars with half-star precision
- **Dark Mode**: Full support with `dark:` variant classes
- **Test IDs**: Complete coverage for E2E testing

**UI State Management**:
```tsx
interface FilterState {
  connectionDegree: 'anyone' | '1st_degree' | '2nd_degree' | '3rd_degree' | 'custom_closeness';
  minClosenessScore?: number;
  localStatus: 'all' | 'local' | 'visitor';
  originCountry?: string;
  type?: string;
  priceLevel?: string;
  minRating?: number;
  tags?: string[];
}
```

**Responsive Design**:
- Mobile: Stacked 2-column grid for connection buttons
- Tablet/Desktop: 3-column grid expands to full width
- Touch-friendly tap targets (minimum 44px height)

#### 3. API Integration
**Endpoint**: `GET /api/recommendations`

**Filter Flow**:
```
1. Parse query parameters → 9 filter types
2. Execute base filters (city, type, price, rating, tags) → SQL query
3. Get initial recommendation IDs
4. Apply social filters sequentially:
   a. Connection degree filter (if viewerId exists)
   b. Local/visitor status filter
   c. Origin country filter
5. Return filtered recommendations with user data
```

**Query Parameter Mapping**:
```typescript
{
  // Standard filters (SQL-level)
  city: string,
  type: string,
  priceLevel: string,
  minRating: number,
  tags: string[],
  
  // Social filters (application-level)
  connectionDegree: string,
  minClosenessScore: number,
  localStatus: string,
  originCountry: string,
  
  // Pagination
  limit: number,  // default: 20
  offset: number  // default: 0
}
```

**Performance Optimization**:
- Base filters use indexed SQL queries
- Social filters applied to reduced result set (post-SQL)
- Connection info cached in memory during request
- Parallel user data enrichment

### Filter Combinations (Real-World Examples)

#### Example 1: Authentic Korean BBQ
```
Goal: Find Korean restaurants in Buenos Aires recommended by Korean friends

Filters:
  - city: "Buenos Aires"
  - type: "restaurant"
  - originCountry: "Korea"
  - connectionDegree: "1st_degree" or "2nd_degree"
  
Result: Korean friends who've personally tried Korean BBQ in BA
```

#### Example 2: Local Insider Cafés
```
Goal: Discover authentic local cafés from trusted Buenos Aires natives

Filters:
  - city: "Buenos Aires"
  - type: "cafe"
  - localStatus: "local"
  - connectionDegree: "1st_degree"
  - priceLevel: "2" ($$)
  
Result: Direct friends who live in BA and frequent moderately-priced cafés
```

#### Example 3: Luxury Hotels from Travel Experts
```
Goal: High-end hotel recommendations from well-traveled visitors

Filters:
  - city: "Buenos Aires"
  - type: "hotel"
  - priceLevel: "4" ($$$$)
  - localStatus: "visitor"
  - minRating: 4.5
  
Result: Travelers who've experienced luxury hotels in BA and rated them highly
```

### Integration Points

#### GroupDetailPageMT
**Location**: `client/src/pages/GroupDetailPageMT.tsx`

Recommendations tab includes filters:
```tsx
<RecommendationsList
  cityName={group.name}
  showFilters={true}  // Enables RecommendationFilters component
  defaultFilters={{
    connectionDegree: 'anyone',
    localStatus: 'all'
  }}
/>
```

#### RecommendationsList Component
**Location**: `client/src/components/Recommendations/RecommendationsList.tsx`

Manages filter state and fetches filtered data:
```tsx
const [filters, setFilters] = useState<FilterState>({
  connectionDegree: 'anyone',
  localStatus: 'all'
});

const { data, isLoading } = useQuery({
  queryKey: ['/api/recommendations', city, filters],
  // Automatically constructs query string from filters
});
```

**Display Modes**:
- **List View** (default): Vertical stack of `CleanMemoryCard` components
- **Grid View** (planned): Responsive grid layout
- **Map View** (planned): Interactive Leaflet.js map with markers

### Performance Metrics

**Target Benchmarks**:
- Filter UI render: < 50ms
- Base SQL query: < 200ms
- Connection degree calculation: < 100ms per recommendation
- Local/visitor filter: < 50ms
- Origin country filter: < 50ms
- Total API response: < 500ms (for 20 recommendations)

**Optimization Strategies**:
1. **Indexed Columns**: `city`, `type`, `priceLevel`, `rating`, `userId` have database indexes
2. **Query Batching**: User data fetched in single query after filtering
3. **Connection Caching**: ConnectionCalculationService caches friendship graph
4. **Lazy Loading**: Filters collapsed by default, expanded on user interaction
5. **Debounced Updates**: Filter changes debounced 300ms to reduce API calls

**Monitoring**:
- API endpoint latency tracked via Prometheus
- Filter usage analytics (which filters are most popular)
- Connection degree distribution (how many use 1st vs 2nd degree)

### Testing Coverage

#### E2E Tests
```typescript
describe('Recommendation Filtering', () => {
  test('Connection degree filtering works', async () => {
    // Create recommendations from 1st, 2nd, 3rd degree friends
    // Apply "1st_degree" filter
    // Verify only 1st degree recommendations returned
  });

  test('Local vs visitor filtering works', async () => {
    // Create recommendations from locals and visitors
    // Apply "local" filter
    // Verify only local recommendations returned
  });

  test('Cultural expertise filtering works', async () => {
    // Create Korean user with Korean restaurant recommendation
    // Apply "originCountry=Korea" filter
    // Verify Korean friend's recommendation included
  });

  test('Combined filters work', async () => {
    // Apply multiple filters simultaneously
    // Verify intersection of all filter criteria
  });
});
```

#### Test IDs
```tsx
data-testid="recommendation-filters"
data-testid="button-toggle-filters"
data-testid="button-reset-filters"
data-testid="filter-connection-anyone"
data-testid="filter-connection-1st_degree"
data-testid="filter-connection-2nd_degree"
data-testid="filter-connection-3rd_degree"
data-testid="filter-connection-custom_closeness"
data-testid="input-closeness-score"
data-testid="filter-local-all"
data-testid="filter-local-local"
data-testid="filter-local-visitor"
data-testid="select-origin-country"
data-testid="select-category"
data-testid="filter-price-1" ($ button)
data-testid="filter-price-2" ($$ button)
data-testid="filter-price-3" ($$$ button)
data-testid="filter-price-4" ($$$$ button)
data-testid="input-min-rating"
```

### Duplicate Place Handling

#### Current Behavior
Multiple users **can and should** create recommendations for the same physical location (e.g., "Café Tortoni" in Buenos Aires). This design choice provides:

**Benefits**:
1. **Multiple Perspectives**: Different users experience the same place differently
2. **Social Validation**: 5 friends recommending same café = high trust signal
3. **Filter Opportunities**: See what YOUR 1st degree friends think vs strangers
4. **Temporal Context**: User A visited in 2023, User B in 2025 (freshness matters)
5. **Contextual Relevance**: Korean friend's Korean restaurant review > random user's review

**Example Scenario**:
```
Place: "Café Tortoni" (Buenos Aires)

Recommendation 1:
  - User: Maria (local, Argentina)
  - Rating: 5 stars
  - Tags: ["historic", "breakfast", "touristy"]
  - Description: "Classic Buenos Aires institution, best for breakfast"

Recommendation 2:
  - User: Jun (visitor, Korea)
  - Rating: 4 stars
  - Tags: ["coffee", "historic", "expensive"]
  - Description: "Beautiful architecture but pricey for what you get"

Recommendation 3:
  - User: Elena (local, Argentina)
  - Rating: 5 stars
  - Tags: ["historic", "lunch", "tango"]
  - Description: "Go for the tango show at night!"

User's view with filters:
  - "1st degree + local" → Shows Maria and Elena (local friends)
  - "1st degree + visitor" → Shows Jun (visiting Korean friend)
  - "originCountry=Korea" → Shows Jun only (cultural expertise)
```

#### Future Enhancements (Phase 2)

**Place Aggregation** (planned):
- Group recommendations by location (lat/lng proximity)
- Show "3 friends recommended this place" badge
- Display consensus rating (average of all friend ratings)
- Aggregate tags across all recommendations
- Timeline view (see who visited when)

**Smart Deduplication**:
- Option to "Show one per place" with most relevant recommendation
- Relevance scoring: connection degree + recency + rating
- Toggle between "All recommendations" vs "One per place"

**Place Pages** (future):
- Dedicated page per physical location
- All recommendations aggregated
- User-specific highlighting ("Your friends' reviews")
- Comparison view (locals vs visitors, different countries)

### Accessibility

**WCAG 2.1 AA Compliance**:
- All filter buttons have `aria-label` attributes
- Keyboard navigation fully supported
- Focus indicators visible on all interactive elements
- Color contrast ratios meet 4.5:1 minimum
- Screen reader announcements for filter changes
- Alternative text for country flag emojis

**Keyboard Shortcuts**:
- `Tab`: Navigate between filter controls
- `Space/Enter`: Toggle filter buttons
- `Arrow keys`: Navigate within button groups
- `Esc`: Collapse filter panel

### Known Limitations

1. **No Real-Time Updates**: Filter results require manual refresh (not WebSocket live)
2. **Memory Constraints**: Connection calculations for 100+ recommendations may be slow
3. **No Filter Presets**: Users can't save favorite filter combinations
4. **Limited Tag Search**: No autocomplete or tag suggestions yet
5. **No Map Clustering**: Dense recommendation areas may overlap on map view

### Future Roadmap

**Q1 2026**:
- [ ] Map view with Leaflet.js integration
- [ ] Grid view layout with masonry design
- [ ] Filter presets (save/load favorite combinations)
- [ ] Real-time filter updates via WebSocket

**Q2 2026**:
- [ ] Place aggregation system
- [ ] Consensus ratings across multiple recommendations
- [ ] Tag autocomplete with popular suggestions
- [ ] Export filtered results to PDF/CSV

**Phase 2 (AI-Powered)**:
- [ ] Personalized recommendation scoring
- [ ] Collaborative filtering engine
- [ ] Sentiment analysis of descriptions
- [ ] Smart recommendations ("People like you also liked...")

## Related Documentation
- [Aurora Tide Design System](../design-systems/aurora-tide.md)
- [PostCreator Component](../../client/src/components/universal/PostCreator.tsx)
- [Coming Soon Features](../housing/coming-soon.md)
- [City Groups Architecture](../social/city-groups.md)
- [Housing Connection System](../housing/index.md)
- [ESA Layer 28: Recommendations](../esa-layers/layer-28-recommendations.md)
