# Guest Onboarding - Step 2: Dietary Preferences

## Overview
**Route:** `/guest-onboarding` (Step 2)  
**Purpose:** Capture dietary restrictions and food preferences for host matching  
**ESA Framework Layer:** Layer 8 - User Management & Layer 15 - Health/Safety  

## Technical Implementation

### Components Used
- `DietaryStep` - Main step component
- `DietaryRestrictionSelector` - Common dietary restrictions
- `AllergySelector` - Allergy selection with severity
- `SpecialNeedsTextArea` - Additional requirements input
- `ProgressBar` - Visual progress indicator (33% complete)

### API Endpoints
- `GET /api/guest-profile/dietary` - Fetch saved preferences
- `POST /api/guest-profile/dietary` - Save dietary data
- `GET /api/dietary/restrictions` - List common restrictions
- `GET /api/dietary/allergies` - Get allergy options

### Real-time Features
- Auto-complete for dietary restrictions
- Severity level indicators for allergies
- Character count for special needs
- Session persistence across navigation

### Database Tables
```sql
- guest_preferences (dietary_data JSONB)
- dietary_restrictions (reference data)
- common_allergies (reference data)
- accessibility_needs (linked requirements)
```

### User Permissions
- **Public Access:** Yes (guest flow)
- **Authentication:** Optional
- **Data Sensitivity:** Medium (health information)
- **Encryption:** AES-256 for health data

## MT Ocean Theme Implementation
```css
- Health-focused teal accents: #14B8A6
- Soft coral warnings for allergies: #FB7185
- Glassmorphic selection cards
- Smooth transitions on selection
- Ocean-inspired progress animation
```

## Test Coverage
**Status:** ✅ Complete  
**Test File:** `tests/e2e/guest/guest-onboarding.e2e.test.ts`  
**Required Tests:** Restriction selection, allergy input, special needs validation

## Known Issues
- Translation needed for dietary terms
- Accessibility needs textarea needs better prompts
- Mobile keyboard covers input on some devices

## Agent Responsibilities
- **Health Agent:** Validate dietary combinations
- **Matching Agent:** Filter hosts by dietary capabilities
- **Safety Agent:** Flag critical allergies

## Integration Points
- Host kitchen capabilities matching
- Restaurant recommendation filtering
- Event catering preferences
- Emergency medical information

## Performance Metrics
- Average completion: 35 seconds
- Drop-off rate: 8%
- Text input usage: 45% of users
- Bundle size: 38KB

## Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Dietary Restrictions | Multi-select | No | Common options |
| Allergies | Multi-select + severity | No | Medical validation |
| Special Needs | Textarea | No | Max 500 chars |
| Kosher/Halal | Radio | No | Certification level |

## State Management
```typescript
interface DietaryState {
  restrictions: string[];
  allergies: {
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
  specialNeeds?: string;
  certificationRequired?: string;
  completedAt?: Date;
}
```

## Accessibility Features
- High contrast mode for allergy warnings
- Screen reader descriptions for severity levels
- Keyboard navigation for all selections
- ARIA labels for dietary icons