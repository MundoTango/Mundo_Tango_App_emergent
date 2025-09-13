# Home Page Documentation

## 1. Overview
- **Route**: `/home` or `/`
- **Purpose**: Main dashboard showing personalized feed, upcoming events, and community activity
- **ESA Framework Layer**: Layer 1 - Core Experience

## 2. Technical Implementation

### Components
- `client/src/pages/home.tsx` - Main home page
- `ActivityFeed` - Personalized content feed
- `UpcomingEvents` - Event recommendations
- `StoryBar` - Friend stories/highlights
- `QuickActions` - Common action buttons
- `TrendingSection` - Popular content
- `WeatherWidget` - Local weather for events
- `NotificationBell` - Alert center

### API Endpoints
- `GET /api/feed` - Personalized feed
- `GET /api/events/upcoming` - Upcoming events
- `GET /api/stories/recent` - Friend stories
- `GET /api/trending` - Trending content
- `GET /api/notifications/unread` - Notifications
- `GET /api/weather/:location` - Weather data
- `POST /api/activity/track` - User activity

### Real-time Features
- Live feed updates
- Real-time notifications
- Story expiration countdown
- Online friend status
- Live event updates

### Database Tables
- `feed_items` - Feed content
- `user_activity` - Activity tracking
- `notifications` - User notifications
- `stories` - User stories
- `trending_content` - Popular items
- `feed_preferences` - Personalization

## 3. User Permissions
- **Authenticated**: Full personalized experience
- **Guest**: Limited public content
- **Premium**: Ad-free experience
- **Admin**: Moderation tools

## 4. MT Ocean Theme Implementation
```css
/* Hero section gradient */
.home-hero {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #155E75 100%);
  min-height: 300px;
}

/* Feed cards */
.feed-card {
  background: white;
  border-left: 4px solid transparent;
  border-image: linear-gradient(180deg, #5EEAD4, #0D9488) 1;
  transition: transform 0.2s;
}

/* Story ring gradient */
.story-ring {
  background: conic-gradient(#5EEAD4, #14B8A6, #0D9488, #5EEAD4);
  padding: 3px;
  border-radius: 50%;
}
```

## 5. Test Coverage
- **Unit Tests**: 87% coverage
- **Integration Tests**: Feed algorithm
- **E2E Tests**: User journey flows
- **Performance Tests**: Feed loading
- **A/B Tests**: Layout variations

## 6. Known Issues
- Feed infinite scroll memory leak
- Story preloading on slow connections
- Weather API rate limiting
- Notification badge sync delay

## 7. Agent Responsibilities
- **Feed Agent**: Content curation
- **Recommendation Agent**: Event suggestions
- **Notification Agent**: Alert management
- **Analytics Agent**: Engagement tracking
- **Weather Agent**: Location-based weather

## 8. Integration Points
- **AI Service**: Content recommendations
- **Weather API**: Event weather
- **Analytics Service**: User tracking
- **Push Service**: Notifications
- **Cache Service**: Feed optimization

## 9. Performance Metrics
- **Initial Load**: < 1.5 seconds
- **Feed Refresh**: < 500ms
- **Time to Interactive**: < 2 seconds
- **Story Load**: < 300ms
- **Notification Update**: Real-time
- **Memory Usage**: < 100MB

## 10. Accessibility
- **Screen Reader**: Feed item descriptions
- **Keyboard Navigation**: J/K scrolling
- **Skip Links**: Navigation shortcuts
- **Reduced Motion**: Animation toggles
- **High Contrast**: Mode available
- **Focus Management**: Proper tab order