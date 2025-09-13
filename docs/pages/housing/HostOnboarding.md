# Host Onboarding Documentation

## 1. Overview
- **Route**: `/host-onboarding`
- **Purpose**: Step-by-step wizard for hosts to list their properties on the platform
- **ESA Framework Layer**: Layer 2 - User Onboarding

## 2. Technical Implementation

### Components
- `client/src/pages/HostOnboarding.tsx` - Main onboarding flow
- `PropertyTypeStep` - Property type selection
- `PropertyDetailsStep` - Rooms, beds, amenities
- `LocationStep` - Address and map positioning
- `AmenitiesStep` - Feature selection
- `PhotosStep` - Image upload interface
- `PricingStep` - Rate configuration
- `AvailabilityStep` - Calendar setup
- `ReviewStep` - Final review and submission

### API Endpoints
- `POST /api/host/onboarding/start` - Initialize process
- `PUT /api/host/onboarding/property` - Save property data
- `POST /api/host/onboarding/photos` - Upload images
- `PUT /api/host/onboarding/pricing` - Set pricing
- `PUT /api/host/onboarding/availability` - Configure calendar
- `POST /api/host/onboarding/complete` - Publish listing
- `GET /api/host/onboarding/progress` - Resume session

### Real-time Features
- Auto-save progress
- Live address validation
- Real-time photo optimization
- Dynamic pricing suggestions
- Instant preview updates

### Database Tables
- `host_onboarding_sessions` - Progress tracking
- `draft_listings` - Temporary data
- `host_profiles` - Host information
- `property_drafts` - Property details
- `uploaded_media` - Temporary photos
- `pricing_rules` - Rate configuration

## 3. User Permissions
- **New Host**: Full onboarding access
- **Existing Host**: Quick listing mode
- **Admin**: Review and approval
- **Support**: Assistance access

## 4. MT Ocean Theme Implementation
```css
/* Progress indicator */
.onboarding-progress {
  background: linear-gradient(90deg, #5EEAD4 0%, #14B8A6 var(--progress));
  height: 6px;
  border-radius: 3px;
  transition: all 0.5s ease;
}

/* Step cards */
.step-card {
  background: white;
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #5EEAD4, #0D9488) 1;
  padding: 30px;
  border-radius: 12px;
}

/* Active step indicator */
.step-indicator.active {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
  transform: scale(1.1);
}

/* Photo upload zone */
.upload-zone {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.05), rgba(21, 94, 117, 0.05));
  border: 2px dashed #5EEAD4;
  border-radius: 12px;
  padding: 40px;
}

/* Success animation */
@keyframes success-wave {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
```

## 5. Test Coverage
- **Unit Tests**: 83% coverage
- **Integration Tests**: Multi-step flow
- **E2E Tests**: Complete onboarding
- **Upload Tests**: Photo handling
- **Validation Tests**: Form validation

## 6. Known Issues
- Photo upload progress on slow connections
- Map pin placement accuracy
- Calendar widget mobile display
- Auto-save conflict resolution

## 7. Agent Responsibilities
- **Onboarding Agent**: Flow management
- **Validation Agent**: Data verification
- **Photo Agent**: Image processing
- **Pricing Agent**: Rate optimization
- **Geocoding Agent**: Address validation

## 8. Integration Points
- **Google Maps**: Location services
- **Image Service**: Photo optimization
- **Calendar Service**: Availability setup
- **Pricing Engine**: Rate suggestions
- **Email Service**: Welcome messages
- **Analytics Service**: Conversion tracking

## 9. Performance Metrics
- **Step Load**: < 1 second
- **Photo Upload**: < 5 seconds per image
- **Address Lookup**: < 500ms
- **Save Progress**: < 300ms
- **Completion Rate**: > 60%
- **Average Time**: 10-15 minutes

## 10. Accessibility
- **Screen Reader**: Step announcements
- **Keyboard Navigation**: Full support
- **Error Messages**: Clear guidance
- **Help Tooltips**: Context assistance
- **Skip Options**: Advanced users
- **Mobile Optimized**: Touch interface