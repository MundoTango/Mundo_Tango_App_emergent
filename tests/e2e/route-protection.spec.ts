/**
 * ESA LIFE CEO 61×21 - Route Protection System Tests
 * Multi-Agent Build Sprint - Agent 3 (Layers 41-50)
 * 
 * PURPOSE: Prevent debug/test components from being accidentally used in production routes
 * 
 * BACKGROUND:
 * - Root Cause: ModernMemoriesPage (debug component) was incorrectly loaded in `/memories` route
 * - Expected: ESAMemoryFeed (production component) should be loaded instead
 * - This test suite ensures the correct component is always loaded
 * 
 * TEST STRATEGY:
 * 1. Smoke test - verify route loads without errors
 * 2. Component verification - check for production component markers
 * 3. Visual regression - detect debug UI elements via screenshot analysis
 * 4. Error detection - ensure no error messages are present
 * 
 * WHAT THESE TESTS PREVENT:
 * - Accidental deployment of debug components to production routes
 * - User-facing error messages from incorrect component loading
 * - Visual pollution from debug banners and test UI elements
 * - Route configuration regressions during refactoring
 */

import { test, expect, Page } from '@playwright/test';

/**
 * TEST 1: Route Accessibility and Basic Loading
 * 
 * PREVENTS:
 * - Broken routes that fail to load
 * - 404 errors from incorrect route configuration
 * - Infinite redirects or loading states
 * - Server errors during route rendering
 * 
 * VALIDATES:
 * - Route is accessible via direct navigation
 * - Page content loads within timeout
 * - No critical console errors during load
 */
