# Groups Page Documentation

## 1. Overview
- **Route**: `/groups`
- **Purpose**: Community groups hub for role-based and city-based tango communities
- **ESA Framework Layer**: Layer 3 - Community Building

## 2. Technical Implementation

### Components
- `client/src/pages/groups.tsx` - Main groups page
- `CommunityCard` - Group display cards
- `EnhancedCityGroupCard` - City group cards
- `GroupFilters` - Search and filter
- `GroupCreator` - Create new groups
- `MembershipManager` - Join/leave groups
- `GroupSearch` - Discovery interface
- `RoleBasedGroups` - Role-specific groups

### API Endpoints
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:slug` - Group details
- `POST /api/user/join-group/:slug` - Join group
- `DELETE /api/user/leave-group/:slug` - Leave group
- `GET /api/groups/recommended` - Suggestions
- `GET /api/groups/city/:city` - City groups

### Real-time Features
- Live member count updates
- Real-time group activity
- Instant join confirmations
- Live group posts
- Member online status

### Database Tables
- `groups` - Group information
- `group_members` - Membership data
- `group_posts` - Group content
- `group_roles` - Role assignments
- `city_groups` - Location-based groups
- `group_invites` - Invitations

## 3. User Permissions
- **Guest**: View public groups
- **Member**: Join and participate
- **Moderator**: Content management
- **Admin**: Full group control
- **Owner**: Group settings

## 4. MT Ocean Theme Implementation
```css
/* Groups page gradient */
.groups-page {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #0F766E 75%, #155E75 100%);
  min-height: 100vh;
}

/* Group card styling */
.group-card {
  background: white;
  border: 2px solid rgba(94, 234, 212, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(94, 234, 212, 0.2);
  border-color: #5EEAD4;
}

/* City group badge */
.city-badge {
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

/* Member count indicator */
.member-count {
  background: rgba(94, 234, 212, 0.1);
  color: #0F766E;
  padding: 8px 16px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Join button */
.join-button {
  background: linear-gradient(90deg, #14B8A6, #0D9488);
  color: white;
  padding: 10px 24px;
  border-radius: 25px;
  font-weight: 600;
}
```

## 5. Test Coverage
- **Unit Tests**: 83% coverage
- **Integration Tests**: Group operations
- **E2E Tests**: Join/leave flows
- **Performance Tests**: Large groups
- **Role Tests**: Permission checks

## 6. Known Issues
- Group search relevance
- Member list pagination
- City detection accuracy
- Role inheritance complexity

## 7. Agent Responsibilities
- **Group Agent**: Group management
- **Community Agent**: Content curation
- **Location Agent**: City groups
- **Role Agent**: Permission handling
- **Activity Agent**: Feed management

## 8. Integration Points
- **Location Service**: City detection
- **Role Service**: RBAC system
- **Activity Service**: Group feeds
- **Notification Service**: Group alerts
- **Search Service**: Discovery
- **Analytics Service**: Engagement

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Join Action**: < 500ms
- **Search Results**: < 1 second
- **Member List**: < 1.5 seconds
- **Post Load**: < 1 second
- **Cache Hit Rate**: > 70%

## 10. Accessibility
- **Screen Reader**: Group descriptions
- **Keyboard Navigation**: Full support
- **Role Indicators**: Clear labels
- **Color Coding**: With text
- **Touch Targets**: Mobile-optimized
- **Language Support**: Multi-lingual