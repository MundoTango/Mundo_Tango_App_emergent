# User Settings Page Documentation

## 1. Overview
- **Route**: `/settings`
- **Purpose**: Comprehensive user settings management for notifications, privacy, appearance, and account preferences
- **ESA Framework Layer**: Layer 2 - System Configuration

## 2. Technical Implementation

### Components
- `client/src/pages/UserSettings.tsx` - Main settings page
- `NotificationSettings` - Email, push, SMS notification preferences
- `PrivacySettings` - Profile visibility and data sharing
- `AppearanceSettings` - Theme, language, display options
- `AccountSettings` - Security, password, 2FA configuration
- `DataManagement` - Export, import, deletion tools

### API Endpoints
- `GET /api/user/settings` - Fetch all user settings
- `PUT /api/user/settings/notifications` - Update notification preferences
- `PUT /api/user/settings/privacy` - Update privacy settings
- `PUT /api/user/settings/appearance` - Update appearance settings
- `PUT /api/user/settings/security` - Update security settings
- `POST /api/user/export-data` - Export user data
- `DELETE /api/user/account` - Delete account

### Real-time Features
- Instant setting synchronization across devices
- Live theme switching
- Real-time notification testing
- Session management across devices

### Database Tables
- `user_settings` - General user preferences
- `notification_settings` - Notification preferences
- `privacy_settings` - Privacy configurations
- `appearance_settings` - Theme and display preferences
- `security_settings` - Security configurations
- `user_sessions` - Active session management

## 3. User Permissions
- **User**: Full access to own settings
- **Admin**: View and modify any user's settings
- **Support**: View settings for troubleshooting
- **Guest**: No access

## 4. MT Ocean Theme Implementation
```css
/* Settings card gradient */
.settings-card {
  background: linear-gradient(135deg, #5EEAD4 0%, #0D9488 100%);
  border-radius: 12px;
  padding: 20px;
}

/* Toggle switches */
.ocean-toggle:checked {
  background: linear-gradient(to right, #14B8A6, #0F766E);
}

/* Section headers */
.settings-header {
  background: linear-gradient(90deg, #5EEAD4, #155E75);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

## 5. Test Coverage
- **Unit Tests**: 90% coverage
- **Integration Tests**: Settings persistence
- **E2E Tests**: Complete settings workflow
- **Security Tests**: Privacy setting enforcement
- **Performance Tests**: Settings load < 1s

## 6. Known Issues
- Theme switching lag on mobile devices
- Notification test sometimes fails on iOS
- Data export timeout for large accounts
- Language change requires page refresh

## 7. Agent Responsibilities
- **Settings Agent**: Configuration management
- **Security Agent**: Privacy and security enforcement
- **Notification Agent**: Alert delivery management
- **Data Agent**: Import/export operations

## 8. Integration Points
- **Authentication Service**: Session management
- **Notification Service**: Alert delivery
- **Analytics Service**: Privacy-compliant tracking
- **Storage Service**: Data export/import
- **Theme Service**: Appearance management

## 9. Performance Metrics
- **Page Load Time**: < 1 second
- **Setting Update**: < 100ms
- **Data Export**: < 30 seconds
- **Theme Switch**: < 50ms
- **Memory Usage**: < 50MB
- **Cache Strategy**: LocalStorage for preferences

## 10. Accessibility
- **Screen Reader**: Complete setting descriptions
- **Keyboard Navigation**: Full tab support
- **High Contrast**: Theme options available
- **Font Scaling**: Adjustable text sizes
- **Clear Labels**: Descriptive setting names
- **Help Text**: Context for each setting