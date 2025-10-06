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
  tags: text('tags').array(),
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
- `city` (string, optional): Filter by city name
- `type` (string, optional): Filter by category (restaurant, cafe, hotel, venue)
- `limit` (number, optional): Results per page (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

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
- By city (dropdown or map selection)
- By category (restaurant, cafe, hotel, venue)
- By price range ($, $$, $$$)
- By tags (autocomplete)

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

## Related Documentation
- [Aurora Tide Design System](../design-systems/aurora-tide.md)
- [PostCreator Component](../../client/src/components/universal/PostCreator.tsx)
- [Coming Soon Features](../housing/coming-soon.md)
- [City Groups Architecture](../social/city-groups.md)
