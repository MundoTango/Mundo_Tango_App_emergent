import { test, expect } from '@playwright/test';

/**
 * Tango World Map E2E Tests
 * 
 * Test Plan:
 * 1. Navigate to /community-world-map page
 * 2. Verify page loads with title "Tango World Map"
 * 3. Check that 3 tabs are visible: "Interactive Map", "Global Statistics", "City Rankings"
 * 4. Verify the Interactive Map tab is selected by default
 * 5. Check that the map displays with city markers (Buenos Aires, Madrid, New York)
 * 6. Verify city markers are clickable and show popup information
 * 7. Click on "Global Statistics" tab and verify it displays statistics
 * 8. Click on "City Rankings" tab and verify it shows ranked cities
 * 9. Verify the search input box works
 * 10. Check that all 3 cities (Buenos Aires, Madrid, New York) are visible somewhere on the page
 */

test.describe('Tango World Map - End-to-End Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer default timeout for map loading
    page.setDefaultTimeout(15000);
    
    // Navigate to the community world map page
    await page.goto('/community-world-map', { waitUntil: 'domcontentloaded' });
    
    // Wait for the main content to be visible
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should load page with correct title "Tango World Map"', async ({ page }) => {
    // Check page title
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 5000 });
    await expect(heading).toContainText('Tango World Map');
    
    // Check subtitle/description
    const description = page.locator('text=Explore tango communities around the world');
    await expect(description).toBeVisible({ timeout: 5000 });
  });

  test('should display 3 tabs: Interactive Map, Global Statistics, City Rankings', async ({ page }) => {
    // Wait for tabs to be rendered
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
    
    // Check for all 3 tabs
    const mapTab = page.locator('[role="tab"]').filter({ hasText: 'Interactive Map' });
    const statsTab = page.locator('[role="tab"]').filter({ hasText: 'Global Statistics' });
    const rankingsTab = page.locator('[role="tab"]').filter({ hasText: 'City Rankings' });
    
    await expect(mapTab).toBeVisible({ timeout: 5000 });
    await expect(statsTab).toBeVisible({ timeout: 5000 });
    await expect(rankingsTab).toBeVisible({ timeout: 5000 });
  });

  test('should have Interactive Map tab selected by default', async ({ page }) => {
    // Wait for tabs to render
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
    
    // Check that Interactive Map tab is active
    const mapTab = page.locator('[role="tab"]').filter({ hasText: 'Interactive Map' });
    await expect(mapTab).toHaveAttribute('data-state', 'active', { timeout: 5000 });
    
    // Verify map content is visible (Leaflet container)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });
  });

  test('should display the map container', async ({ page }) => {
    // Wait for map to load
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
    
    // Verify map has loaded tiles
    const mapTiles = page.locator('.leaflet-tile-pane');
    await expect(mapTiles).toBeVisible({ timeout: 10000 });
  });

  test('should fetch city groups data successfully', async ({ page }) => {
    // Set up response listener before navigation
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/community/city-groups') && response.status() === 200,
      { timeout: 15000 }
    );
    
    // Reload to ensure we catch the request
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for the API response
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    
    // Parse response data
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    
    // Verify we have city data with coordinates
    const cities = data.data;
    expect(cities.length).toBeGreaterThan(0);
    
    // Check that cities have required coordinate fields
    for (const city of cities) {
      expect(city).toHaveProperty('lat');
      expect(city).toHaveProperty('lng');
      expect(city).toHaveProperty('city');
      
      // Verify coordinates are valid
      const lat = parseFloat(city.lat);
      const lng = parseFloat(city.lng);
      expect(isNaN(lat)).toBe(false);
      expect(isNaN(lng)).toBe(false);
    }
  });

  test('should display city markers on the map', async ({ page }) => {
    // Wait for map container
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    
    // Wait for city groups API to complete
    await page.waitForResponse(
      response => response.url().includes('/api/community/city-groups'),
      { timeout: 15000 }
    );
    
    // Wait for custom markers to appear (give it extra time)
    await page.waitForSelector('.custom-city-marker', { timeout: 20000, state: 'attached' });
    
    // Check that markers are present
    const markers = page.locator('.custom-city-marker');
    const markerCount = await markers.count();
    
    // We should have at least one marker
    expect(markerCount).toBeGreaterThan(0);
    
    console.log(`✓ Found ${markerCount} city markers on the map`);
  });

  test('should show popup when clicking on a city marker', async ({ page }) => {
    // Wait for map and markers to load
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    await page.waitForSelector('.custom-city-marker', { timeout: 20000 });
    
    // Click on the first city marker
    const firstMarker = page.locator('.custom-city-marker').first();
    await firstMarker.click();
    
    // Wait for popup to appear
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible({ timeout: 5000 });
    
    // Verify popup contains city name
    await expect(popup.locator('h3')).toBeVisible({ timeout: 3000 });
    
    // Verify "View Group" button is present
    const viewButton = popup.locator('button').filter({ hasText: /View.*Group/i });
    await expect(viewButton).toBeVisible({ timeout: 3000 });
  });

  test('should display search input box', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search city"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    // Check for search button
    const searchButton = page.locator('button').filter({ hasText: 'Search' });
    await expect(searchButton).toBeVisible({ timeout: 5000 });
  });

  test('should allow typing in search box', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search city"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    // Type in search box
    await searchInput.fill('Buenos Aires');
    
    // Verify input has the value
    await expect(searchInput).toHaveValue('Buenos Aires');
  });

  test('should switch to Global Statistics tab', async ({ page }) => {
    // Wait for tabs to load
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
    
    // Click on Global Statistics tab
    const statsTab = page.locator('[role="tab"]').filter({ hasText: 'Global Statistics' });
    await statsTab.click();
    
    // Wait for tab to become active
    await expect(statsTab).toHaveAttribute('data-state', 'active', { timeout: 5000 });
    
    // Wait a moment for content to render
    await page.waitForTimeout(1000);
    
    // Verify statistics content is visible - look for common stat terms
    const hasStatsContent = await page.locator('text=/Total Dancers|Active Cities|Events|Statistics/i').first().isVisible();
    expect(hasStatsContent).toBe(true);
  });

  test('should display statistics cards in Global Statistics tab', async ({ page }) => {
    // Switch to Global Statistics tab
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
    const statsTab = page.locator('[role="tab"]').filter({ hasText: 'Global Statistics' });
    await statsTab.click();
    await expect(statsTab).toHaveAttribute('data-state', 'active');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Look for card elements (they typically use specific CSS classes)
    const cards = page.locator('[class*="grid"] [class*="p-6"], [class*="card"]');
    const cardCount = await cards.count();
    
    // Should have at least one stat card
    expect(cardCount).toBeGreaterThan(0);
    
    console.log(`✓ Found ${cardCount} statistic cards`);
  });

  test('should switch to City Rankings tab', async ({ page }) => {
    // Wait for tabs to load
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
    
    // Click on City Rankings tab
    const rankingsTab = page.locator('[role="tab"]').filter({ hasText: 'City Rankings' });
    await rankingsTab.click();
    
    // Wait for tab to become active
    await expect(rankingsTab).toHaveAttribute('data-state', 'active', { timeout: 5000 });
    
    // Wait for content to render
    await page.waitForTimeout(1000);
    
    // Verify rankings content is present
    const hasRankingsContent = await page.locator('text=/City Rankings|Top Cities|Ranking/i').first().isVisible();
    expect(hasRankingsContent).toBe(true);
  });

  test('should display map legend', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    
    // Check for legend items - these specific texts are in the WorldMap component
    const legendTexts = [
      '500+ people',
      '200-500 people',
      '100-200 people',
      '50-100 people',
      '<50 people'
    ];
    
    // Check if legend items are visible
    let foundLegendItems = 0;
    for (const text of legendTexts) {
      const element = page.locator(`text="${text}"`);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        foundLegendItems++;
      }
    }
    
    // Should have at least 3 legend items visible
    expect(foundLegendItems).toBeGreaterThanOrEqual(3);
    
    console.log(`✓ Found ${foundLegendItems} legend items`);
  });

  test('should not have critical console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload page to capture all console messages
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Filter out expected/acceptable errors
    const relevantErrors = consoleErrors.filter(error => {
      // Filter out known non-critical errors
      const ignoredPatterns = [
        /Download the React DevTools/i,
        /Warning: ReactDOM.render/i,
        /favicon/i,
        /manifest/i
      ];
      
      return !ignoredPatterns.some(pattern => pattern.test(error));
    });
    
    // Log any errors found for debugging
    if (relevantErrors.length > 0) {
      console.log('Console errors found:', relevantErrors);
    }
    
    // Should not have any critical console errors
    expect(relevantErrors.length).toBe(0);
  });

  test('should have responsive map container with proper dimensions', async ({ page }) => {
    // Get map container
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
    
    // Check map has proper dimensions
    const boundingBox = await mapContainer.boundingBox();
    expect(boundingBox).toBeTruthy();
    
    if (boundingBox) {
      // Map should have reasonable dimensions (at least 400x400)
      expect(boundingBox.width).toBeGreaterThan(400);
      expect(boundingBox.height).toBeGreaterThan(400);
      
      console.log(`✓ Map dimensions: ${boundingBox.width}x${boundingBox.height}`);
    }
  });

  test('should display all tab content without errors', async ({ page }) => {
    // Test Interactive Map tab
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
    const mapTab = page.locator('[role="tab"]').filter({ hasText: 'Interactive Map' });
    await mapTab.click();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });
    
    // Test Global Statistics tab
    const statsTab = page.locator('[role="tab"]').filter({ hasText: 'Global Statistics' });
    await statsTab.click();
    await expect(statsTab).toHaveAttribute('data-state', 'active');
    await page.waitForTimeout(500);
    
    // Test City Rankings tab
    const rankingsTab = page.locator('[role="tab"]').filter({ hasText: 'City Rankings' });
    await rankingsTab.click();
    await expect(rankingsTab).toHaveAttribute('data-state', 'active');
    await page.waitForTimeout(500);
    
    // Switch back to map
    await mapTab.click();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });

  test('should verify API returns city data with proper structure', async ({ page }) => {
    // Listen for the API response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/community/city-groups'),
      { timeout: 15000 }
    );
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    const response = await responsePromise;
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    
    // Verify at least one city has all required fields
    if (data.data.length > 0) {
      const firstCity = data.data[0];
      expect(firstCity).toHaveProperty('id');
      expect(firstCity).toHaveProperty('name');
      expect(firstCity).toHaveProperty('city');
      expect(firstCity).toHaveProperty('lat');
      expect(firstCity).toHaveProperty('lng');
      expect(firstCity).toHaveProperty('memberCount');
      
      console.log(`✓ API returned ${data.data.length} cities with proper structure`);
      console.log(`Sample city: ${firstCity.city}, ${firstCity.country} (${firstCity.lat}, ${firstCity.lng})`);
    }
  });
});
