# API Routes Reference
## ESA LIFE CEO 61x21 Framework - Complete Backend API Map

**Last Updated:** October 10, 2025  
**Purpose:** Comprehensive API endpoint documentation for integration  
**Framework Reference:** ESA.md (61 Technical Layers)

---

## 📚 Quick Navigation

| Category | ESA Layers | Endpoints |
|----------|-----------|-----------|
| [Authentication & Users](#authentication--users) | 4, 5, 21 | 15+ routes |
| [Social Features](#social-features) | 24, 25 | 30+ routes |
| [Events System](#events-system) | 23 | 20+ routes |
| [Housing & Marketplace](#housing--marketplace) | 28, 29 | 25+ routes |
| [Real-time & Notifications](#real-time--notifications) | 11, 16 | 10+ routes |
| [Search & Discovery](#search--discovery) | 15 | 8+ routes |
| [Admin & Moderation](#admin--moderation) | 5, 19 | 12+ routes |
| [Media & Content](#media--content) | 13, 19 | 10+ routes |

---

## 🔐 Authentication & Users
**ESA Layers:** 4 (Authentication), 5 (Authorization), 21 (User Management)

### Authentication
```
POST   /api/auth/login                    # User login with credentials
POST   /api/auth/register                 # New user registration
POST   /api/auth/logout                   # User logout
POST   /api/auth/refresh                  # Refresh auth token
GET    /api/auth/verify                   # Verify current session
POST   /api/auth/forgot-password          # Password reset request
POST   /api/auth/reset-password           # Complete password reset
POST   /api/auth/verify-email             # Email verification
```

### User Management
```
GET    /api/user                          # Get current user profile
PUT    /api/user                          # Update user profile
DELETE /api/user                          # Delete user account
GET    /api/user/:id                      # Get user by ID
GET    /api/users/search                  # Search users
GET    /api/user/global-search            # Global platform search
POST   /api/user/upload-avatar            # Upload profile picture
GET    /api/user/stats                    # User statistics
```

---

## 👥 Social Features
**ESA Layers:** 24 (Social Features), 25 (Messaging)

### Posts & Feed
```
GET    /api/posts                         # Get all posts (paginated)
GET    /api/posts/feed                    # Get personalized feed
POST   /api/posts                         # Create new post (with images)
POST   /api/posts/with-image              # Create post with single image
POST   /api/posts/direct                  # Direct post creation
GET    /api/posts/:id                     # Get specific post
PUT    /api/posts/:id                     # Update post
DELETE /api/posts/:id                     # Delete post
POST   /api/posts/:id/like                # Toggle like on post
POST   /api/posts/:id/reactions           # Add emoji reaction
POST   /api/posts/:id/enhance             # AI enhance post
POST   /api/posts/enhance-content         # AI enhance content
GET    /api/posts/mentions/city/:cityId   # Posts mentioning city
GET    /api/posts/mentions/group/:groupId # Posts mentioning group
GET    /api/posts/mentions/event/:eventId # Posts mentioning event
POST   /api/posts/share                   # Share post
```

### Comments
```
GET    /api/posts/:postId/comments        # Get post comments
POST   /api/posts/:postId/comments        # Add comment
GET    /api/comments                      # Get all comments
PUT    /api/comments/:id                  # Update comment
DELETE /api/comments/:id                  # Delete comment
```

### Friends & Relationships
```
GET    /friendship/:friendId              # Get friendship status
POST   /friendship/:friendId              # Send friend request
DELETE /friendship/:friendId              # Remove friendship
GET    /friendship/:friendId/mutual-friends    # Get mutual friends
GET    /friendship/shared-memories/:friendId   # Shared memories
GET    /friendship/timeline/:friendId     # Friendship timeline
GET    /friendship/stats/:friendId        # Friendship statistics
```

### Tags & Mentions
```
GET    /api/tags/trending                 # Trending hashtags
GET    /api/tags/recent                   # Recent tags
GET    /api/tags/popular                  # Popular tags
GET    /api/tags/search                   # Search tags
GET    /api/mentions                      # User mentions
GET    /api/mentions/notifications        # Mention notifications
GET    /api/mentions/notifications/count  # Unread mention count
PATCH  /api/mentions/notifications/:id/read   # Mark mention as read
```

---

## 📅 Events System
**ESA Layer:** 23 (Event Management)

### Event Management
```
GET    /api/events                        # List all events
GET    /api/events/upcoming               # Upcoming events
GET    /api/events/feed                   # Personalized event feed
POST   /api/events                        # Create new event
GET    /api/events/:id                    # Get event details
PUT    /api/events/:id                    # Update event
DELETE /api/events/:id                    # Delete event
POST   /api/events/:id/rsvp               # RSVP to event (going/interested/maybe/not-going)
GET    /api/events/:id/attendees          # Get event attendees
POST   /api/events/:id/share              # Share event
GET    /api/user/events                   # User's events
GET    /api/events/city/:cityId           # Events by city
GET    /api/events/organizer/:organizerId # Events by organizer
```

### Streaming & Video
```
POST   /streams                           # Create stream
POST   /streams/:streamId/start           # Start stream
POST   /streams/:streamId/end             # End stream
GET    /streams/active                    # Active streams
GET    /streams/scheduled                 # Scheduled streams
GET    /streams/:streamId                 # Get stream details
GET    /streams/:streamId/analytics       # Stream analytics
POST   /video-calls                       # Create video call
GET    /video-calls/:roomId               # Get video call room
PATCH  /video-calls/:roomId/status        # Update call status
```

---

## 🏠 Housing & Marketplace
**ESA Layers:** 28 (Marketplace), 29 (Booking System)

### Housing Listings
```
GET    /api/housing                       # List housing options
POST   /api/housing                       # Create listing
GET    /api/housing/:id                   # Get listing details
PUT    /api/housing/:id                   # Update listing
DELETE /api/housing/:id                   # Delete listing
GET    /api/housing/search                # Search listings
GET    /api/housing/featured              # Featured listings
POST   /api/housing/:id/favorite          # Favorite listing
GET    /api/user/favorites/housing        # User's favorite listings
```

### Bookings
```
GET    /api/bookings                      # List bookings
POST   /api/bookings                      # Create booking
GET    /api/bookings/:id                  # Get booking details
PUT    /api/bookings/:id                  # Update booking
DELETE /api/bookings/:id                  # Cancel booking
POST   /api/bookings/:id/confirm          # Confirm booking
POST   /api/bookings/:id/reject           # Reject booking
GET    /api/host/bookings                 # Host bookings
GET    /api/guest/bookings                # Guest bookings
```

### Reviews & Ratings
```
POST   /api/reviews                       # Create review
GET    /api/reviews/:targetId             # Get reviews for target
PUT    /api/reviews/:id                   # Update review
DELETE /api/reviews/:id                   # Delete review
GET    /api/user/reviews                  # User's reviews
```

---

## 🔔 Real-time & Notifications
**ESA Layers:** 11 (Real-time Features), 16 (Notification System)

### Notifications
```
GET    /api/notifications                 # List notifications
GET    /api/notifications/count           # Unread count
PUT    /api/notifications/:id/read        # Mark as read
PUT    /api/notifications/mark-all-read   # Mark all as read
DELETE /api/notifications/:id             # Delete notification
```

### Messages
```
GET    /api/messages                      # List messages
GET    /api/messages/unread-count         # Unread message count
GET    /api/messages/conversation/:userId # Get conversation
POST   /api/messages                      # Send message
PUT    /api/messages/:id/read             # Mark message as read
DELETE /api/messages/:id                  # Delete message
```

### WebSocket Events
```
WS     /ws                                # WebSocket connection
Event: 'notification'                     # New notification
Event: 'new-message'                      # New message received
Event: 'post-update'                      # Post updated
Event: 'event-update'                     # Event updated
```

---

## 🔍 Search & Discovery
**ESA Layer:** 15 (Search & Discovery)

### Global Search
```
GET    /api/user/global-search            # Search across platform
  Query: q (search term)
  Returns: { posts, events, users, groups }

GET    /api/search/posts                  # Search posts only
GET    /api/search/events                 # Search events only
GET    /api/search/users                  # Search users only
GET    /api/search/groups                 # Search groups only
GET    /api/search/housing                # Search housing listings
```

### Recommendations
```
GET    /api/recommendations/users         # Recommended users
GET    /api/recommendations/events        # Recommended events
GET    /api/recommendations/groups        # Recommended groups
GET    /api/recommendations/housing       # Recommended listings
```

---

## 🏛️ Community & Groups
**ESA Layer:** 22 (Group Management)

### City Groups
```
GET    /api/city-groups                   # List city groups
GET    /api/city-groups/:id               # Get group details
POST   /api/city-groups/:id/join          # Join group
DELETE /api/city-groups/:id/leave         # Leave group
GET    /api/city-groups/:id/members       # Group members
GET    /api/city-groups/:id/posts         # Group posts
GET    /api/city-groups/:id/events        # Group events
GET    /api/community/map-data            # Community map data
GET    /api/community/world-map           # World map data
GET    /api/community/city-groups-stats   # City group statistics
```

---

## 🛡️ Admin & Moderation
**ESA Layer:** 5 (Authorization), 19 (Content Management)

### Admin Routes (require admin role)
```
GET    /admin/users                       # List all users
PUT    /admin/users/:id/role              # Update user role
DELETE /admin/users/:id                   # Delete user (admin)
GET    /admin/posts                       # All posts (moderation)
GET    /admin/reports                     # Content reports
PUT    /admin/reports/:id/resolve         # Resolve report
GET    /admin/moderation/pending          # Pending moderation
POST   /admin/moderation/:id/approve      # Approve content
POST   /admin/moderation/:id/reject       # Reject content
GET    /admin/analytics                   # Platform analytics
GET    /admin/system/health               # System health
```

### Reports & Safety
```
POST   /api/reports                       # Submit report
  Body: { type: 'post'|'user'|'event', targetId, reason }
GET    /api/reports/my                    # User's reports
POST   /api/users/:id/block               # Block user
DELETE /api/users/:id/block               # Unblock user
GET    /api/blocked-users                 # List blocked users
```

---

## 🎨 Media & Content
**ESA Layers:** 13 (File Management), 19 (Content Management)

### Media Processing
```
GET    /status                            # Media service status
POST   /optimize-image                    # Optimize image
POST   /process-video                     # Process video
GET    /stats                             # Media statistics
POST   /suggest-format                    # Suggest optimal format
```

### Uploads
```
POST   /api/upload/image                  # Upload image
POST   /api/upload/avatar                 # Upload avatar
POST   /api/upload/video                  # Upload video
POST   /api/upload/document               # Upload document
DELETE /api/media/:id                     # Delete media
```

---

## 💳 Payments & Billing
**ESA Layer:** 17 (Payment Processing)

### Stripe Integration
```
POST   /api/payments/create-intent        # Create payment intent
POST   /api/payments/confirm              # Confirm payment
GET    /api/payments/history              # Payment history
POST   /api/subscriptions/create          # Create subscription
PUT    /api/subscriptions/:id/cancel      # Cancel subscription
GET    /api/subscriptions/status          # Subscription status
POST   /api/payments/refund               # Request refund
```

---

## 🎯 Favorites & Saved Content
**ESA Layer:** 24 (Social Features)

### Favorites
```
GET    /api/favorites                     # List all favorites
POST   /api/favorites                     # Add to favorites
  Body: { type: 'post'|'event'|'housing', targetId }
DELETE /api/favorites/:id                 # Remove from favorites
GET    /api/saved-posts                   # Saved posts
POST   /api/saved-posts                   # Save post
DELETE /api/saved-posts/:id               # Unsave post
```

---

## 📊 Analytics & Metrics
**ESA Layer:** 18 (Reporting & Analytics)

### User Analytics
```
GET    /api/analytics/user/engagement     # User engagement stats
GET    /api/analytics/user/growth         # User growth metrics
GET    /api/analytics/posts/performance   # Post performance
GET    /api/analytics/events/attendance   # Event attendance stats
```

### Platform Metrics
```
GET    /api/metrics/platform              # Platform-wide metrics
GET    /api/metrics/active-users          # Active users count
GET    /api/metrics/content-stats         # Content statistics
```

---

## 🔧 System & Health
**ESA Layer:** 48 (Performance Monitoring)

### Health Checks
```
GET    /api/health                        # System health check
GET    /api/health/db                     # Database health
GET    /api/health/cache                  # Cache health
GET    /api/version                       # API version info
```

---

## 🌐 Internationalization
**ESA Layer:** 40 (Natural Language)

### Translation
```
GET    /api/translations/:language        # Get translations
POST   /api/translations/generate         # Generate new translations
PUT    /api/translations/:key             # Update translation
```

**Supported Languages:** 68 total (6 primary: EN, ES, FR, DE, IT, PT)

---

## 📝 API Request Patterns

### Authentication Headers
```typescript
// All authenticated requests require:
headers: {
  'Content-Type': 'application/json',
  // Session cookie automatically included
}
credentials: 'include' // For fetch requests
```

### Pagination Pattern
```typescript
// List endpoints support pagination:
GET /api/posts?page=1&limit=20
GET /api/events?page=1&limit=20

// Response format:
{
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    hasMore: true
  }
}
```

### Filter Pattern
```typescript
// Feed endpoints support filtering:
GET /api/posts/feed?filterType=all&tags=tango,milonga&startDate=2025-10-01

// Available filters:
- filterType: 'all' | 'residents' | 'visitors' | 'friends'
- tags: array of hashtags
- startDate/endDate: date range
- searchQuery: text search
```

### Error Responses
```typescript
// Standard error format:
{
  success: false,
  message: "Error description",
  error?: "Technical details" // Only in development
}
```

---

## 🚀 Integration Checklist

When integrating a new module, ensure it:

- [ ] Uses proper authentication (session cookies)
- [ ] Follows pagination pattern for lists
- [ ] Implements filtering for feed endpoints
- [ ] Returns consistent error format
- [ ] Invalidates React Query cache on mutations
- [ ] Supports i18n for user-facing messages
- [ ] Includes proper TypeScript types from `shared/schema.ts`
- [ ] Uses optimistic updates for instant UI feedback
- [ ] Maps to appropriate ESA framework layer

---

## 📚 Related Documentation

- **Data Models:** `shared/schema.ts`
- **Frontend Routes:** `client/src/config/routes.ts`
- **Page Registry:** `docs/pages/page-audit-registry.json`
- **ESA Framework:** `ESA.md` (61 Technical Layers)
- **Design System:** `docs/pages/design-systems/aurora-tide.md`

---

**For detailed API implementation, see:**
- `server/routes/` - All route implementations
- `server/storage.ts` - Database operations
- `server/middleware/` - Auth & validation middleware
