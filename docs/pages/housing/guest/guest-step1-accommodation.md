# Guest Onboarding - Step 1: Accommodation Preferences

## Overview
**Route:** `/guest-onboarding` (Step 1)  
**Purpose:** Capture guest accommodation preferences for housing matching  
**ESA Framework Layer:** Layer 8 - User Management & Layer 12 - Housing Marketplace  

## Technical Implementation

### Components Used
- `AccommodationStep` - Main step component
- `PropertyTypeSelector` - Multi-select for property types
- `RoomTypeSelector` - Room preference selection
- `AmenityCheckList` - Required amenities selection
- `ProgressBar` - Visual progress indicator (17% complete)

### API Endpoints
- `GET /api/guest-profile/accommodation` - Fetch saved preferences
- `POST /api/guest-profile/accommodation` - Save accommodation data
- `GET /api/housing/amenities` - List available amenities
- `GET /api/housing/property-types` - Get property type options

### Real-time Features
- Auto-save on field changes (debounced 1s)
- Dynamic amenity availability based on property type
- Real-time validation feedback
- Progress tracking across browser sessions

### Database Tables
```sql
- guest_preferences (accommodation_data JSONB)
- property_types (reference data)
- amenities (reference data)
- user_sessions (progress tracking)
```

### User Permissions
- **Public Access:** Yes (guest flow)
- **Authentication:** Optional (saves to session)
- **Data Persistence:** SessionStorage + DB if authenticated

## MT Ocean Theme Implementation
```css
- Ocean gradient checkboxes: #5EEAD4 → #155E75
- Glassmorphic property cards
- Wave animation on selection
- Turquoise accent for selected items
- Progress bar with ocean gradient
```

## Test Coverage
**Status:** ✅ Complete  
**Test File:** `tests/e2e/guest/guest-onboarding.e2e.test.ts`  
**Required Tests:** Property selection, room types, amenity selection, validation

## Known Issues
- Mobile scrolling on long amenity lists
- Property type images need optimization
- Accessibility: Missing keyboard shortcuts for checkboxes

## Agent Responsibilities
- **Housing Agent:** Match properties based on preferences
- **Recommendation Agent:** Suggest popular amenities
- **Validation Agent:** Ensure complete selection

## Integration Points
- Housing marketplace filtering
- Host matching algorithm
- Recommendation engine input
- Analytics tracking for preference trends

## Performance Metrics
- Average completion: 45 seconds
- Drop-off rate: 5% (lowest of all steps)
- Selection changes: Average 2.3 per user
- Bundle size: 42KB

## Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Property Types | Multi-select | Yes | Min 1 selection |
| Room Types | Multi-select | Yes | Min 1 selection |
| Amenities | Checkbox list | No | Max 10 selections |
| Special Requirements | Text | No | Max 500 chars |

## State Management
```typescript
interface AccommodationState {
  propertyTypes: string[];
  roomTypes: string[];
  amenities: string[];
  specialRequirements?: string;
  completedAt?: Date;
}
```