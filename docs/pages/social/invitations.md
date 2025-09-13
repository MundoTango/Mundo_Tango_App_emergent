# Invitations Page Documentation

## 1. Overview
- **Route**: `/invitations`
- **Purpose**: Central hub for managing all types of invitations (events, groups, friendships)
- **ESA Framework Layer**: Layer 3 - Social Engagement

## 2. Technical Implementation

### Components
- `client/src/pages/invitations.tsx` - Main invitations page
- `InvitationsList` - All invitations display
- `InvitationCard` - Individual invitation
- `InvitationFilters` - Type/status filters
- `BulkActions` - Multi-select actions
- `InvitationPreview` - Detailed view
- `ResponseActions` - Accept/decline/maybe
- `InvitationHistory` - Past invitations

### API Endpoints
- `GET /api/invitations` - List all invitations
- `GET /api/invitations/pending` - Pending only
- `POST /api/invitations/respond` - Respond to invitation
- `POST /api/invitations/bulk` - Bulk actions
- `DELETE /api/invitations/:id` - Delete invitation
- `GET /api/invitations/sent` - Sent invitations
- `POST /api/invitations/remind` - Send reminder

### Real-time Features
- Live invitation notifications
- Real-time RSVP updates
- Instant response confirmations
- Live invitation status
- Push notifications

### Database Tables
- `invitations` - All invitation types
- `invitation_responses` - User responses
- `invitation_reminders` - Reminder tracking
- `invitation_templates` - Message templates
- `invitation_analytics` - Response metrics

## 3. User Permissions
- **User**: Manage own invitations
- **Premium**: Priority invitations
- **Organizer**: Bulk invite tools
- **Admin**: System invitations
- **Blocked**: No invitations

## 4. MT Ocean Theme Implementation
```css
/* Invitations header gradient */
.invitations-header {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #155E75 100%);
  padding: 30px;
  border-radius: 16px;
}

/* Invitation card types */
.invitation-card {
  background: white;
  border-left: 4px solid transparent;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.invitation-card.event {
  border-left-color: #5EEAD4;
}

.invitation-card.group {
  border-left-color: #14B8A6;
}

.invitation-card.friend {
  border-left-color: #0D9488;
}

/* Response buttons */
.accept-button {
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
  color: white;
}

.decline-button {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.maybe-button {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
  border: 1px solid #f59e0b;
}

/* Notification badge */
.invitation-badge {
  background: linear-gradient(135deg, #14B8A6, #0F766E);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
```

## 5. Test Coverage
- **Unit Tests**: 80% coverage
- **Integration Tests**: Response flows
- **E2E Tests**: Full invitation cycle
- **Notification Tests**: Alert delivery
- **Performance Tests**: Bulk operations

## 6. Known Issues
- Bulk action timeout with 100+ items
- Notification delivery delays
- Filter state persistence
- Mobile swipe gestures conflict

## 7. Agent Responsibilities
- **Invitation Agent**: Invitation management
- **Notification Agent**: Alert delivery
- **Response Agent**: RSVP handling
- **Analytics Agent**: Response tracking
- **Reminder Agent**: Follow-up messages

## 8. Integration Points
- **Notification Service**: Push alerts
- **Email Service**: Invitation emails
- **Calendar Service**: Event sync
- **Analytics Service**: Response rates
- **Group Service**: Group invites
- **Event Service**: Event invitations

## 9. Performance Metrics
- **Page Load**: < 1.5 seconds
- **Response Action**: < 500ms
- **Bulk Operation**: < 3 seconds
- **Filter Apply**: < 300ms
- **Notification Delivery**: < 2 seconds
- **Memory Usage**: < 80MB

## 10. Accessibility
- **Screen Reader**: Invitation details
- **Keyboard Navigation**: Quick responses
- **Color Indicators**: With text labels
- **Touch Gestures**: Swipe actions
- **Batch Selection**: Keyboard support
- **Status Announcements**: Live regions