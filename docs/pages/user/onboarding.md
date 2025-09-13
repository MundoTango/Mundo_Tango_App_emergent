# Onboarding Page Documentation

## 1. Overview
- **Route**: `/onboarding`
- **Purpose**: New user onboarding flow with profile setup, role selection, and platform introduction
- **ESA Framework Layer**: Layer 1 - User Acquisition

## 2. Technical Implementation

### Components
- `client/src/pages/onboarding.tsx` - Main onboarding flow
- `LocationPicker` - City/location selection
- `GoogleMapsLocationPicker` - Map-based location picker
- `GroupedRoleSelector` - Tango role selection
- `SimpleRoleSelector` - Basic role picker
- `LanguageSelector` - Preferred language setup
- `InterestSelector` - Dance style preferences

### API Endpoints
- `POST /api/onboarding/start` - Initialize onboarding
- `PUT /api/onboarding/profile` - Update profile data
- `PUT /api/onboarding/location` - Set user location
- `PUT /api/onboarding/roles` - Select tango roles
- `PUT /api/onboarding/preferences` - Set preferences
- `POST /api/onboarding/complete` - Finish onboarding
- `GET /api/cities/suggestions` - City autocomplete

### Real-time Features
- Location-based community suggestions
- Dynamic role recommendations
- Live validation feedback
- Progress tracking

### Database Tables
- `onboarding_progress` - Track completion steps
- `user_profiles` - Store profile data
- `user_locations` - Location information
- `user_roles` - Selected tango roles
- `user_preferences` - Platform preferences
- `onboarding_analytics` - Conversion tracking

## 3. User Permissions
- **New User**: Full access to onboarding
- **Existing User**: Redirect to profile
- **Admin**: View onboarding analytics
- **Guest**: Limited preview mode

## 4. MT Ocean Theme Implementation
```css
/* Progress indicator */
.onboarding-progress {
  background: linear-gradient(90deg, #5EEAD4 0%, #0D9488 var(--progress));
  height: 4px;
  transition: all 0.5s ease;
}

/* Step cards */
.onboarding-step {
  background: rgba(94, 234, 212, 0.05);
  border: 2px solid transparent;
  background-clip: padding-box;
  border-image: linear-gradient(135deg, #5EEAD4, #155E75) 1;
}

/* Welcome animation */
@keyframes ocean-wave {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
```

## 5. Test Coverage
- **Unit Tests**: 88% coverage
- **Integration Tests**: Multi-step flow
- **E2E Tests**: Complete onboarding journey
- **A/B Tests**: Conversion optimization
- **Accessibility Tests**: Screen reader flow

## 6. Known Issues
- Google Maps occasional timeout
- Role selector mobile scrolling
- Birthday picker iOS issues
- Language detection inconsistency

## 7. Agent Responsibilities
- **Onboarding Agent**: Flow orchestration
- **Profile Agent**: Data validation
- **Location Agent**: Geocoding services
- **Analytics Agent**: Conversion tracking
- **Email Agent**: Welcome email delivery

## 8. Integration Points
- **Google Maps API**: Location services
- **Analytics Service**: Funnel tracking
- **Email Service**: Welcome sequences
- **Community Service**: Group suggestions
- **AI Service**: Personalized recommendations

## 9. Performance Metrics
- **Page Load Time**: < 1.5 seconds
- **Step Transition**: < 200ms
- **Location Search**: < 500ms
- **Completion Rate**: > 70%
- **Drop-off Points**: Monitored per step
- **Average Time**: 3-5 minutes

## 10. Accessibility
- **Screen Reader**: Step announcements
- **Keyboard Navigation**: Tab through fields
- **Error Messages**: Clear and actionable
- **Visual Indicators**: Progress feedback
- **Skip Options**: Advanced users
- **Multi-language**: 5 languages supported