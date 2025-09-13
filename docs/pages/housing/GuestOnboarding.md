# Guest Onboarding Documentation

## 1. Overview
- **Route**: `/guest-onboarding`
- **Purpose**: Onboarding flow for guests seeking tango-friendly accommodations
- **ESA Framework Layer**: Layer 2 - User Onboarding

## 2. Technical Implementation

### Components
- `client/src/pages/GuestOnboarding.tsx` - Main guest flow
- `GuestOnboardingFlow` - Step management
- `TravelPreferences` - Stay preferences
- `BudgetSelector` - Price range setting
- `LocationPreferences` - Area selection
- `AmenityPriorities` - Feature ranking
- `TangoSchedule` - Event attendance plans
- `HostPreferences` - Host type selection

### API Endpoints
- `POST /api/guest/onboarding/start` - Begin onboarding
- `PUT /api/guest/onboarding/preferences` - Save preferences
- `GET /api/guest/onboarding/suggestions` - Get recommendations
- `POST /api/guest/onboarding/complete` - Finish setup
- `GET /api/guest/saved-searches` - Retrieve searches
- `POST /api/guest/alerts` - Set up alerts

### Real-time Features
- Dynamic recommendation updates
- Live availability checking
- Instant match notifications
- Real-time pricing updates
- Location-based suggestions

### Database Tables
- `guest_profiles` - Guest preferences
- `guest_searches` - Saved searches
- `guest_alerts` - Notification settings
- `guest_favorites` - Saved properties
- `guest_preferences` - Stay preferences
- `booking_history` - Past bookings

## 3. User Permissions
- **New Guest**: Full onboarding
- **Returning Guest**: Quick search
- **Verified Guest**: Priority access
- **Admin**: Profile management

## 4. MT Ocean Theme Implementation
```css
/* Guest welcome gradient */
.guest-welcome {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #155E75 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Preference cards */
.preference-card {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(94, 234, 212, 0.3);
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.preference-card.selected {
  background: rgba(94, 234, 212, 0.1);
  border-color: #5EEAD4;
  transform: scale(1.02);
}

/* Budget slider */
.budget-slider {
  background: linear-gradient(90deg, #5EEAD4 0%, #0D9488 100%);
  height: 8px;
  border-radius: 4px;
}

/* Match indicator */
.match-badge {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
}
```

## 5. Test Coverage
- **Unit Tests**: 81% coverage
- **Integration Tests**: Preference flow
- **E2E Tests**: Complete journey
- **Recommendation Tests**: Match accuracy
- **Performance Tests**: Search speed

## 6. Known Issues
- Budget slider mobile touch sensitivity
- Location search autocomplete lag
- Preference saving race condition
- Recommendation cold start

## 7. Agent Responsibilities
- **Guest Agent**: Profile management
- **Recommendation Agent**: Property matching
- **Search Agent**: Query optimization
- **Alert Agent**: Notification handling
- **Preference Agent**: Settings management

## 8. Integration Points
- **Recommendation Engine**: ML matching
- **Search Service**: Query processing
- **Notification Service**: Alerts
- **Maps Service**: Location search
- **Analytics Service**: Behavior tracking
- **Email Service**: Welcome flow

## 9. Performance Metrics
- **Onboarding Load**: < 1.5 seconds
- **Preference Save**: < 300ms
- **Recommendation Generation**: < 2 seconds
- **Search Results**: < 1 second
- **Completion Rate**: > 70%
- **Time to First Booking**: < 24 hours

## 10. Accessibility
- **Screen Reader**: Full narration
- **Keyboard Navigation**: Tab support
- **Touch Targets**: Mobile-sized
- **Color Contrast**: WCAG AA
- **Form Validation**: Inline help
- **Language Support**: Multi-lingual