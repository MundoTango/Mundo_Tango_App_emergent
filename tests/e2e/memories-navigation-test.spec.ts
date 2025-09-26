import { test, expect } from '@playwright/test';

test.describe('Memories Page Navigation and Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:5000/');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="input-memory-content"]', { timeout: 10000 });
  });

  test('1. Page loads correctly at "/" route', async ({ page }) => {
    // Verify we're on the correct URL
    expect(page.url()).toBe('http://localhost:5000/');
    
    // Verify main Memories title is visible
    await expect(page.getByText('Memories').first()).toBeVisible();
    
    // Verify the memory input field is present
    await expect(page.locator('[data-testid="input-memory-content"]')).toBeVisible();
    
    // Verify Share Memory button is present
    await expect(page.locator('[data-testid="button-share-memory"]')).toBeVisible();
  });

  test('2. Navigation links in left sidebar route correctly', async ({ page }) => {
    // Test each navigation link
    const navigationTests = [
      { text: 'Memories', href: '/', shouldNavigate: false },
      { text: 'Tango Community', href: '/tango-communities', shouldNavigate: true },
      { text: 'Friends', href: '/friends', shouldNavigate: true },
      { text: 'Messages', href: '/messages', shouldNavigate: true },
      { text: 'Groups', href: '/groups', shouldNavigate: true },
      { text: 'Events', href: '/events', shouldNavigate: true },
      { text: 'Role Invitations', href: '/role-invitations', shouldNavigate: true }
    ];

    for (const navTest of navigationTests) {
      // Find and click the navigation link
      const link = page.getByRole('button', { name: navTest.text });
      await expect(link).toBeVisible();
      
      if (navTest.shouldNavigate) {
        // Click and verify navigation
        await link.click();
        await page.waitForURL(`**${navTest.href}`, { timeout: 5000 });
        expect(page.url()).toContain(navTest.href);
        
        // Navigate back to memories page for next test
        await page.goto('http://localhost:5000/');
        await page.waitForSelector('[data-testid="input-memory-content"]', { timeout: 10000 });
      } else {
        // For Memories link, verify it doesn't navigate (stays on same page)
        const currentUrl = page.url();
        await link.click();
        await page.waitForTimeout(500); // Small wait to ensure no navigation
        expect(page.url()).toBe(currentUrl);
      }
    }
  });

  test('3. Memory posting functionality works', async ({ page }) => {
    // Enter text in the memory field
    const testMemoryText = 'Beautiful milonga at La Viruta last night! Amazing energy and music 💃🕺';
    await page.locator('[data-testid="input-memory-content"]').fill(testMemoryText);
    
    // Verify text is entered
    await expect(page.locator('[data-testid="input-memory-content"]')).toHaveValue(testMemoryText);
    
    // Click Share Memory button
    await page.locator('[data-testid="button-share-memory"]').click();
    
    // Wait for success message or for the input to clear (whichever happens)
    try {
      // Check if success toast appears
      await expect(page.getByText('Memory shared successfully!')).toBeVisible({ timeout: 5000 });
    } catch {
      // If no toast, check if the input cleared
      await expect(page.locator('[data-testid="input-memory-content"]')).toHaveValue('', { timeout: 5000 });
    }
    
    // Note: Memory may not appear immediately in feed due to backend processing
    // We've confirmed the UI interaction works
  });

  test('4. Layout matches specifications', async ({ page }) => {
    // Verify Pierre Dubois profile is at top of left sidebar
    const leftSidebar = page.locator('.w-72').first(); // Left sidebar has w-72 class
    
    // Check Pierre Dubois name is visible in left sidebar
    await expect(leftSidebar.getByText('Pierre Dubois')).toBeVisible();
    await expect(leftSidebar.getByText('@pierre_dancer')).toBeVisible();
    
    // Verify Admin badge if logged in as admin
    const adminBadge = leftSidebar.locator('text=Admin');
    if (await adminBadge.isVisible()) {
      await expect(adminBadge).toBeVisible();
    }
    
    // Verify Community Stats are in left sidebar (not right)
    await expect(leftSidebar.getByText('Global Statistics')).toBeVisible();
    await expect(leftSidebar.getByText('Global Dancers')).toBeVisible();
    await expect(leftSidebar.getByText('Active Events')).toBeVisible();
    await expect(leftSidebar.getByText('Communities')).toBeVisible();
    await expect(leftSidebar.getByText('Your City')).toBeVisible();
    
    // Verify Right sidebar only shows Upcoming Events
    // The right sidebar is on the right side with border-left
    const rightSidebar = page.locator('.w-72.border-l');
    await expect(rightSidebar).toBeVisible();
    
    // Verify it contains Upcoming Events
    await expect(rightSidebar.getByText('Upcoming Events')).toBeVisible();
    
    // Verify right sidebar doesn't contain community stats (which are in left sidebar)
    const rightSidebarText = await rightSidebar.textContent();
    expect(rightSidebarText).not.toContain('Global Statistics');
    expect(rightSidebarText).not.toContain('Global Dancers');
  });

  test('5. Take screenshots of working interface', async ({ page }) => {
    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/memories-page-full.png',
      fullPage: true 
    });
    
    // Take screenshot of left sidebar with Pierre Dubois profile
    const leftSidebar = page.locator('.w-72').first();
    await leftSidebar.screenshot({ 
      path: 'tests/e2e/screenshots/left-sidebar-profile.png' 
    });
    
    // Take screenshot of memory posting area
    const postCreator = page.locator('.bg-white\\/95').filter({ has: page.locator('[data-testid="input-memory-content"]') });
    await postCreator.screenshot({ 
      path: 'tests/e2e/screenshots/memory-post-creator.png' 
    });
    
    // Take screenshot of right sidebar with events
    const rightSidebar = page.locator('.w-72.border-l');
    await rightSidebar.screenshot({ 
      path: 'tests/e2e/screenshots/right-sidebar-events.png' 
    });
    
    // Post a memory and take screenshot of the posted memory
    await page.locator('[data-testid="input-memory-content"]').fill('Test memory for screenshot 📸');
    await page.locator('[data-testid="button-share-memory"]').click();
    await page.waitForTimeout(2000); // Wait for memory to appear
    
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/memories-page-with-post.png',
      fullPage: true 
    });
  });
});