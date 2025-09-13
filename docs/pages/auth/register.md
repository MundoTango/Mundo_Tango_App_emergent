# Registration Page

## Overview
**Route:** `/auth/register`  
**Purpose:** New user onboarding and account creation  
**ESA Framework Layer:** Layer 7 - Authentication & Layer 8 - User Management  

## Technical Implementation

### Components Used
- `RegistrationWizard` - Multi-step registration flow
- `AvatarUpload` - Profile picture component
- `PasswordStrengthMeter` - Password validation
- `TermsCheckbox` - Legal agreement

### API Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/verify-email` - Email verification
- `POST /api/users/check-availability` - Username/email check

### Real-time Features
- Username availability check (debounced)
- Email validation in real-time
- Password strength updates

### Database Tables
```sql
- users (new user record)
- user_profiles (extended profile data)
- verification_tokens (email verification)
- user_preferences (default settings)
```

### User Permissions
- **Public Access:** Yes
- **Rate Limited:** 3 registrations per IP/hour
- **Email Verification:** Required

## MT Ocean Theme Implementation
```css
- Gradient progress bar: #5EEAD4 → #155E75
- Glassmorphic wizard steps
- Turquoise success states
- Animated step transitions
```

## Test Coverage
**Status:** ⚠️ Partial  
**Test File:** Needs comprehensive test  
**Required Tests:** Multi-step flow, validation, error states

## Known Issues
- Email service needs configuration for verification
- Avatar upload requires Cloudinary setup

## Agent Responsibilities
- **Onboarding Agent:** Guide through registration
- **Validation Agent:** Check data integrity
- **Welcome Agent:** Send welcome communications

## Integration Points
- Social registration via OAuth
- CRM integration for new users
- Analytics tracking for conversion

## Performance Metrics
- Average completion: 2.5 minutes
- Drop-off rate: 15% at email verification
- Bundle size: 67KB