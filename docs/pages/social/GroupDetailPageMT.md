# Group Detail Page MT Documentation

## 1. Overview
- **Route**: `/groups/:slug`
- **Purpose**: Detailed group view with member management, content feed, and group activities
- **ESA Framework Layer**: Layer 3 - Community Engagement

## 2. Technical Implementation

### Components
- `client/src/pages/GroupDetailPageMT.tsx` - Group detail page
- `GroupHeader` - Group info and stats
- `MembersList` - Group members display
- `GroupFeed` - Group posts and updates
- `GroupEvents` - Group-specific events
- `GroupGallery` - Shared media
- `GroupSettings` - Admin controls
- `GroupInsights` - Analytics dashboard

### API Endpoints
- `GET /api/groups/:slug` - Group details
- `GET /api/groups/:slug/members` - Member list
- `GET /api/groups/:slug/posts` - Group feed
- `POST /api/groups/:slug/post` - Create post
- `GET /api/groups/:slug/events` - Group events
- `PUT /api/groups/:slug/settings` - Update settings
- `GET /api/groups/:slug/analytics` - Group insights

### Real-time Features
- Live member count
- Real-time group feed
- Instant post notifications
- Live member activity
- Dynamic event updates
- Real-time polls

### Database Tables
- `group_details` - Extended group info
- `group_posts` - Group content
- `group_members` - Membership data
- `group_events` - Group events
- `group_media` - Shared files
- `group_settings` - Configuration
- `group_analytics` - Metrics

## 3. User Permissions
- **Non-member**: Limited view
- **Member**: Full participation
- **Moderator**: Content management
- **Admin**: Group settings
- **Owner**: Full control

## 4. MT Ocean Theme Implementation
```css
/* Group header with ocean gradient */
.group-header {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #0F766E 80%, #155E75 100%);
  min-height: 300px;
  padding: 40px;
  border-radius: 0 0 24px 24px;
  position: relative;
}

/* Group stats cards */
.group-stat {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(94, 234, 212, 0.3);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
}

/* Member avatars with gradient border */
.member-avatar {
  border: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, #5EEAD4, #0D9488) border-box;
  border-radius: 50%;
}

/* Post card in feed */
.group-post {
  background: white;
  border-left: 4px solid #5EEAD4;
  box-shadow: 0 2px 8px rgba(94, 234, 212, 0.1);
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 8px;
}

/* Admin badge */
.admin-badge {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

/* Event card */
.group-event-card {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.1), rgba(21, 94, 117, 0.05));
  border: 1px solid #5EEAD4;
  border-radius: 12px;
  padding: 15px;
}
```

## 5. Test Coverage
- **Unit Tests**: 82% coverage
- **Integration Tests**: Group operations
- **E2E Tests**: Member interactions
- **Permission Tests**: Role-based access
- **Performance Tests**: Large groups

## 6. Known Issues
- Member list virtualization needed
- Feed infinite scroll memory
- Gallery loading performance
- Mobile settings panel layout

## 7. Agent Responsibilities
- **Group Agent**: Group management
- **Content Agent**: Feed curation
- **Member Agent**: Membership handling
- **Event Agent**: Group events
- **Analytics Agent**: Insights generation

## 8. Integration Points
- **Feed Service**: Content management
- **Event Service**: Group events
- **Media Service**: File storage
- **Analytics Service**: Group metrics
- **Notification Service**: Member alerts
- **Permission Service**: RBAC

## 9. Performance Metrics
- **Page Load**: < 2.5 seconds
- **Feed Load**: < 1 second
- **Member List**: < 1.5 seconds
- **Post Creation**: < 500ms
- **Media Upload**: < 5 seconds
- **Memory Usage**: < 150MB

## 10. Accessibility
- **Screen Reader**: Group navigation
- **Keyboard Shortcuts**: Quick actions
- **Focus Management**: Logical flow
- **ARIA Labels**: Interactive elements
- **Color Contrast**: WCAG compliant
- **Mobile Touch**: Optimized targets