# Guest Onboarding - Step 3: Languages & Interests

## Overview
**Route:** `/guest-onboarding` (Step 3)  
**Purpose:** Capture language preferences and personal interests for community matching  
**ESA Framework Layer:** Layer 8 - User Management & Layer 9 - Community Features  

## Technical Implementation

### Components Used
- `LanguagesInterestsStep` - Main step component
- `LanguageSelector` - Multi-select with proficiency levels
- `InterestTags` - Categorized interest selection
- `TangoLevelSelector` - Special tango skill assessment
- `ProgressBar` - Visual progress indicator (50% complete)

### API Endpoints
- `GET /api/guest-profile/languages` - Fetch saved languages
- `POST /api/guest-profile/languages` - Save language data
- `GET /api/interests/categories` - Get interest categories
- `POST /api/guest-profile/interests` - Save interests

### Real-time Features
- Interest suggestions based on selections
- Language proficiency visual indicators
- Popular interests highlighting
- Cross-reference with local events

### Database Tables
```sql
- guest_preferences (languages JSONB, interests JSONB)
- languages (ISO codes, native names)
- interest_categories (hierarchical structure)
- tango_levels (skill assessment data)
```

### User Permissions
- **Public Access:** Yes (guest flow)
- **Authentication:** Optional
- **Data Usage:** Matching and recommendations
- **Privacy:** Configurable visibility

## MT Ocean Theme Implementation
```css
- Language flags with ocean wave overlay
- Interest bubbles with teal gradient
- Tango section with special coral accent
- Animated selection with ripple effect
- Progress bar at 50% - ocean midpoint
```

## Test Coverage
**Status:** ✅ Complete  
**Test File:** `tests/e2e/guest/guest-onboarding.e2e.test.ts`  
**Required Tests:** Language selection, interest categories, tango level

## Known Issues
- Flag icons missing for some languages
- Interest search needs fuzzy matching
- Tango level descriptions need translation

## Agent Responsibilities
- **Cultural Agent:** Match language preferences
- **Interest Agent:** Suggest related activities
- **Tango Agent:** Connect with dance community

## Integration Points
- Event recommendation engine
- Community group suggestions
- Host language matching
- Local guide assignments
- Tango partner matching

## Performance Metrics
- Average completion: 55 seconds
- Drop-off rate: 10%
- Average interests selected: 5.2
- Bundle size: 48KB

## Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Languages | Multi-select + level | Yes | Min 1 language |
| Proficiency | Slider per language | Yes | 1-5 scale |
| Interests | Tag selection | Yes | Min 3, Max 15 |
| Tango Experience | Radio + details | No | Skill assessment |

## State Management
```typescript
interface LanguagesInterestsState {
  languages: {
    code: string;
    proficiency: 1 | 2 | 3 | 4 | 5;
  }[];
  interests: string[];
  tangoLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  tangoStyles?: string[];
  completedAt?: Date;
}
```

## Cultural Considerations
- RTL language support
- Native language names display
- Cultural interest categories
- Regional tango style preferences

## Interest Categories
- **Arts & Culture:** Museums, Theater, Music
- **Tango:** Dancing, Milongas, Shows
- **Food & Wine:** Restaurants, Wine Tasting, Cooking
- **Outdoor:** Parks, Sports, Walking Tours
- **Social:** Meetups, Language Exchange, Nightlife