# GroupSearch Component

## Overview

`GroupSearch` is a comprehensive search component for filtering and discovering community groups. It provides full-text search, advanced filtering options, autocomplete suggestions, and real-time search results with debouncing for optimal performance.

## Location

**File:** `client/src/components/groups/GroupSearch.tsx`

## Features

### Core Functionality
- **Full-text search** across group names and descriptions
- **Real-time autocomplete** suggestions with group previews
- **Advanced filtering** with collapsible UI
- **Debounced search** (300ms) to reduce API calls
- **Active filter management** with visual badges
- **Responsive design** with mobile-first approach

### Search Filters
- **Query**: Free-text search across group names and descriptions
- **City**: Filter groups by location (partial matching)
- **Role Type**: Filter by tango role (dancer, teacher, organizer, musician, DJ)
- **Member Range**: Min/max member count filters
- **Visibility**: Public, private, or all groups

### User Experience
- Clear visual indicators for active filters
- One-click filter removal via badge X icons
- "Clear All" button to reset all filters
- Filter count badge on toggle button
- Loading state during search operations
- Empty state handling

## Props

```typescript
interface GroupSearchProps {
  onSearchResults: (results: any[]) => void;  // Callback with search results
  onClearFilters: () => void;                 // Callback when filters cleared
}
```

## Usage

```typescript
import GroupSearch from '@/components/groups/GroupSearch';

function GroupsPage() {
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  return (
    <GroupSearch
      onSearchResults={(results) => setFilteredGroups(results)}
      onClearFilters={() => setFilteredGroups(allGroups)}
    />
  );
}
```

## API Integration

### Endpoint
`GET /api/groups/search`

### Query Parameters
- `q` - Search query string
- `city` - City filter
- `roleType` - Role type filter (dancer/teacher/organizer/musician/dj)
- `minMembers` - Minimum member count
- `maxMembers` - Maximum member count
- `visibility` - Visibility filter (public/private/all)

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Buenos Aires Tango",
      "slug": "buenos-aires-tango",
      "city": "Buenos Aires",
      "country": "Argentina",
      "memberCount": 342,
      "roleType": "dancer",
      "visibility": "public"
    }
  ]
}
```

## State Management

```typescript
interface SearchFilters {
  query: string;
  city: string;
  roleType: string;
  minMembers: number;
  maxMembers: number;
  visibility: string;
}

const [filters, setFilters] = useState<SearchFilters>({
  query: '',
  city: '',
  roleType: '',
  minMembers: 0,
  maxMembers: 10000,
  visibility: 'all'
});
```

## Performance Optimizations

### Debouncing
```typescript
const debouncedSearch = useCallback(
  debounce((searchFilters: SearchFilters) => performSearch(searchFilters), 300),
  [performSearch]
);
```

### Conditional API Calls
- Only triggers search when filters change
- Skips search if all filters are at default values
- Cancels previous search if new one initiated

### Efficient Rendering
- Advanced filters hidden by default (reduces initial render)
- Suggestions only rendered when query exists
- Loading state prevents duplicate renders

## Accessibility

### WCAG AA Compliance
- **Semantic HTML**: Proper form structure with labels
- **ARIA labels**: All interactive elements labeled
- **Keyboard navigation**: Full keyboard operability
- **Screen reader support**: Status announcements via `aria-live`
- **Focus management**: Visible focus indicators

### Test IDs for Automation
```typescript
// Main container
data-testid="group-search-card"

// Search input
data-testid="input-search-query"

// Filter controls
data-testid="button-toggle-filters"
data-testid="button-clear-filters"

// Advanced filter inputs
data-testid="input-filter-city"
data-testid="select-role-type"
data-testid="select-visibility"
data-testid="input-min-members"
data-testid="input-max-members"