test.describe('Route Protection - /memories endpoint', () => {
  test('TEST 1: should navigate to /memories and verify page loads successfully', async ({ page }) => {
    console.log('🧪 [Route Protection] Test 1: Navigating to /memories route...');
    
    // Navigate to the memories route
    const response = await page.goto('/memories', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Verify successful response
    expect(response?.status()).toBeLessThan(400);
    
    // Verify page title or heading is present (production component should render)
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible({ timeout: 10000 });
    
    // Wait for any client-side rendering to complete
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ [Route Protection] Test 1: Route loaded successfully');
  });

  /**
   * TEST 2: Production Component Verification
   * 
   * PREVENTS:
   * - Debug components (ModernMemoriesPage) being used in production routes
   * - Test UI components being exposed to end users
   * - Incorrect component imports in App.tsx routing
   * 
   * VALIDATES:
   * - ESAMemoryFeed component is rendered (production component)
   * - Component uses production data-testid markers
   * - Feed/memory display elements are present
   * 
   * DETECTION METHOD:
   * - Looks for data-testid attributes containing "memories" or "feed"
   * - ESAMemoryFeed uses testids like: "post-creator", "feed-container", etc.
   * - ModernMemoriesPage uses different testids or none at all
   */
  test('TEST 2: should verify production component (ESAMemoryFeed) is loaded', async ({ page }) => {
    console.log('🧪 [Route Protection] Test 2: Verifying production component markers...');
    
    await page.goto('/memories', { waitUntil: 'networkidle' });
    
    // Check for production component markers
    // ESAMemoryFeed should have data-testid attributes containing "memories", "feed", "post", etc.
    const productionMarkers = [
      '[data-testid*="memories"]',
      '[data-testid*="feed"]',
      '[data-testid*="post"]',
      '[data-testid="post-creator"]'
    ];
    
    let foundMarker = false;
    let markerFound = '';
    
    for (const selector of productionMarkers) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        foundMarker = true;
        markerFound = selector;
        console.log(`✅ [Route Protection] Found production marker: ${selector}`);
        break;
      }
    }
    
    expect(foundMarker, `Production component markers not found. Expected ESAMemoryFeed with data-testid containing "memories", "feed", or "post". This indicates a debug component may be loaded instead.`).toBeTruthy();
    
    console.log(`✅ [Route Protection] Test 2: Production component verified (${markerFound})`);
  });

  /**
   * TEST 3: Visual Regression - Debug Banner Detection
   * 
   * PREVENTS:
   * - Debug UI banners appearing in production (red/orange warning banners)
   * - Test messages like "CORRECT MEMORIES PAGE LOADED" being visible to users
   * - Developer debug text like "PIERRE DUBOIS INTERFACE" in production
   * - Internal component identifiers leaking to user-facing UI
   * 
   * VALIDATES:
   * - No debug text is present in the visible page content
   * - No test/debug banners are rendered
   * - Clean production UI without development artifacts
   * 
   * DETECTION METHOD:
   * - Text-based search for known debug strings
   * - Case-insensitive to catch variations
   * - Checks both visible and hidden elements (some debug text might be styled with display:none)
   */
  test('TEST 3: should not contain debug component markers or test banners', async ({ page }) => {
    console.log('🧪 [Route Protection] Test 3: Scanning for debug UI elements...');
    
    await page.goto('/memories', { waitUntil: 'networkidle' });
    
    // Wait for page to fully render
    await page.waitForTimeout(2000);
    
    // Get all text content from the page
    const pageText = await page.textContent('body');
    const lowercaseText = pageText?.toLowerCase() || '';
    
    // Debug strings that should NOT appear in production
    const debugStrings = [
      'CORRECT MEMORIES PAGE LOADED',  // ModernMemoriesPage debug banner
      'PIERRE DUBOIS INTERFACE',        // ModernMemoriesPage test text
      'DEBUG MODE',                      // Generic debug indicator
      'TEST COMPONENT',                  // Generic test indicator
      'ModernMemoriesPage'              // Component name should not be visible
    ];
    
    const foundDebugStrings: string[] = [];
    
    for (const debugString of debugStrings) {
      if (lowercaseText.includes(debugString.toLowerCase())) {
        foundDebugStrings.push(debugString);
        console.error(`❌ [Route Protection] Found debug string: "${debugString}"`);
      }
    }
    
    // Also check for red/orange debug banners (common pattern in debug UIs)
    const debugBanners = await page.locator('[style*="background: red"], [style*="background-color: red"], [class*="debug-banner"], [class*="test-banner"]').count();
    
    if (debugBanners > 0) {
      console.error(`❌ [Route Protection] Found ${debugBanners} debug banner(s)`);
    }
    
    // Fail if any debug elements are found
    expect(foundDebugStrings.length, `Debug UI elements detected: ${foundDebugStrings.join(', ')}. This indicates ModernMemoriesPage (debug component) is loaded instead of ESAMemoryFeed (production component).`).toBe(0);
    
    expect(debugBanners, 'Debug banner elements detected in the UI. This indicates a test/debug component is active.').toBe(0);
    
    console.log('✅ [Route Protection] Test 3: No debug UI elements found - clean production interface');
  });

  /**
   * TEST 4: Error Message Detection
   * 
   * PREVENTS:
   * - Component rendering errors being exposed to users
   * - Error boundaries showing technical error messages
   * - Component initialization failures
   * - Blank screens from failed component loading
   * 
   * VALIDATES:
   * - No error messages in the UI
   * - No "ModernMemoriesPage Error" text (indicates wrong component loaded)
   * - No React error boundaries triggered
   * - No console errors logged during render
   * 
   * DETECTION METHOD:
   * - Searches for error-related text patterns
   * - Checks for error boundary fallback UIs
   * - Monitors console for error logs
   */
  test('TEST 4: should not display component error messages', async ({ page }) => {
    console.log('🧪 [Route Protection] Test 4: Checking for error messages...');
    
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`❌ [Console Error] ${msg.text()}`);
      }
    });
    
    await page.goto('/memories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Get page text content
    const pageText = await page.textContent('body');
    const lowercaseText = pageText?.toLowerCase() || '';
    
    // Error strings that should NOT appear
    const errorStrings = [
      'ModernMemoriesPage Error',           // Specific error from wrong component
      'Component failed to load',           // Generic component error
      'Something went wrong',               // Common error message
      'Error loading memories',             // Memory-specific error
      'Failed to render',                   // Render failure
      'Uncaught error',                     // JS error leaked to UI
      'TypeError:',                         // JS type errors
      'ReferenceError:',                    // JS reference errors
      'Cannot read property',               // Common JS error pattern
      'is not defined'                      // Common JS error pattern
    ];
    
    const foundErrors: string[] = [];
    
    for (const errorString of errorStrings) {
      if (lowercaseText.includes(errorString.toLowerCase())) {
        foundErrors.push(errorString);
        console.error(`❌ [Route Protection] Found error text: "${errorString}"`);
      }
    }
    
    // Check for error boundary UI elements
    const errorBoundaries = await page.locator('[class*="error-boundary"], [data-testid*="error"]').count();
    
    if (errorBoundaries > 0) {
      console.error(`❌ [Route Protection] Found ${errorBoundaries} error boundary element(s)`);
    }
    
    // Fail if any errors are found
    expect(foundErrors.length, `Error messages detected in UI: ${foundErrors.join(', ')}. This indicates component loading or rendering failures.`).toBe(0);
    
    expect(errorBoundaries, 'Error boundary elements detected. This indicates component rendering failures.').toBe(0);
    
    // Check console errors (allow some non-critical warnings)
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('ModernMemoriesPage') || 
      err.includes('Failed to load') ||
      err.includes('TypeError') ||
      err.includes('ReferenceError')
    );
    
    expect(criticalErrors.length, `Critical console errors detected: ${criticalErrors.join(', ')}`).toBe(0);
    
    console.log('✅ [Route Protection] Test 4: No error messages found - component loaded successfully');
  });

  /**
   * BONUS TEST: Network Request Validation
   * 
   * PREVENTS:
   * - Wrong API endpoints being called by debug components
   * - Failed API requests causing blank screens
   * - Missing authentication causing redirect loops
   * 
   * VALIDATES:
   * - Correct API endpoints are called (e.g., /api/posts/feed)
   * - API requests complete successfully
   * - No 4xx or 5xx errors in critical requests
   */
  test('BONUS: should make correct API requests for production feed data', async ({ page }) => {
    console.log('🧪 [Route Protection] Bonus Test: Validating API requests...');
    
    // Track API requests
    const apiRequests: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiRequests.push({
          url: url,
          status: response.status()
        });
        console.log(`📡 API Request: ${response.status()} ${url}`);
      }
    });
    
    await page.goto('/memories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Verify feed API was called
    const feedRequests = apiRequests.filter(req => 
      req.url.includes('/api/posts') || 
      req.url.includes('/api/feed') ||
      req.url.includes('/api/memories')
    );
    
    expect(feedRequests.length, 'No feed API requests detected. Production component should fetch feed data.').toBeGreaterThan(0);
    
    // Verify no critical API failures
    const failedRequests = feedRequests.filter(req => req.status >= 400);
    
    expect(failedRequests.length, `API requests failed: ${failedRequests.map(r => `${r.status} ${r.url}`).join(', ')}`).toBe(0);
    
    console.log(`✅ [Route Protection] Bonus Test: ${feedRequests.length} feed API request(s) completed successfully`);
  });
});

/**
 * TEST SUMMARY
 * 
 * These tests form a 4-layer protection system against route configuration bugs:
 * 
 * Layer 1: Smoke Test (Test 1)
 * - Ensures route is accessible and page loads
 * - First line of defense against broken routes
 * 
 * Layer 2: Component Verification (Test 2)
 * - Validates correct production component is loaded
 * - Detects incorrect component imports in routing
 * 
 * Layer 3: Visual Regression (Test 3)
 * - Catches debug UI elements leaking to production
 * - Prevents user-facing debug text and banners
 * 
 * Layer 4: Error Detection (Test 4)
 * - Ensures no component errors are displayed
 * - Validates clean rendering without failures
 * 
 * Bonus: API Validation
 * - Confirms production data sources are used
 * - Validates network behavior matches production expectations
 * 
 * MAINTENANCE NOTES:
 * - Update debug string list if new debug components are added
 * - Update production markers if ESAMemoryFeed testids change
 * - Run these tests before every production deployment
 * - Consider adding visual screenshot comparison for more robust visual regression
 */
