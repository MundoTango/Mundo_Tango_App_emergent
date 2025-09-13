# Event Discovery Feed Documentation

## 1. Overview
- **Route**: `/events/discover`
- **Purpose**: Personalized event discovery with AI-powered recommendations and social filtering
- **ESA Framework Layer**: Layer 4 - Discovery Engine

## 2. Technical Implementation

### Components
- `client/src/components/events/EventDiscoveryFeed.tsx` - Main feed
- `RecommendationEngine` - AI suggestions
- `SocialFilter` - Friend activity filter
- `TrendingEvents` - Popular events
- `NearbyEvents` - Location-based discovery
- `PersonalizedTags` - Interest matching
- `DiscoveryMap` - Visual exploration
- `EventPreviewCard` - Quick preview

### API Endpoints
- `GET /api/events/discover` - Personalized feed
- `GET /api/events/trending` - Trending events
- `GET /api/events/nearby` - Location-based
- `GET /api/events/friends` - Friend activity
- `POST /api/events/preferences` - Update preferences
- `GET /api/events/similar/:id` - Similar events
- `POST /api/events/feedback` - Training feedback

### Real-time Features
- Live trending updates
- Real-time friend activity
- Dynamic recommendation refresh
- Instant preference application
- Live availability updates

### Database Tables
- `discovery_preferences` - User preferences
- `event_recommendations` - AI suggestions
- `event_interactions` - User behavior
- `trending_events` - Popularity metrics
- `event_similarity` - Related events
- `discovery_feedback` - ML training data

## 3. User Permissions
- **Guest**: Limited discovery
- **User**: Full personalization
- **Premium**: Advanced filters
- **Creator**: Promotion tools
- **Admin**: Algorithm tuning

## 4. MT Ocean Theme Implementation
```css
/* Discovery feed gradient */
.discovery-feed {
  background: linear-gradient(to bottom, #5EEAD4 0%, #14B8A6 100%);
  min-height: 100vh;
}

/* Recommendation cards */
.recommendation-card {
  background: white;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
}

.recommendation-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #5EEAD4, #0D9488);
  border-radius: 12px;
  z-index: -1;
}

/* Trending badge */
.trending-badge {
  background: linear-gradient(135deg, #14B8A6, #0F766E);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* Filter pills */
.filter-pill {
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid #5EEAD4;
  color: #0F766E;
}

.filter-pill.active {
  background: #5EEAD4;
  color: white;
}
```

## 5. Test Coverage
- **Unit Tests**: 81% coverage
- **Integration Tests**: Recommendation flow
- **E2E Tests**: Discovery journey
- **A/B Tests**: Algorithm variations
- **ML Tests**: Recommendation accuracy

## 6. Known Issues
- Recommendation cold start problem
- Location accuracy on VPN
- Infinite scroll memory leak
- Filter combination complexity

## 7. Agent Responsibilities
- **Discovery Agent**: Feed curation
- **ML Agent**: Recommendation engine
- **Location Agent**: Geo-filtering
- **Social Agent**: Friend activity
- **Analytics Agent**: Behavior tracking

## 8. Integration Points
- **ML Service**: Recommendation engine
- **Location Service**: Geo-discovery
- **Social Graph**: Friend connections
- **Analytics Service**: User behavior
- **Cache Service**: Feed optimization
- **Search Service**: Query handling

## 9. Performance Metrics
- **Initial Load**: < 1.5 seconds
- **Scroll Load**: < 500ms
- **Recommendation Update**: < 2 seconds
- **Filter Apply**: < 300ms
- **Click-through Rate**: > 15%
- **Engagement Time**: > 3 minutes

## 10. Accessibility
- **Screen Reader**: Feed navigation
- **Keyboard Browse**: Arrow keys
- **Filter Announce**: State changes
- **Infinite Scroll**: Pagination option
- **Reduced Motion**: Disable animations
- **High Contrast**: Enhanced visibility