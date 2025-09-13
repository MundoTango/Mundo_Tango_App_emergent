# Events Page Documentation

## 1. Overview
- **Route**: `/events`
- **Purpose**: Central hub for discovering, creating, and managing tango events
- **ESA Framework Layer**: Layer 3 - Event Management

## 2. Technical Implementation

### Components
- `client/src/pages/Events.tsx` - Main events page
- `EventDiscoveryFeed` - Event browsing interface
- `EventCreationWizard` - Step-by-step event creation
- `RecurringEventManager` - Recurring event setup
- `EventFilters` - Search and filter options
- `EventCalendar` - Calendar view
- `EventMap` - Map-based discovery
- `EventRecommendations` - AI-powered suggestions

### API Endpoints
- `GET /api/events` - List events with filters
- `POST /api/events` - Create new event
- `GET /api/events/upcoming` - Upcoming events
- `GET /api/events/recommended` - Personalized recommendations
- `GET /api/events/search` - Search events
- `POST /api/events/recurring` - Create recurring series
- `GET /api/events/categories` - Event categories

### Real-time Features
- Live attendance updates
- Real-time event creation notifications
- Dynamic pricing updates
- Live RSVP tracking
- Event countdown timers

### Database Tables
- `events` - Main event data
- `event_attendees` - Attendance tracking
- `event_categories` - Event types
- `event_venues` - Venue information
- `event_recurring` - Recurring patterns
- `event_tickets` - Ticketing data
- `event_media` - Photos/videos

## 3. User Permissions
- **Guest**: View public events
- **User**: RSVP and create events
- **Organizer**: Full event management
- **Admin**: Moderation and analytics
- **Venue**: Venue-specific management

## 4. MT Ocean Theme Implementation
```css
/* Event cards gradient */
.event-card {
  background: white;
  border-top: 4px solid transparent;
  border-image: linear-gradient(90deg, #5EEAD4, #14B8A6) 1;
  box-shadow: 0 4px 6px rgba(94, 234, 212, 0.1);
}

/* Calendar header */
.event-calendar-header {
  background: linear-gradient(135deg, #5EEAD4 0%, #0D9488 100%);
  color: white;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

/* Create event button */
.create-event-btn {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  box-shadow: 0 8px 16px rgba(20, 184, 166, 0.3);
}

/* Filter badges */
.filter-badge {
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid #5EEAD4;
  color: #0F766E;
}
```

## 5. Test Coverage
- **Unit Tests**: 86% coverage
- **Integration Tests**: Event CRUD operations
- **E2E Tests**: Full event lifecycle
- **Performance Tests**: Large event lists
- **Accessibility Tests**: Calendar navigation

## 6. Known Issues
- Calendar view performance with 100+ events
- Map clustering on mobile devices
- Recurring event timezone handling
- Filter state persistence on navigation

## 7. Agent Responsibilities
- **Event Agent**: Event management and validation
- **Calendar Agent**: Scheduling and conflicts
- **Recommendation Agent**: Personalized suggestions
- **Notification Agent**: Event reminders
- **Analytics Agent**: Attendance tracking

## 8. Integration Points
- **Google Calendar**: Event sync
- **Maps Service**: Venue location
- **Payment Service**: Ticketing
- **Email Service**: Invitations and reminders
- **Social Service**: Event sharing
- **AI Service**: Recommendations

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Event Creation**: < 3 seconds
- **Search Response**: < 500ms
- **Map Render**: < 1 second
- **Calendar Switch**: < 300ms
- **Memory Usage**: < 120MB

## 10. Accessibility
- **Screen Reader**: Event descriptions
- **Keyboard Navigation**: Full calendar control
- **Date Picker**: Accessible controls
- **Color Coding**: Not sole indicator
- **Focus Management**: Logical flow
- **Mobile Touch**: Gesture support