# Role Invitations Documentation

## 1. Overview
- **Route**: `/invitations` (role-specific)
- **Purpose**: Role-based invitation system for dancers seeking partners for events and practices
- **ESA Framework Layer**: Layer 3 - Partner Matching

## 2. Technical Implementation

### Components
- `client/src/pages/RoleInvitations.tsx` - Role invitations page
- `RoleSelector` - Leader/Follower selection
- `InvitationCreator` - Create invitations
- `PartnerMatcher` - AI matching system
- `AvailabilityCalendar` - Schedule matching
- `SkillLevelFilter` - Experience matching
- `InvitationResponder` - Response interface
- `MatchNotifications` - Match alerts

### API Endpoints
- `GET /api/role-invitations` - List invitations
- `POST /api/role-invitations` - Create invitation
- `GET /api/role-invitations/matches` - Find matches
- `POST /api/role-invitations/respond` - Respond
- `GET /api/role-invitations/calendar` - Availability
- `PUT /api/role-invitations/:id` - Update invitation
- `DELETE /api/role-invitations/:id` - Cancel

### Real-time Features
- Live match notifications
- Real-time availability updates
- Instant response alerts
- Dynamic partner suggestions
- Live invitation status

### Database Tables
- `role_invitations` - Invitation data
- `partner_matches` - Match records
- `availability_schedules` - Time slots
- `skill_levels` - Experience data
- `match_preferences` - User preferences
- `invitation_responses` - Responses

## 3. User Permissions
- **User**: Create/respond to invitations
- **Premium**: Advanced matching
- **Verified**: Priority visibility
- **Admin**: System management
- **Blocked**: No access

## 4. MT Ocean Theme Implementation
```css
/* Role selection gradient */
.role-selector {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #155E75 100%);
  padding: 30px;
  border-radius: 20px;
  color: white;
}

/* Role cards */
.role-card {
  background: white;
  border: 3px solid transparent;
  border-image: linear-gradient(45deg, #5EEAD4, #0D9488) 1;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.role-card.selected {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.1), rgba(21, 94, 117, 0.05));
  transform: scale(1.02);
}

/* Match indicator */
.match-score {
  background: conic-gradient(
    from 0deg,
    #5EEAD4 0deg,
    #14B8A6 calc(var(--score) * 3.6deg),
    #e5e7eb calc(var(--score) * 3.6deg)
  );
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Invitation card */
.invitation-card {
  background: white;
  border-left: 4px solid #5EEAD4;
  box-shadow: 0 4px 12px rgba(94, 234, 212, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
}

/* Skill level badge */
.skill-badge {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

/* Response buttons */
.accept-partner {
  background: linear-gradient(90deg, #5EEAD4, #14B8A6);
  color: white;
  padding: 10px 25px;
  border-radius: 25px;
}

.decline-partner {
  background: transparent;
  border: 2px solid #ef4444;
  color: #ef4444;
  padding: 10px 25px;
  border-radius: 25px;
}
```

## 5. Test Coverage
- **Unit Tests**: 81% coverage
- **Integration Tests**: Matching algorithm
- **E2E Tests**: Full invitation flow
- **Algorithm Tests**: Match accuracy
- **Performance Tests**: Large datasets

## 6. Known Issues
- Match algorithm bias detection
- Calendar sync delays
- Mobile calendar interface
- Skill level self-assessment accuracy

## 7. Agent Responsibilities
- **Matching Agent**: Partner matching
- **Calendar Agent**: Schedule coordination
- **Invitation Agent**: Invitation management
- **Skill Agent**: Level assessment
- **Notification Agent**: Match alerts

## 8. Integration Points
- **ML Service**: Matching algorithm
- **Calendar Service**: Availability sync
- **Notification Service**: Real-time alerts
- **Analytics Service**: Match success tracking
- **Profile Service**: User preferences
- **Event Service**: Event integration

## 9. Performance Metrics
- **Page Load**: < 1.5 seconds
- **Match Generation**: < 2 seconds
- **Response Action**: < 500ms
- **Calendar Load**: < 1 second
- **Notification Delivery**: < 1 second
- **Match Success Rate**: > 60%

## 10. Accessibility
- **Screen Reader**: Role descriptions
- **Keyboard Navigation**: Full support
- **Color Indicators**: With text labels
- **Calendar Navigation**: Arrow keys
- **Form Validation**: Clear messages
- **Mobile Touch**: Swipe actions