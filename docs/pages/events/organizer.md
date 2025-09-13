# Organizer Page Documentation

## 1. Overview
- **Route**: `/organizer`
- **Purpose**: Event organizer dashboard for managing multiple events, venues, and partnerships
- **ESA Framework Layer**: Layer 3 - Event Management

## 2. Technical Implementation

### Components
- `client/src/pages/organizer.tsx` - Organizer dashboard
- `EventManager` - Multi-event management
- `VenueManager` - Venue relationships
- `PartnershipHub` - Sponsor management
- `AnalyticsDashboard` - Event analytics
- `MarketingTools` - Promotion features
- `FinancialReports` - Revenue tracking
- `TeamManagement` - Staff coordination

### API Endpoints
- `GET /api/organizer/dashboard` - Overview stats
- `GET /api/organizer/events` - All organized events
- `GET /api/organizer/venues` - Venue partnerships
- `GET /api/organizer/analytics` - Performance data
- `POST /api/organizer/campaign` - Marketing campaign
- `GET /api/organizer/revenue` - Financial reports
- `POST /api/organizer/team` - Add team member

### Real-time Features
- Live ticket sales tracking
- Real-time event analytics
- Instant team notifications
- Live attendee check-in
- Dynamic pricing updates

### Database Tables
- `organizer_profiles` - Organizer data
- `organizer_events` - Event ownership
- `venue_partnerships` - Venue relationships
- `sponsorships` - Sponsor deals
- `marketing_campaigns` - Promotions
- `financial_records` - Revenue data
- `team_members` - Staff access

## 3. User Permissions
- **Organizer**: Full control
- **Co-organizer**: Shared management
- **Team Member**: Limited access
- **Venue Partner**: Venue-specific data
- **Sponsor**: Analytics access

## 4. MT Ocean Theme Implementation
```css
/* Organizer dashboard gradient */
.organizer-dashboard {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #0F766E 75%, #155E75 100%);
  min-height: 100vh;
}

/* Analytics cards */
.analytics-card {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(94, 234, 212, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

/* Revenue chart gradient */
.revenue-chart {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.1), rgba(21, 94, 117, 0.1));
  padding: 20px;
  border-radius: 8px;
}

/* Event status badges */
.status-active {
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
}

.status-upcoming {
  background: linear-gradient(45deg, #14B8A6, #0D9488);
}

.status-completed {
  background: linear-gradient(45deg, #0F766E, #155E75);
}
```

## 5. Test Coverage
- **Unit Tests**: 82% coverage
- **Integration Tests**: Multi-event workflows
- **E2E Tests**: Organizer journey
- **Financial Tests**: Revenue calculations
- **Analytics Tests**: Data accuracy

## 6. Known Issues
- Analytics export large datasets
- Team permission inheritance
- Venue calendar conflicts
- Marketing email delivery rates

## 7. Agent Responsibilities
- **Organizer Agent**: Event coordination
- **Analytics Agent**: Data processing
- **Marketing Agent**: Campaign management
- **Financial Agent**: Revenue tracking
- **Team Agent**: Permission management

## 8. Integration Points
- **Analytics Platform**: Advanced metrics
- **Email Marketing**: Campaign tools
- **Accounting Service**: Financial sync
- **CRM System**: Contact management
- **Social Media APIs**: Cross-posting
- **Payment Processors**: Multi-gateway

## 9. Performance Metrics
- **Dashboard Load**: < 2.5 seconds
- **Analytics Refresh**: < 3 seconds
- **Export Generation**: < 10 seconds
- **Campaign Launch**: < 5 seconds
- **Team Sync**: Real-time
- **Memory Usage**: < 150MB

## 10. Accessibility
- **Screen Reader**: Complex tables
- **Keyboard Navigation**: Dashboard control
- **Chart Alternatives**: Data tables
- **Color Blind Mode**: Alternative palettes
- **Focus Indicators**: Clear navigation
- **Responsive Tables**: Mobile-friendly