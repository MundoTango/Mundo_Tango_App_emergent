# Recommendations System - Treasure Map Explorer 🗺️

## Overview
The recommendations system in ESA LIFE CEO allows users to share valuable content with their local community through an adventure-themed "Treasure Map Explorer" interface. Users can mark their favorite locations (restaurants, cafes, hotels, venues) with integrated location search, price ranges, and automatic cross-posting to city-based groups. This feature is powered by ESA Layer 57 (Automation Management) and integrates with the Beautiful Post Creator.

**Design Theme**: Vintage map aesthetics with compass rose animations, treasure-themed language, and warm amber/brown color palette.

## How It Works

### 1. User Opens Treasure Map Explorer
When creating a post using the BeautifulPostCreator component:
- User writes their content (with @mention support)
- Sets privacy level (public/friends/private)
- **Clicks "🗺️ Discover Hidden Gems" button** (treasure map opens with animation)
- Selects recommendation metadata:
  - **💎 Treasure Type**: Restaurant (Dining Hall), Cafe (Cozy Tavern), Hotel (Inn & Lodge), or Venue (Grand Ballroom)
  - **💰 Treasure Value**: Budget ($), Moderate ($$), or Luxury ($$$)
  - **📍 Location**: Uses integrated Google Maps Places API search
- Location search field appears **inside** the treasure map dropdown
- Submits the post with recommendation metadata

### 2. Automatic City Group Detection
The system automatically:
- Identifies user's city from their profile
- Finds the corresponding city group
- Validates user's membership in the group
- Prepares for cross-posting

### 3. Cross-Posting Process
When `isRecommendation` is true:
```javascript
// In server/routes/postsRoutes.ts
if (isRecommendation && user.city) {
  const cityGroup = await storage.getGroupByCity(user.city);
  if (cityGroup) {
    await storage.createGroupPost({
      groupId: cityGroup.id,
      userId: post.userId,
      content: `📍 Local Recommendation\n\n${post.content}`,
      isRecommendation: true,
      originalPostId: post.id
    });
  }
}
```

## Implementation Details

### Frontend Component

#### Treasure Map Explorer UI
```jsx
function BeautifulPostCreator() {
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  
  return (
    <div className="post-creator">
      {/* Content input */}
      <SimpleMentionsInput {...props} />
      
      {/* Treasure Map Explorer Toggle */}
      <button
        onClick={() => setIsRecommendation(!isRecommendation)}
        className="treasure-map-toggle"
      >
        <CompassRoseIcon className={isRecommendation ? 'rotate-0' : 'rotate-180'} />
        <div>
          <span>🗺️ Discover Hidden Gems</span>
          <span className="subtitle">Share your treasure map with the community</span>
        </div>
      </button>
      
      {/* Expanded Treasure Map */}
      {isRecommendation && (
        <div className="treasure-map-container">
          <header className="compass-header">
            <CompassIcon className="animate-spin-slow" />
            MARK YOUR TREASURE
          </header>
          
          {/* Treasure Type */}
          <select value={recommendationType} onChange={e => setRecommendationType(e.target.value)}>
            <option value="">Choose your treasure type...</option>
            <option value="restaurant">🍽️ Dining Hall</option>
            <option value="cafe">☕ Cozy Tavern</option>
            <option value="hotel">🏨 Inn & Lodge</option>
            <option value="venue">💃 Grand Ballroom</option>
          </select>
          
          {/* Treasure Value */}
          <div className="price-range-buttons">
            {['$', '$$', '$$$'].map(price => (
              <button 
                key={price}
                onClick={() => setPriceRange(price)}
                className={priceRange === price ? 'selected' : ''}
              >
                {price}
                <span>{price === '$' ? '⭐ Budget' : price === '$$' ? '⭐⭐ Moderate' : '⭐⭐⭐ Luxury'}</span>
              </button>
            ))}
          </div>
          
          {/* Location Search - INTEGRATED INSIDE */}
          <LocationInput
            value={location}
            onChange={(loc, coords, details) => {
              setLocation(loc);
              setLocationCoords(coords);
            }}
            placeholder="🔍 Search for your hidden gem..."
            biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
            showBusinessDetails={true}
          />
          
          {location && (
            <div className="treasure-confirmation">
              <MapPin className="animate-bounce" />
              Treasure marked: {location}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### Unified LocationInput Component
The treasure map uses the new unified `LocationInput` component:

**Features:**
- Intelligent Google Maps API detection
- Automatic fallback to SimplifiedLocationInput
- Consistent interface across all location inputs
- Business details support (ratings, price levels)
- Place ID and coordinates extraction

**Implementation:**
```typescript
// client/src/components/universal/LocationInput.tsx
export default function LocationInput(props: LocationInputProps) {
  const [googleMapsAvailable, setGoogleMapsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setGoogleMapsAvailable(!!apiKey && apiKey.length > 0);
  }, []);

  // Auto-select primary or fallback
  return googleMapsAvailable ? (
    <GoogleMapsLocationInput {...props} />
  ) : (
    <SimplifiedLocationInput {...props} />
  );
}
```

### Backend Processing

#### Database Schema
The posts table includes:
```sql
isRecommendation BOOLEAN DEFAULT FALSE
originalPostId INTEGER REFERENCES posts(id)
recommendationScore INTEGER DEFAULT 0
```

#### Storage Layer Methods
```typescript
// Get city-based group
async getGroupByCity(city: string) {
  return await db
    .select()
    .from(groups)
    .where(
      and(
        eq(groups.type, 'city'),
        eq(groups.city, city)
      )
    )
    .limit(1);
}

