# Community Page Documentation

## 1. Overview
- **Route**: `/community`
- **Purpose**: Central hub for tango community discovery, engagement, and networking
- **ESA Framework Layer**: Layer 3 - Community Platform

## 2. Technical Implementation

### Components
- `client/src/pages/community.tsx` - Main community page
- `CommunityGrid` - Community card grid
- `CommunitySearch` - Discovery search
- `CommunityFilters` - Location/type filters
- `FeaturedCommunities` - Highlighted groups
- `CommunityStats` - Global statistics
- `CommunityMap` - Geographic view
- `CreateCommunityButton` - Quick creation

### API Endpoints
- `GET /api/communities` - List communities
- `GET /api/communities/featured` - Featured groups
- `GET /api/communities/stats` - Global stats
- `GET /api/communities/search` - Search communities
- `GET /api/communities/nearby` - Location-based
- `POST /api/communities` - Create community
- `GET /api/communities/:id` - Community details

### Real-time Features
- Live member counts
- Real-time activity updates
- Dynamic trending communities
- Live event notifications
- Instant join confirmations

### Database Tables
- `communities` - Community data
- `community_members` - Membership
- `community_stats` - Metrics
- `community_tags` - Categories
- `featured_communities` - Curated list
- `community_activity` - Activity feed

## 3. User Permissions
- **Guest**: Browse public communities
- **User**: Join and create communities
- **Moderator**: Content management
- **Admin**: Platform oversight
- **Verified**: Featured placement

## 4. MT Ocean Theme Implementation
```css
/* Community page hero gradient */
.community-hero {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #0F766E 75%, #155E75 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Community cards */
.community-card {
  background: white;
  border: 2px solid rgba(94, 234, 212, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.community-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(94, 234, 212, 0.2);
  border-color: #5EEAD4;
}

/* Stats counter animation */
.stat-counter {
  background: linear-gradient(135deg, #5EEAD4, #14B8A6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 3rem;
  font-weight: bold;
}

/* Featured badge */
.featured-badge {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  position: absolute;
  top: 10px;
  right: 10px;
}

/* Create button */
.create-community-btn {
  background: linear-gradient(90deg, #5EEAD4, #0D9488);
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  box-shadow: 0 10px 20px rgba(94, 234, 212, 0.3);
}
```

## 5. Test Coverage
- **Unit Tests**: 84% coverage
- **Integration Tests**: Community CRUD
- **E2E Tests**: Full user journey
- **Performance Tests**: Large datasets
- **Search Tests**: Query relevance

## 6. Known Issues
- Map clustering performance
- Search relevance scoring
- Filter combination complexity
- Mobile grid layout

## 7. Agent Responsibilities
- **Community Agent**: Community management
- **Discovery Agent**: Search and recommendations
- **Stats Agent**: Metrics tracking
- **Content Agent**: Feed curation
- **Moderation Agent**: Content review

## 8. Integration Points
- **Search Service**: Discovery engine
- **Maps Service**: Geographic view
- **Analytics Service**: Community metrics
- **Recommendation Service**: Suggestions
- **Cache Service**: Performance optimization
- **CDN Service**: Image delivery

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Search Response**: < 500ms
- **Map Render**: < 1.5 seconds
- **Grid Load**: < 1 second
- **Join Action**: < 300ms
- **Memory Usage**: < 120MB

## 10. Accessibility
- **Screen Reader**: Community descriptions
- **Keyboard Navigation**: Full support
- **Map Alternative**: List view
- **Color Contrast**: WCAG AA
- **Focus Indicators**: Clear outlines
- **Mobile Touch**: Optimized targets