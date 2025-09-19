# Privacy & Analytics Page Documentation

## Overview
**Route:** `/privacy-analytics`  
**Purpose:** GDPR-compliant privacy management center for users to control data collection preferences  
**Framework Layer:** ESA Life CEO 61x21 - Privacy Agent  

## Page Description
The Privacy & Analytics page provides a comprehensive interface for users to manage their privacy settings and understand how their data is collected and used. This page ensures full GDPR compliance and transparent communication about data practices.

## Features

### 1. Consent Management Dashboard
- **Current Status Display**: Shows active/inactive status for each monitoring service
- **Toggle Controls**: Individual switches for each service (Analytics, Session Recording, Error Tracking)  
- **Last Updated**: Timestamp showing when preferences were last modified
- **Quick Actions**: Enable All / Disable All buttons for convenience

### 2. Service Information

#### PostHog Analytics
- **Purpose**: Product analytics and feature usage tracking
- **Data Collected**:
  - Page views and navigation paths
  - Feature usage and interactions
  - Device and browser information
  - Geographic location (country/city level)
  - User preferences and settings
- **Retention Period**: 90 days
- **Storage Location**: EU servers (GDPR-compliant)

#### OpenReplay Session Recording
- **Purpose**: Visual session replay for UX improvement
- **Data Collected**:
  - Mouse movements and clicks
  - Scroll patterns
  - Form interactions (sensitive data masked)
  - Page navigation
  - Console errors
- **Retention Period**: 30 days
- **Storage Location**: Self-hosted infrastructure

#### Sentry Error Tracking
- **Purpose**: Automatic error detection and reporting
- **Data Collected**:
  - JavaScript errors and stack traces
  - Network errors
  - Browser and OS information
  - Error context and breadcrumbs
  - User ID (if logged in)
- **Retention Period**: 30 days
- **Storage Location**: EU servers (GDPR-compliant)

### 3. Privacy Rights (GDPR)
- **Right to Access**: Request a copy of all personal data
- **Right to Rectification**: Correct inaccurate or incomplete data
- **Right to Erasure**: Delete all personal data ("right to be forgotten")
- **Right to Data Portability**: Export data in machine-readable format
- **Right to Restrict Processing**: Limit how data is processed
- **Right to Object**: Opt-out of data processing

### 4. Data Management Actions
- **Export Data**: Download all collected data in JSON format
- **Delete Data**: Request complete data deletion (processed within 30 days)
- **Test Connections**: Verify each monitoring service is working correctly

## Technical Implementation

### Components Used
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` - Content structure
- `Switch` - Toggle controls for each service
- `Button` - Action buttons
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` - Tab navigation
- `Alert`, `AlertDescription`, `AlertTitle` - Status notifications
- `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` - Collapsible sections
- `Badge` - Status indicators
- `useToast` - User feedback notifications

### State Management
```typescript
interface ConsentState {
  analytics: boolean;
  sessionRecording: boolean;
  errorTracking: boolean;
  timestamp: Date | null;
}
```

### localStorage Keys
- `mt_monitoring_consent` - Stores user consent preferences

### API Integration
- Integrates with `MonitoringService` from `/services/monitoring`
- Communicates with `ConsentManager` for preference persistence
- Real-time updates to monitoring services when preferences change

## User Interactions

### Toggle Service
1. User clicks switch for specific service
2. System updates localStorage consent state
3. If enabling: Service initializes immediately
4. If disabling: Service stops collecting data
5. Toast notification confirms change

### Test Connection
1. User clicks "Test Connection" for a service
2. System sends test event to the service
3. Loading indicator shows during test
4. Success/failure notification displayed

### Export Data
1. User clicks "Export My Data"
2. System initiates data export request
3. User receives email with download link within 24 hours

### Delete Data
1. User clicks "Delete My Data"
2. Confirmation dialog appears
3. Deletion request submitted
4. Processing completes within 30 days (GDPR requirement)

## Security Measures
- **End-to-End Encryption**: All data encrypted in transit and at rest
- **EU Data Centers**: Data stored in GDPR-compliant facilities
- **Automatic PII Masking**: Sensitive information automatically redacted
- **No Third-Party Selling**: Data never sold to advertisers
- **Secure Authentication**: Access requires user authentication
- **Audit Logging**: All preference changes logged

## Mobile Responsiveness
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch-Optimized**: Large touch targets for mobile users
- **Responsive Layout**: Single column on mobile, multi-column on desktop

## Accessibility
- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Descriptive text for all features
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Focus Indicators**: Clear visual focus states

## Performance
- **Initial Load**: < 2 seconds
- **Lazy Loading**: Tab content loaded on demand
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Caching**: Consent state cached in localStorage

## Testing

### Test IDs
- `consent-modal` - Main consent modal
- `switch-product-analytics` - Analytics toggle
- `switch-session-recording` - Session recording toggle
- `switch-error-tracking` - Error tracking toggle
- `button-accept-all` - Accept all button
- `button-reject-all` - Reject all button
- `button-export-data` - Export data button
- `button-delete-data` - Delete data button
- `test-product-analytics` - Test analytics connection
- `test-session-recording` - Test session recording
- `test-error-tracking` - Test error tracking

### Test Scenarios
1. **Consent Toggle**: Verify toggles update localStorage
2. **Service Initialization**: Confirm services start/stop correctly
3. **Persistence**: Check settings persist across sessions
4. **Connection Testing**: Validate test events reach services
5. **Mobile Layout**: Ensure responsive design works

## Known Issues
- None currently identified

## Future Enhancements
- [ ] Granular consent options (e.g., analytics without location)
- [ ] Consent history timeline
- [ ] Data retention customization
- [ ] Export scheduling
- [ ] Cookie consent integration
- [ ] Multi-language support

## Related Documentation
- [Monitoring Service Documentation](/docs/monitoring/overview.md)
- [GDPR Compliance Guide](/docs/legal/gdpr.md)
- [User Settings Page](/docs/pages/user/UserSettings.md)
- [Security Best Practices](/docs/security/best-practices.md)

## Support
For privacy-related inquiries:
- **Email**: privacy@mundotango.app
- **Response Time**: Within 30 days (GDPR requirement)
- **Data Protection Officer**: Available for escalations

## Compliance
- **GDPR**: Fully compliant with EU General Data Protection Regulation
- **CCPA**: California Consumer Privacy Act compliant
- **LGPD**: Brazilian General Data Protection Law compliant
- **ISO 27001**: Information security management certified