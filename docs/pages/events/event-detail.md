# Event Detail Page Documentation

## 1. Overview
- **Route**: `/events/:id`
- **Purpose**: Comprehensive single event view with all details, attendees, and interactions
- **ESA Framework Layer**: Layer 3 - Event Experience

## 2. Technical Implementation

### Components
- `client/src/pages/event-detail.tsx` - Event detail page
- `EventHeader` - Hero section with key info
- `AttendeesList` - Participant display
- `EventGallery` - Photo/video gallery
- `CommentSection` - Discussion thread
- `TicketPurchase` - Booking interface
- `VenueMap` - Location details
- `ShareModal` - Sharing options

### API Endpoints
- `GET /api/events/:id` - Event details
- `GET /api/events/:id/attendees` - Attendee list
- `POST /api/events/:id/rsvp` - RSVP to event (4 status values)
- `POST /api/events/:id/comments` - Add comment
- `GET /api/events/:id/gallery` - Media gallery
- `POST /api/events/:id/tickets` - Purchase tickets
- `PUT /api/events/:id` - Update event (owner)

### RSVP Status Values

The event detail page supports 4 distinct RSVP states with visual indicators:

| Status | Icon | Description | Counts Toward Attendance |
|--------|------|-------------|-------------------------|
| **Going** | ✅ (turquoise) | User confirmed attendance | Yes |
| **Interested** | ⭐ (yellow) | User interested but not committed | No |
| **Maybe** | ❓ (purple) | User tentatively attending | No |
| **Not Going** | ❌ (red) | User declined | No |

Only the "going" status increments the attendee count displayed on the event.

### Quick RSVP Sidebar Integration

The [UpcomingEventsSidebar](./UpcomingEventsSidebar.md) provides one-click RSVP updates without navigating to the event detail page. This sidebar widget displays upcoming events with inline RSVP buttons for instant status changes.

### Real-time Features
- Live attendee count updates
- Real-time comments and reactions
- Dynamic ticket availability
- Live event status changes
- Instant RSVP confirmations

### Database Tables
- `event_details` - Extended event info
- `event_rsvps` - RSVP tracking
- `event_comments` - Discussion data
- `event_reactions` - Likes and reactions
- `event_gallery` - Media items
- `event_updates` - Event changes
- `event_views` - View tracking

## 3. User Permissions
- **Public**: View public event details
- **Authenticated**: RSVP and comment
- **Attendee**: Full gallery access
- **Organizer**: Edit and manage
- **Admin**: Moderation tools

## 4. MT Ocean Theme Implementation
```css
/* Event hero gradient */
.event-hero {
  background: linear-gradient(180deg, rgba(94, 234, 212, 0.8), rgba(21, 94, 117, 0.9)),
              url(var(--event-image));
  background-size: cover;
  background-position: center;
  min-height: 400px;
}

/* RSVP button states */
.rsvp-button {
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
  position: relative;
  overflow: hidden;
}

.rsvp-button.attending {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
}

/* Attendee avatars */
.attendee-avatar {
  border: 3px solid #5EEAD4;
  box-shadow: 0 4px 8px rgba(94, 234, 212, 0.2);
}

/* Comment thread */
.comment-card {
  border-left: 3px solid #5EEAD4;
  background: rgba(94, 234, 212, 0.02);
}
```

## 5. Test Coverage
- **Unit Tests**: 84% coverage
- **Integration Tests**: RSVP flow
- **E2E Tests**: Full interaction
- **Visual Tests**: Gallery rendering
- **Performance Tests**: Large attendee lists

## 6. Known Issues
- Gallery lazy loading on Safari
- Comment thread pagination
- Map widget mobile responsiveness
- Share preview image caching

## 7. Agent Responsibilities
- **Event Agent**: Data management
- **RSVP Agent**: Attendance handling
- **Comment Agent**: Discussion moderation
- **Gallery Agent**: Media management
- **Share Agent**: Social distribution

## 8. Integration Points
- **Maps API**: Venue location
- **Payment Gateway**: Ticket sales
- **Social Platforms**: Sharing
- **Calendar Services**: Add to calendar
- **Email Service**: Confirmations
- **Analytics Service**: Event tracking

## 9. Performance Metrics
- **Page Load**: < 2.5 seconds
- **Gallery Load**: Progressive
- **RSVP Action**: < 500ms
- **Comment Post**: < 300ms
- **Map Render**: < 1 second
- **Share Action**: < 200ms

## 10. Accessibility
- **Screen Reader**: Event details
- **Keyboard Navigation**: All actions
- **Image Descriptions**: Gallery items
- **Date/Time**: Localized format
- **Color Indicators**: With text
- **Mobile Gestures**: Gallery swipe