// Dynamic elements
data-testid="search-suggestions"
data-testid="suggestion-{groupId}"
data-testid="advanced-filters"
data-testid="active-filters"
```

## Autocomplete Suggestions

### Features
- Displays top 10 matching groups
- Shows group name, location, and member count
- Click to auto-fill search query
- Automatic positioning below search input
- Closes on blur or selection

### Implementation
```typescript
{showSuggestions && suggestions.length > 0 && (
  <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
    {suggestions.map((group) => (
      <button
        key={group.id}
        className="w-full px-4 py-3 hover:bg-gray-50 text-left"
        onClick={() => {
          updateFilter('query', group.name);
          setShowSuggestions(false);
        }}
      >
        <div className="font-medium">{group.name}</div>
        <div className="text-sm text-gray-500">
          {group.city}, {group.country}
        </div>
        <Badge>{group.memberCount} members</Badge>
      </button>
    ))}
  </div>
)}
```

## Filter Management

### Active Filter Badges
```typescript
{filters.query && (
  <Badge variant="secondary" className="gap-1">
    Query: {filters.query}
    <X 
      className="h-3 w-3 cursor-pointer" 
      onClick={() => updateFilter('query', '')} 
    />
  </Badge>
)}
```

### Clear All Filters
```typescript
const clearAllFilters = () => {
  setFilters({
    query: '',
    city: '',
    roleType: '',
    minMembers: 0,
    maxMembers: 10000,
    visibility: 'all'
  });
  setSuggestions([]);
  setShowSuggestions(false);
  onClearFilters();
};
```

## Styling

### Theme
- Uses MT Ocean design system with turquoise-to-blue gradient
- Consistent with platform design tokens
- Dark mode support

### Responsive Breakpoints
- **Mobile (<640px)**: Single column, stacked filters
- **Tablet (640-1024px)**: Two-column filter grid
- **Desktop (>1024px)**: Three-column filter grid

## Integration with ESA Framework

### Layer 5 (Authorization)
- Respects group visibility permissions
- Filters private groups for non-members

### Layer 17 (Search)
- Implements advanced search patterns
- Faceted filtering architecture

### Layer 54 (Accessibility)
- Full WCAG AA compliance
- Keyboard and screen reader support

## Testing

### Unit Tests
```typescript
describe('GroupSearch', () => {
  it('should render search input', () => {
    render(<GroupSearch onSearchResults={vi.fn()} onClearFilters={vi.fn()} />);
    expect(screen.getByTestId('input-search-query')).toBeInTheDocument();
  });

  it('should show advanced filters when toggle clicked', async () => {
    render(<GroupSearch onSearchResults={vi.fn()} onClearFilters={vi.fn()} />);
    await userEvent.click(screen.getByTestId('button-toggle-filters'));
    expect(screen.getByTestId('advanced-filters')).toBeVisible();
  });

  it('should debounce search', async () => {
    const onSearchResults = vi.fn();
    render(<GroupSearch onSearchResults={onSearchResults} onClearFilters={vi.fn()} />);
    
    const input = screen.getByTestId('input-search-query');
    await userEvent.type(input, 'Buenos Aires');
    
    // Should not call immediately
    expect(onSearchResults).not.toHaveBeenCalled();
    
    // Should call after debounce delay
    await waitFor(() => {
      expect(onSearchResults).toHaveBeenCalled();
    }, { timeout: 500 });
  });
});
```

### E2E Tests
```typescript
test('should filter groups by search query', async ({ page }) => {
  await page.goto('/groups');
  
  await page.fill('[data-testid="input-search-query"]', 'Buenos Aires');
  await page.waitForSelector('[data-testid="group-card"]');
  
  const groups = await page.locator('[data-testid="group-card"]').all();
  expect(groups.length).toBeGreaterThan(0);
});
```

## Common Issues & Solutions

### Issue: Search not triggering
**Cause**: All filters at default values  
**Solution**: Component only searches when at least one filter is active

### Issue: Debounce too slow/fast
**Cause**: 300ms delay may not suit all use cases  
**Solution**: Adjust debounce delay in `debouncedSearch` definition

### Issue: Suggestions not showing
**Cause**: `showSuggestions` state not set to true  
**Solution**: Ensure input `onFocus` sets `showSuggestions` to true

## Future Enhancements

- [ ] Search history with recent searches
- [ ] Saved search filters
- [ ] Search analytics tracking
- [ ] Voice search integration
- [ ] Fuzzy matching for typo tolerance
- [ ] Search result highlighting
- [ ] Export search results

## Dependencies

```json
{
  "@/components/ui/button": "Button component",
  "@/components/ui/input": "Input component",
  "@/components/ui/badge": "Badge component",
  "@/components/ui/card": "Card component",
  "@/components/ui/select": "Select dropdown component",
  "lucide-react": "Icon library"
}
```

## Related Components

- **GroupDetailPageMT**: Consumes search results
- **RecommendedGroups**: Complementary discovery feature
- **GroupHealthAnalytics**: Analytics for searched groups

## Changelog

### October 2025
- ✅ Initial implementation with full-text search
- ✅ Advanced filtering with city, role, member count
- ✅ Autocomplete suggestions
- ✅ Debounced search for performance
- ✅ WCAG AA accessibility compliance
- ✅ Comprehensive test coverage

---

**Status**: 🟢 Production Ready  
**Last Updated**: October 2025  
**Maintainer**: Groups Feature Team
