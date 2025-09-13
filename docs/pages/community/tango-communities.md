# Tango Communities Documentation

## 1. Overview
- **Route**: `/tango-communities`
- **Purpose**: Directory of established tango communities worldwide with detailed information
- **ESA Framework Layer**: Layer 3 - Community Directory

## 2. Technical Implementation

### Components
- `client/src/pages/tango-communities.tsx` - Communities directory
- `CommunityDirectory` - Main listing component
- `CommunityFilter` - Advanced filtering
- `CommunityCard` - Individual community display
- `RegionSelector` - Geographic filtering
- `StyleFilter` - Dance style filtering
- `SizeIndicator` - Community size display
- `ActivityMeter` - Engagement metrics

### API Endpoints
- `GET /api/tango-communities` - List all communities
- `GET /api/tango-communities/:region` - Regional communities
- `GET /api/tango-communities/search` - Search communities
- `GET /api/tango-communities/styles` - Filter by style
- `GET /api/tango-communities/stats` - Global statistics
- `GET /api/tango-communities/:id` - Community details
- `POST /api/tango-communities/join` - Join community

### Real-time Features
- Live member counts
- Real-time activity updates
- Dynamic event counters
- Live join notifications
- Trending communities

### Database Tables
- `tango_communities` - Community registry
- `community_regions` - Geographic data
- `community_styles` - Dance styles
- `community_metrics` - Activity metrics
- `community_leaders` - Leadership info
- `community_history` - Historical data

## 3. User Permissions
- **Guest**: View directory
- **User**: Join communities
- **Member**: Access member content
- **Leader**: Manage community
- **Admin**: Directory management

## 4. MT Ocean Theme Implementation
```css
/* Directory header gradient */
.directory-header {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #0F766E 80%, #155E75 100%);
  padding: 50px;
  text-align: center;
  color: white;
}

/* Community cards grid */
.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  padding: 30px;
}

/* Community card styling */
.tango-community-card {
  background: white;
  border: 2px solid rgba(94, 234, 212, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.tango-community-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(94, 234, 212, 0.2);
  border-color: #5EEAD4;
}

/* Activity meter gradient */
.activity-meter {
  height: 6px;
  background: linear-gradient(90deg, #5EEAD4 0%, #14B8A6 var(--activity));
  border-radius: 3px;
  margin: 10px 0;
}

/* Style badge */
.style-badge {
  background: linear-gradient(45deg, #14B8A6, #0D9488);
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  display: inline-block;
  margin: 2px;
}

/* Member count display */
.member-count {
  background: rgba(94, 234, 212, 0.1);
  color: #0F766E;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Region indicator */
.region-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #5EEAD4, #14B8A6);
  color: white;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 13px;
}
```

## 5. Test Coverage
- **Unit Tests**: 80% coverage
- **Integration Tests**: Directory features
- **E2E Tests**: User interactions
- **Filter Tests**: Search functionality
- **Performance Tests**: Large listings

## 6. Known Issues
- Filter combination performance
- Image lazy loading on scroll
- Mobile filter panel UX
- Search relevance ranking

## 7. Agent Responsibilities
- **Directory Agent**: Listing management
- **Search Agent**: Query processing
- **Filter Agent**: Filter logic
- **Analytics Agent**: Metrics tracking
- **Content Agent**: Description management

## 8. Integration Points
- **Search Service**: Full-text search
- **Analytics Service**: Activity tracking
- **Image Service**: Community logos
- **Cache Service**: Performance
- **Recommendation Service**: Suggestions
- **Translation Service**: Multi-language

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Filter Apply**: < 500ms
- **Search Results**: < 1 second
- **Card Render**: < 100ms each
- **Infinite Scroll**: < 500ms
- **Memory Usage**: < 100MB

## 10. Accessibility
- **Screen Reader**: Community info
- **Keyboard Navigation**: Browse cards
- **Filter Announce**: State changes
- **Color Indicators**: With text
- **Focus Management**: Clear flow
- **Mobile Gestures**: Swipe support