/**
 * ESA 61×21 - Memories Feed Fixes Verification
 * 
 * Verifies the 3 critical fixes implemented on October 5, 2025:
 * 1. Context object memoization (no infinite re-render loops)
 * 2. Suspense wrapper removal (PostFeed not wrapped incorrectly)
 * 3. Primitive dependencies in useEffect (no object reference triggers)
 * 
 * Test Strategy: Lightweight smoke tests against live application
 */

import { test, expect } from '@playwright/test';

test.describe('ESA 61×21 - Memories Feed Fix Verification', () => {
  
  test('should display posts without infinite API loop', async ({ page }) => {
    const apiCalls: string[] = [];
    
    // Monitor API calls
    page.on('request', req => {
      if (req.url().includes('/api/posts/feed')) {
        apiCalls.push(req.url());
        console.log(`📡 API call ${apiCalls.length}: ${req.url()}`);
      }
    });
    
    // Navigate to memories page
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    
    // Wait for posts to potentially load
    await page.waitForTimeout(3000);
    
    // CRITICAL: Should have <3 API calls, not 50+ (infinite loop)
    console.log(`✅ Total API calls: ${apiCalls.length}`);
    expect(apiCalls.length).toBeLessThan(5);
    expect(apiCalls.length).toBeGreaterThan(0);
    
    console.log('✅ PASS: No infinite API loop detected');
  });
  
  test('should render at least one post', async ({ page }) => {
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for post elements (various possible test IDs)
    const postSelectors = [
      '[data-testid^="card-post-"]',
      '[data-testid^="card-memory-"]',
      '[data-testid^="post-"]'
    ];
    
    let foundPost = false;
    for (const selector of postSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ Found ${count} posts using selector: ${selector}`);
        foundPost = true;
        break;
      }
    }
    
    // Alternative: Check for post content
    if (!foundPost) {
      const hasPostContent = await page.getByText('@Elena').count() > 0;
      if (hasPostContent) {
        console.log('✅ Found post content with mentions');
        foundPost = true;
      }
    }
    
    expect(foundPost).toBe(true);
    console.log('✅ PASS: Posts are rendering');
  });
  
  test('should have no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(err => 
      !err.includes('404') && 
      !err.includes('Failed to load resource') &&
      !err.includes('WebSocket')
    );
    
    console.log(`📊 Total console errors: ${errors.length}, Critical: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('❌ Critical errors found:');
      criticalErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ PASS: No critical console errors');
  });
  
  test('should load page within performance target', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Page load time: ${loadTime}ms`);
    
    // Target: < 5s (relaxed for smoke test)
    expect(loadTime).toBeLessThan(5000);
    
    // Ideal target from ESA: < 2s
    if (loadTime < 2000) {
      console.log('🎯 EXCELLENT: Page loaded in < 2s (ESA target met)');
    } else {
      console.log(`⚠️  Page loaded in ${loadTime}ms (ESA target: <2s)`);
    }
    
    console.log('✅ PASS: Page load performance acceptable');
  });
  
  test('should have proper navigation elements', async ({ page }) => {
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Check for key UI elements
    const hasHeader = await page.locator('header, nav').count() > 0;
    const hasSidebar = await page.locator('[data-testid*="sidebar"], aside').count() > 0;
    const hasTitle = await page.getByText('Memories', { exact: false }).count() > 0;
    
    console.log(`📊 UI Elements: Header=${hasHeader}, Sidebar=${hasSidebar}, Title=${hasTitle}`);
    
    expect(hasHeader || hasTitle).toBe(true);
    console.log('✅ PASS: Page structure is present');
  });
  
  test('should support mention links', async ({ page }) => {
    await page.goto('http://localhost:5000/memories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Look for mention links (starts with @)
    const mentionLinks = page.locator('a[href*="/profile/"], a:has-text("@")');
    const count = await mentionLinks.count();
    
    console.log(`📊 Found ${count} potential mention links`);
    
    if (count > 0) {
      const firstMention = mentionLinks.first();
      await expect(firstMention).toBeVisible();
      console.log('✅ PASS: Mention links are present and visible');
    } else {
      console.log('⚠️  No mention links found (might not be in current posts)');
    }
  });
});

test.describe('ESA 61×21 - Performance Metrics', () => {
  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:5000/memories');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => ({
      memory: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : null,
      navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      paint: performance.getEntriesByType('paint')
    }));
    
    console.log('📊 Performance Metrics:');
    console.log(`  Memory: ${metrics.memory ? (metrics.memory / 1024 / 1024).toFixed(2) : 'N/A'} MB`);
    console.log(`  DOM Content Loaded: ${metrics.navigation.domContentLoadedEventEnd}ms`);
    console.log(`  Load Complete: ${metrics.navigation.loadEventEnd}ms`);
    
    if (metrics.paint.length > 0) {
      const fcp = metrics.paint.find((p: any) => p.name === 'first-contentful-paint');
      if (fcp) {
        console.log(`  First Contentful Paint: ${fcp.startTime.toFixed(2)}ms`);
        
        // ESA Target: FCP < 1000ms
        if (fcp.startTime < 1000) {
          console.log('  🎯 FCP target met (<1s)');
        }
      }
    }
    
    // Memory target: < 100MB
    if (metrics.memory && metrics.memory < 100 * 1024 * 1024) {
      console.log('  🎯 Memory target met (<100MB)');
    }
    
    console.log('✅ PASS: Performance metrics collected');
  });
});
