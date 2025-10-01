# Tango World Map E2E Test Suite

## Overview

This test suite provides comprehensive end-to-end testing for the Tango World Map page (`/community-world-map`), which displays an interactive map of tango communities worldwide.

## Test File Location

- **Test File**: `tests/e2e/community-world-map.spec.ts`
- **Test Runner Script**: `run-world-map-tests.sh`

## Test Coverage

The test suite includes 17 comprehensive tests covering all major features:

### 1. Page Loading & Structure (3 tests)
- ✓ Page loads with correct title "Tango World Map"
- ✓ Displays 3 tabs: Interactive Map, Global Statistics, City Rankings
- ✓ Interactive Map tab is selected by default

### 2. Map Functionality (5 tests)
- ✓ Map container displays correctly
- ✓ City markers appear on the map
- ✓ Markers are clickable and show popups
- ✓ Map legend displays community size indicators
- ✓ Map has responsive dimensions (>400x400px)

### 3. API Integration (2 tests)
- ✓ `/api/community/city-groups` endpoint returns data successfully
- ✓ API data has proper structure with coordinates (lat/lng as strings)
- ✓ Coordinates can be parsed to valid floats

### 4. Search Functionality (2 tests)
- ✓ Search input box is visible
- ✓ Users can type in search box

### 5. Tab Navigation (3 tests)
- ✓ Global Statistics tab displays correctly
- ✓ City Rankings tab displays correctly
- ✓ All tabs can be switched without errors

### 6. Data Quality (2 tests)
- ✓ No critical console errors on page load
- ✓ City data includes all required fields (id, name, city, lat, lng, memberCount)

## Running the Tests

### Quick Start

```bash
# Run all world map tests
./run-world-map-tests.sh

# Or use Playwright directly
npx playwright test tests/e2e/community-world-map.spec.ts
```

### Run Specific Tests

```bash
# Run only a specific test
npx playwright test tests/e2e/community-world-map.spec.ts -g "should load page with correct title"

# Run with headed browser (visible)
npx playwright test tests/e2e/community-world-map.spec.ts --headed

# Run with debug mode
npx playwright test tests/e2e/community-world-map.spec.ts --debug
```

### View Test Reports

```bash
# Generate and view HTML report
npx playwright show-report tests/e2e/playwright-report
```

## Test Architecture

### Key Components Tested

1. **WorldMap Component** (`client/src/components/Community/WorldMap.tsx`)
   - Leaflet map integration
   - Custom city markers with dynamic sizing
   - Interactive popups with city statistics
   - Map legend

2. **Community World Map Page** (`client/src/pages/community-world-map.tsx`)
   - Tab navigation (3 tabs)
   - Search functionality
   - Statistics display
   - City rankings

3. **API Endpoint** (`/api/community/city-groups`)
   - Returns city groups with coordinates
   - Data format: `{ success: boolean, data: CityGroup[] }`
   - Coordinates as strings: `lat` and `lng`

### Test Timeouts

- Default timeout: 15 seconds (for map loading)
- Map marker loading: 20 seconds (allows for API calls + rendering)
- Basic elements: 5-10 seconds

### Wait Strategies

The tests use multiple wait strategies for reliability:

1. **DOM Content Loaded**: Fast initial page load
2. **API Response Waiting**: Waits for city groups data
3. **Element Visibility**: Ensures elements are rendered
4. **Custom Timeouts**: Longer waits for map-specific elements

## Expected Data Structure

### City Group API Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Buenos Aires Tango",
      "city": "Buenos Aires",
      "country": "Argentina",
      "lat": "-34.61",
      "lng": "-58.39",
      "memberCount": 150,
      "eventCount": 0,
      "hostCount": 0,
      "recommendationCount": 0
    }
  ]
}
```

### Key Fields

- **lat/lng**: String coordinates (parsed to floats in frontend)
- **memberCount**: Number of community members
- **city/country**: Location information

## Test Cities

The application includes data for at least:
- Buenos Aires, Argentina (-34.61, -58.39)
- Madrid, Spain (40.42, -3.70)
- New York, USA (40.71, -74.01)

## Troubleshooting

### Common Issues

1. **Test Timeout**
   - Increase timeout in test: `page.setDefaultTimeout(30000)`
   - Check if server is running on http://localhost:5000

2. **Markers Not Found**
   - Ensure API returns data with valid coordinates
   - Check that coordinates are strings that can parse to floats
   - Verify `.custom-city-marker` class is rendered

3. **Console Errors**
   - Check browser console in headed mode: `--headed`
   - Some errors (React DevTools, favicon) are expected and filtered

### Debug Mode

```bash
# Run a single test in debug mode with visible browser
npx playwright test tests/e2e/community-world-map.spec.ts \
  -g "should display city markers" \
  --headed \
  --debug
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run World Map E2E Tests
  run: npx playwright test tests/e2e/community-world-map.spec.ts
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/e2e/playwright-report/
```

## Performance Considerations

- Map loading: ~2-5 seconds
- API response: <1 second
- Marker rendering: 1-3 seconds
- Total page ready: ~5-8 seconds

## Future Enhancements

Potential additional tests to add:
- [ ] Test marker clustering at different zoom levels
- [ ] Test map pan and zoom functionality
- [ ] Test search functionality with actual city lookup
- [ ] Test responsive behavior on mobile viewport
- [ ] Test accessibility (keyboard navigation)
- [ ] Test internationalization (i18n) for different languages

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Leaflet Map Library](https://leafletjs.com/)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)

## Support

For issues or questions about these tests:
1. Check console output for specific error messages
2. Run with `--headed` flag to see visual issues
3. Check API endpoint directly: `curl http://localhost:5000/api/community/city-groups`
4. Review component code in `client/src/components/Community/WorldMap.tsx`