// Create group recommendation
async createGroupPost(data: GroupPost) {
  const post = await db.insert(groupPosts).values({
    ...data,
    type: 'recommendation',
    createdAt: new Date()
  }).returning();
  
  // Notify group members
  await this.notifyGroupMembers(data.groupId, post.id);
  
  return post;
}
```

## Recommendation Types

### 1. Local Business
- Restaurants, cafes, shops
- Service providers
- Entertainment venues
- Format: Name, address, why recommended

### 2. Events & Activities
- Concerts, shows, exhibitions
- Meetups and gatherings
- Sports and recreation
- Format: Event name, date, location, details

### 3. Travel Tips
- Hidden gems in the city
- Best times to visit places
- Local customs and etiquette
- Format: Tip category, detailed advice

### 4. Professional Services
- Doctors, lawyers, accountants
- Repair services
- Educational resources
- Format: Service type, contact, experience

## Visibility Rules

### Original Post Privacy
- Maintains its original privacy setting
- Visible according to standard privacy rules
- Can be public, friends-only, or private

### City Group Recommendation
- Always visible to city group members
- Inherits group visibility settings
- Shows original poster's name
- Links back to original post (if accessible)

## Scoring System

### Recommendation Score Calculation
```typescript
function calculateRecommendationScore(post) {
  let score = 0;
  
  // Engagement metrics
  score += post.likes * 2;
  score += post.comments * 3;
  score += post.shares * 5;
  
  // Quality indicators
  if (post.hasImages) score += 10;
  if (post.hasLocation) score += 15;
  if (post.verified) score += 20;
  
  // Time decay
  const daysSincePost = (Date.now() - post.createdAt) / (1000 * 60 * 60 * 24);
  score *= Math.exp(-daysSincePost / 30); // 30-day half-life
  
  return Math.round(score);
}
```

### Ranking in City Groups
Recommendations are sorted by:
1. Recommendation score (highest first)
2. Recency (for equal scores)
3. User reputation in group

## Automation Features

### Auto-Tagging
Recommendations are automatically tagged based on content:
- #food #restaurant for dining recommendations
- #event #culture for cultural activities
- #service #professional for services
- #tip #local for general advice

### Smart Notifications
Group members receive notifications based on:
- Notification preferences
- Interest matching
- Previous engagement with similar content
- Time of day preferences

### Duplicate Detection
System prevents duplicate recommendations:
- Checks for similar content in last 7 days
- Uses fuzzy matching (80% similarity threshold)
- Warns user before posting duplicate

## Analytics and Insights

### Metrics Tracked
- Total recommendations per city
- Engagement rate on recommendations
- Most recommended categories
- Top recommenders per city
- Recommendation conversion rate

### User Dashboard
Shows personal recommendation stats:
- Number of recommendations made
- Total engagement received
- Most successful recommendations
- Recommendation score trend

## Moderation

### Community Moderation
- Users can flag inappropriate recommendations
- Group moderators review flagged content
- Repeated violations lead to recommendation privileges suspension

### Quality Control
- Minimum account age (7 days) to make recommendations
- Verified phone number required
- Rate limiting (max 5 recommendations per day)

## API Endpoints

### Create Recommendation
```
POST /api/posts
{
  "content": "Great coffee at Café Luna!",
  "privacy": "public",
  "isRecommendation": true,
  "location": { "lat": -34.603, "lng": -58.381 },
  "tags": ["coffee", "cafe", "breakfast"]
}
```

### Get City Recommendations
```
GET /api/recommendations/city/:cityId
?category=food
&sort=score
&limit=20
```

### Vote on Recommendation
```
POST /api/recommendations/:id/vote
{
  "helpful": true
}
```

## Best Practices

### For Users
1. Include specific details (address, hours, prices)
2. Add photos when possible
3. Explain why you recommend it
4. Update if information changes
5. Respond to questions in comments

### For Developers
1. Cache city group lookups
2. Batch notification sending
3. Use async processing for cross-posting
4. Implement retry logic for failed posts
5. Monitor recommendation quality metrics

## Testing Checklist
- [ ] Recommendation toggle appears in post creator
- [ ] Cross-posting to city group works
- [ ] Original post privacy is maintained
- [ ] Notifications sent to group members
- [ ] Duplicate detection prevents spam
- [ ] Scoring system ranks appropriately
- [ ] Analytics track all metrics
- [ ] Moderation tools function correctly

## Related Documentation
- [BeautifulPostCreator](../content/components/BeautifulPostCreator.md)
- [Privacy Filtering](./privacy-filtering.md)
- [City Groups](./groups.md)
- [ESA Layer 57](../esa-layers/layer-57-automation.md)