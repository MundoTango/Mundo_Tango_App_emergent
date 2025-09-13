# Create Community Documentation

## 1. Overview
- **Route**: `/create-community`
- **Purpose**: Community creation wizard for establishing new tango communities
- **ESA Framework Layer**: Layer 2 - Community Creation

## 2. Technical Implementation

### Components
- `client/src/pages/CreateCommunity.tsx` - Creation wizard
- `CommunityTypeSelector` - Type selection
- `CommunityDetailsForm` - Basic information
- `LocationSelector` - Geographic setup
- `MembershipRules` - Access configuration
- `CommunityGuidelines` - Rules setup
- `ThemeCustomizer` - Visual customization
- `ReviewAndPublish` - Final review

### API Endpoints
- `POST /api/communities/create` - Create community
- `POST /api/communities/validate` - Validate data
- `POST /api/communities/upload-image` - Logo upload
- `GET /api/communities/templates` - Templates
- `POST /api/communities/draft` - Save draft
- `GET /api/communities/check-name` - Name availability
- `POST /api/communities/publish` - Go live

### Real-time Features
- Name availability checking
- Live preview updates
- Real-time validation
- Instant publish status
- Auto-save drafts

### Database Tables
- `community_drafts` - Creation drafts
- `community_templates` - Starter templates
- `community_validation` - Validation rules
- `community_metadata` - Additional data
- `community_settings` - Configuration
- `community_themes` - Visual themes

## 3. User Permissions
- **User**: Create communities
- **Premium**: Advanced features
- **Verified**: Skip moderation
- **Admin**: Template management
- **Banned**: No creation rights

## 4. MT Ocean Theme Implementation
```css
/* Creation wizard gradient */
.creation-wizard {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 30%, #0D9488 60%, #155E75 100%);
  min-height: 100vh;
  padding: 40px;
}

/* Step indicator */
.step-indicator {
  background: white;
  border: 3px solid transparent;
  border-image: linear-gradient(90deg, #5EEAD4, #0D9488) 1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.step-indicator.active {
  background: linear-gradient(45deg, #14B8A6, #0F766E);
  color: white;
}

/* Form sections */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(94, 234, 212, 0.1);
}

/* Preview panel */
.preview-panel {
  background: linear-gradient(to bottom, rgba(94, 234, 212, 0.05), white);
  border: 2px solid #5EEAD4;
  border-radius: 12px;
  padding: 20px;
}

/* Theme color picker */
.theme-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.theme-option {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option.selected {
  border-color: #5EEAD4;
  transform: scale(1.1);
}

/* Publish button */
.publish-button {
  background: linear-gradient(90deg, #5EEAD4, #0D9488);
  color: white;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(94, 234, 212, 0.3);
}
```

## 5. Test Coverage
- **Unit Tests**: 82% coverage
- **Integration Tests**: Creation flow
- **E2E Tests**: Full wizard
- **Validation Tests**: Form validation
- **Upload Tests**: Image handling

## 6. Known Issues
- Image upload progress indicator
- Draft auto-save conflicts
- Theme preview rendering
- Mobile form layout

## 7. Agent Responsibilities
- **Creation Agent**: Wizard management
- **Validation Agent**: Data verification
- **Upload Agent**: Media handling
- **Template Agent**: Template system
- **Preview Agent**: Live preview

## 8. Integration Points
- **Image Service**: Logo upload
- **Validation Service**: Data checks
- **Template Service**: Starter templates
- **Analytics Service**: Creation tracking
- **Moderation Service**: Content review
- **Email Service**: Confirmation

## 9. Performance Metrics
- **Page Load**: < 1.5 seconds
- **Step Navigation**: < 300ms
- **Image Upload**: < 5 seconds
- **Validation**: < 500ms
- **Preview Update**: < 200ms
- **Publish Action**: < 2 seconds

## 10. Accessibility
- **Screen Reader**: Step announcements
- **Keyboard Navigation**: Tab support
- **Error Messages**: Clear guidance
- **Form Labels**: Descriptive text
- **Help Tooltips**: Context help
- **Mobile Responsive**: Touch-optimized