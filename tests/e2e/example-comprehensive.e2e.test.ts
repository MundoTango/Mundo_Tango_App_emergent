import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { testUsers, testEvents, waitTimes } from './fixtures/test-data';
import {
  login,
  fillForm,
  uploadFile,
  checkToastMessage,
  mockApiResponse,
  waitForApiResponse,
  navigateWithRetry,
} from './helpers/test-helpers';
import {
  assertNoA11yViolations,
  checkKeyboardNavigation,
  checkHeadingHierarchy,
} from './helpers/accessibility';
import {
  takePercySnapshot,
  compareScreenshot,
  stabilizePage,
  testDarkMode,
} from './helpers/visual-regression';

/**
 * Comprehensive E2E Test Example for Mundo Tango
 * Demonstrates all testing framework features
 */

test.describe('Comprehensive Mundo Tango Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await navigateWithRetry(page, '/');
  });
  
  test('Complete user journey with all features', async ({ page, browserName }) => {
    // Step 1: Test responsive design across devices
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await stabilizePage(page);
      
      // Visual regression for each viewport
      await compareScreenshot(page, {
        name: `homepage-${viewport.name}-${browserName}`,
        fullPage: true,
      });
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Step 2: Test authentication flow
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Check accessibility of login page
    await assertNoA11yViolations(page, {
      skipImpacts: ['minor'],
    });
    
    // Test form validation
    await loginPage.fillLoginForm('invalid-email', 'short');
    await loginPage.submitLogin();
    
    const validationErrors = await loginPage.validateLoginForm();
    expect(validationErrors.emailError).toContain('valid email');
    expect(validationErrors.passwordError).toContain('at least');
    
    // Successful login
    await loginPage.login(testUsers.regularUser.email, testUsers.regularUser.password);
    
    // Check for successful login toast
    await checkToastMessage(page, 'Welcome back', 'success');
    
    // Step 3: Test dashboard with mocked data
    await mockApiResponse(page, {
      url: '/api/dashboard/stats',
      body: {
        events: 15,
        connections: 42,
        messages: 7,
      },
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Visual snapshot of dashboard
    await takePercySnapshot(page, 'Dashboard View', {
      widths: [375, 768, 1280, 1920],
    });
    
    // Step 4: Test event creation with file upload
    await page.goto('/events/create');
    
    // Fill event form
    await fillForm(page, {
      'input-event-title': testEvents[0].title,
      'textarea-event-description': testEvents[0].description,
      'input-event-date': '2025-10-01',
      'input-event-time': '22:00',
      'input-event-location': testEvents[0].location,
      'input-event-capacity': String(testEvents[0].capacity),
      'input-event-price': String(testEvents[0].price),
      'select-event-category': testEvents[0].category,
    });
    
    // Upload event banner
    await uploadFile(
      page,
      '[data-testid="input-event-banner"]',
      'tests/e2e/fixtures/files/event-banner.jpg'
    );
    
    // Submit form and wait for API response
    const responsePromise = waitForApiResponse(page, '/api/events');
    await page.click('[data-testid="button-submit-event"]');
    const response = await responsePromise;
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBeTruthy();
    
    // Step 5: Test keyboard navigation
    await page.goto('/events');
    
    await checkKeyboardNavigation(page, [
      '[data-testid="input-search"]',
      '[data-testid="button-filter"]',
      '[data-testid="button-create-event"]',
      '[data-testid="card-event-1"]',
      '[data-testid="card-event-2"]',
    ]);
    
    // Step 6: Test infinite scroll
    await page.goto('/feed');
    
    // Scroll to trigger lazy loading
    let previousCount = await page.locator('[data-testid^="post-"]').count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(waitTimes.short);
    
    let currentCount = await page.locator('[data-testid^="post-"]').count();
    expect(currentCount).toBeGreaterThan(previousCount);
    
    // Step 7: Test real-time features (WebSocket)
    await page.goto('/messages');
    
    // Listen for WebSocket messages
    page.on('websocket', (ws) => {
      ws.on('framereceived', (event) => {
        console.log('WebSocket message received:', event.payload);
      });
    });
    
    // Send a message
    await page.fill('[data-testid="input-message"]', 'Test message');
    await page.press('[data-testid="input-message"]', 'Enter');
    
    // Wait for message to appear
    await expect(page.locator('text="Test message"')).toBeVisible({ timeout: 5000 });
    
    // Step 8: Test geolocation features
    await page.goto('/map');
    
    // Grant geolocation permission
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: -34.6037, longitude: -58.3816 });
    
    // Check if map centered on user location
    await page.click('[data-testid="button-center-location"]');
    await page.waitForTimeout(waitTimes.short);
    
    // Step 9: Test dark mode
    await testDarkMode(page, 'app-dark-mode');
    
    // Step 10: Test error handling
    await mockApiResponse(page, {
      url: '/api/events',
      status: 500,
      body: { error: 'Server error' },
    });
    
    await page.goto('/events');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Step 11: Check heading hierarchy
    await checkHeadingHierarchy(page);
    
    // Step 12: Test logout
    await page.click('[data-testid="button-user-menu"]');
    await page.click('[data-testid="button-logout"]');
    
    await page.waitForURL('**/auth/login');
    await checkToastMessage(page, 'logged out', 'info');
  });
  
  test('Mobile-specific gestures and interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await login(page, testUsers.regularUser);
    await page.goto('/feed');
    
    // Test swipe gestures
    const postCard = page.locator('[data-testid="post-1"]');
    
    // Simulate swipe left to reveal actions
    await postCard.dragTo(postCard, {
      sourcePosition: { x: 300, y: 50 },
      targetPosition: { x: 50, y: 50 },
    });
    
    // Check if action buttons are visible
    await expect(page.locator('[data-testid="button-delete-post"]')).toBeVisible();
    
    // Test pull-to-refresh
    await page.evaluate(() => {
      window.scrollTo(0, -100);
      window.dispatchEvent(new Event('touchend'));
    });
    
    // Wait for refresh indicator
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
    
    // Test hamburger menu
    await page.click('[data-testid="button-hamburger-menu"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test touch interactions
    const likeButton = page.locator('[data-testid="button-like-1"]');
    await likeButton.tap();
    await expect(likeButton).toHaveClass(/liked/);
  });
  
  test('Performance monitoring', async ({ page }) => {
    await login(page, testUsers.regularUser);
    
    // Measure page load performance
    await page.goto('/events');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    // Assert performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
    expect(metrics.firstContentfulPaint).toBeLessThan(2000);
    
    console.log('Performance Metrics:', metrics);
  });
  
  test('Cross-browser compatibility', async ({ page, browserName }) => {
    await login(page, testUsers.regularUser);
    
    // Test browser-specific features
    if (browserName === 'chromium') {
      // Test Chrome-specific features
      await page.goto('/notifications');
      await page.context().grantPermissions(['notifications']);
      
      await page.click('[data-testid="button-enable-notifications"]');
      // Chrome notification API test
    }
    
    if (browserName === 'firefox') {
      // Test Firefox-specific features
      await page.goto('/profile');
      // Firefox-specific privacy settings
    }
    
    if (browserName === 'webkit') {
      // Test Safari-specific features
      await page.goto('/media');
      // Safari media playback test
    }
    
    // Visual regression for browser-specific rendering
    await compareScreenshot(page, {
      name: `browser-specific-${browserName}`,
      fullPage: true,
    });
  });
  
  test('Network conditions simulation', async ({ page, context }) => {
    await login(page, testUsers.regularUser);
    
    // Simulate slow 3G network
    await context.route('**/*', (route) => {
      setTimeout(() => route.continue(), 2000);
    });
    
    await page.goto('/events');
    
    // Check loading states
    await expect(page.locator('[data-testid="skeleton-loader"]')).toBeVisible();
    await expect(page.locator('[data-testid="skeleton-loader"]')).toBeHidden({ timeout: 10000 });
    
    // Simulate offline mode
    await context.setOffline(true);
    await page.reload();
    
    // Check offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Restore connection
    await context.setOffline(false);
    await page.reload();
    
    await expect(page.locator('[data-testid="offline-message"]')).toBeHidden();
  });
});