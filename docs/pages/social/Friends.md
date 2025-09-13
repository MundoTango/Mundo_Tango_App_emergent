# Friends Page Documentation

## 1. Overview
- **Route**: `/friends`
- **Purpose**: Friend management hub for connections, requests, and social networking
- **ESA Framework Layer**: Layer 3 - Social Network

## 2. Technical Implementation

### Components
- `client/src/pages/Friends.tsx` - Main friends page
- `FriendRequestList` - Pending requests
- `FriendRequestForm` - Send friend requests
- `FriendsList` - Current connections
- `SuggestedFriends` - AI recommendations
- `MutualFriends` - Shared connections
- `FriendSearch` - Find friends
- `ConnectionDegree` - Network visualization

### API Endpoints
- `GET /api/friends` - List friends
- `GET /api/friends/requests` - Pending requests
- `POST /api/friends/request` - Send request
- `POST /api/friends/accept` - Accept request
- `DELETE /api/friends/:id` - Remove friend
- `GET /api/friends/suggestions` - AI suggestions
- `GET /api/friends/mutual/:userId` - Mutual friends

### Real-time Features
- Live friend request notifications
- Online status updates
- Real-time activity feed
- Instant messaging integration
- Live mutual friend updates

### Database Tables
- `friendships` - Friend connections
- `friend_requests` - Pending requests
- `friend_suggestions` - AI recommendations
- `mutual_connections` - Shared friends
- `friend_activity` - Activity tracking
- `blocked_users` - Block list

## 3. User Permissions
- **User**: Manage own connections
- **Premium**: Advanced search filters
- **Verified**: Trust badges
- **Admin**: Connection oversight
- **Blocked**: No interaction

## 4. MT Ocean Theme Implementation
```css
/* Friends header gradient */
.friends-header {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #155E75 100%);
  padding: 30px;
  border-radius: 16px;
  color: white;
}

/* Friend card */
.friend-card {
  background: white;
  border: 2px solid rgba(94, 234, 212, 0.2);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
}

.friend-card:hover {
  border-color: #5EEAD4;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(94, 234, 212, 0.15);
}

/* Online status indicator */
.online-status {
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Request button */
.request-button {
  background: linear-gradient(90deg, #14B8A6, #0D9488);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
}
```

## 5. Test Coverage
- **Unit Tests**: 85% coverage
- **Integration Tests**: Friend workflows
- **E2E Tests**: Connection flows
- **Performance Tests**: Large friend lists
- **Security Tests**: Privacy enforcement

## 6. Known Issues
- Suggestion algorithm cold start
- Pagination scroll position
- Mutual friends calculation lag
- Mobile request button size

## 7. Agent Responsibilities
- **Social Agent**: Connection management
- **Recommendation Agent**: Friend suggestions
- **Activity Agent**: Feed curation
- **Privacy Agent**: Access control
- **Notification Agent**: Request alerts

## 8. Integration Points
- **ML Service**: Recommendation engine
- **Notification Service**: Request alerts
- **Messaging Service**: Chat integration
- **Activity Service**: Feed updates
- **Search Service**: Friend discovery
- **Analytics Service**: Social metrics

## 9. Performance Metrics
- **Page Load**: < 1.5 seconds
- **Request Action**: < 500ms
- **Search Results**: < 1 second
- **Suggestion Generation**: < 2 seconds
- **Friend List Render**: < 1 second
- **Memory Usage**: < 100MB

## 10. Accessibility
- **Screen Reader**: Friend list navigation
- **Keyboard Navigation**: All actions
- **Status Indicators**: Text alternatives
- **Touch Targets**: Mobile-sized
- **Color Coding**: Not sole indicator
- **Focus Management**: Logical flow