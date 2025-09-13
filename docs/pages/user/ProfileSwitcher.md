# Profile Switcher Documentation

## 1. Overview
- **Route**: `/profile-switcher`
- **Purpose**: Multi-account management for users with multiple profiles (personal, professional, teaching)
- **ESA Framework Layer**: Layer 2 - Account Management

## 2. Technical Implementation

### Components
- `client/src/pages/ProfileSwitcher.tsx` - Main switcher interface
- `AccountList` - List of available accounts
- `AccountCard` - Individual account display
- `QuickSwitch` - Fast account switching
- `AccountCreator` - New profile creation
- `AccountSettings` - Per-account configuration
- `SessionManager` - Active session tracking

### API Endpoints
- `GET /api/accounts` - List user accounts
- `POST /api/accounts/switch` - Switch active account
- `POST /api/accounts/create` - Create new profile
- `DELETE /api/accounts/:id` - Remove account
- `PUT /api/accounts/:id/settings` - Update account settings
- `GET /api/accounts/sessions` - Active sessions

### Real-time Features
- Session synchronization
- Cross-account notifications
- Activity status per account
- Real-time account switching

### Database Tables
- `user_accounts` - Multiple accounts
- `account_sessions` - Active sessions
- `account_settings` - Per-account config
- `account_activity` - Activity tracking
- `account_permissions` - Access control

## 3. User Permissions
- **Primary Account**: Full control
- **Secondary Account**: Limited by primary
- **Shared Account**: Collaborative access
- **Admin**: Override capabilities

## 4. MT Ocean Theme Implementation
```css
/* Account cards gradient */
.account-card {
  background: linear-gradient(135deg, #5EEAD4 0%, #14B8A6 100%);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 30px rgba(94, 234, 212, 0.2);
}

/* Active indicator */
.active-account::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #5EEAD4, #0F766E);
}

/* Switch animation */
@keyframes account-switch {
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
}
```

## 5. Test Coverage
- **Unit Tests**: 85% coverage
- **Integration Tests**: Account switching
- **E2E Tests**: Multi-account flow
- **Security Tests**: Session isolation
- **Performance Tests**: Quick switching

## 6. Known Issues
- Session timeout synchronization
- Notification routing delays
- Mobile account creation UI
- Cross-account data leakage prevention

## 7. Agent Responsibilities
- **Session Agent**: Multi-session management
- **Security Agent**: Account isolation
- **Sync Agent**: Data synchronization
- **Permission Agent**: Access control

## 8. Integration Points
- **Auth Service**: Multi-account auth
- **Session Service**: Session management
- **Notification Service**: Routing
- **Storage Service**: Account data
- **Security Service**: Isolation

## 9. Performance Metrics
- **Switch Time**: < 500ms
- **Account Load**: < 1 second
- **Session Sync**: Real-time
- **Memory Per Account**: < 50MB
- **Max Accounts**: 5 per user
- **Cache Strategy**: Per-account

## 10. Accessibility
- **Screen Reader**: Account descriptions
- **Keyboard Navigation**: Quick switching
- **Visual Indicators**: Active account
- **Confirmation Dialogs**: Destructive actions
- **Help Text**: Feature explanations
- **Mobile Gestures**: Swipe to switch