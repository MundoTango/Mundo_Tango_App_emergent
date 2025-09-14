/**
 * ESA LIFE CEO 61x21 - User Journey E2E Tests
 * Comprehensive testing for complete user flows
 */

import { test, expect } from '@playwright/test';

// Test context setup
const baseURL = process.env.BASE_URL || 'http://localhost:5000';

test.describe('Complete User Journey - New User to Active Member', () => {
  const testUser = {
    name: 'Journey Test User',
    email: `journey.test.${Date.now()}@example.com`,
    password: 'SecurePass123!',
    username: `journeyuser${Date.now()}`,
    bio: 'Testing the complete user journey',
    location: 'Buenos Aires, Argentina'
  };

  test('Complete journey from registration to creating content', async ({ page }) => {
    // Step 1: Registration
    await test.step('Register new user', async () => {
      await page.goto('/auth/register');
      
      await page.fill('input[data-testid="input-name"]', testUser.name);
      await page.fill('input[data-testid="input-username"]', testUser.username);
      await page.fill('input[data-testid="input-email"]', testUser.email);
      await page.fill('input[data-testid="input-password"]', testUser.password);
      await page.fill('input[data-testid="input-password-confirm"]', testUser.password);
      
      await page.click('input[data-testid="checkbox-terms"]');
      await page.click('button[data-testid="button-submit"]');
      
      await page.waitForURL(/\/(onboarding|dashboard)/);
    });

    // Step 2: Complete Onboarding
    await test.step('Complete onboarding', async () => {
      // Profile setup
      await page.fill('textarea[data-testid="input-bio"]', testUser.bio);
      await page.fill('input[data-testid="input-location"]', testUser.location);
      
      // Select interests
      await page.click('[data-testid="interest-technology"]');
      await page.click('[data-testid="interest-travel"]');
      await page.click('[data-testid="interest-fitness"]');
      
      // Upload avatar (if available)
      const fileInput = page.locator('input[type="file"][data-testid="input-avatar"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles('./tests/fixtures/avatar.jpg');
      }
      
      await page.click('button[data-testid="button-continue"]');
      
      // Wait for dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome');
    });

    // Step 3: Explore Dashboard
    await test.step('Explore dashboard', async () => {
      // Check main dashboard elements
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible();
      
      // Check navigation menu
      await expect(page.locator('[data-testid="nav-timeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-events"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-community"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-messages"]')).toBeVisible();
    });

    // Step 4: Create a Post/Memory
    await test.step('Create a post', async () => {
      await page.click('[data-testid="button-create-post"]');
      
      // Fill post form
      const postContent = 'My first post on Mundo Tango! Excited to be here 🎉';
      await page.fill('[data-testid="input-post-content"]', postContent);
      
      // Add image if available
      const postImageInput = page.locator('input[type="file"][data-testid="input-post-image"]');
      if (await postImageInput.isVisible()) {
        await postImageInput.setInputFiles('./tests/fixtures/post-image.jpg');
      }
      
      // Add tags
      await page.fill('[data-testid="input-tags"]', 'introduction, tango, community');
      
      // Select privacy
      await page.selectOption('[data-testid="select-privacy"]', 'public');
      
      // Submit post
      await page.click('[data-testid="button-publish-post"]');
      
      // Verify post appears in timeline
      await page.waitForSelector(`[data-testid="post-content"]:has-text("${postContent}")`);
    });

    // Step 5: Browse and Join Events
    await test.step('Browse and join events', async () => {
      await page.click('[data-testid="nav-events"]');
      await page.waitForURL('/events');
      
      // Filter events by location
      await page.selectOption('[data-testid="filter-location"]', 'Buenos Aires');
      
      // Find and click on first event
      const firstEvent = page.locator('[data-testid^="event-card-"]').first();
      await firstEvent.click();
      
      // View event details
      await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="event-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="event-date"]')).toBeVisible();
      
      // RSVP to event
      await page.click('[data-testid="button-rsvp"]');
      await expect(page.locator('[data-testid="rsvp-status"]')).toContainText('Going');
    });

    // Step 6: Interact with Community
    await test.step('Interact with community', async () => {
      await page.click('[data-testid="nav-community"]');
      await page.waitForURL('/community');
      
      // Find a user to follow
      const userCard = page.locator('[data-testid^="user-card-"]').first();
      await userCard.locator('[data-testid="button-follow"]').click();
      
      // Like a post
      const post = page.locator('[data-testid^="post-"]').first();
      await post.locator('[data-testid="button-like"]').click();
      
      // Comment on a post
      await post.locator('[data-testid="button-comment"]').click();
      await page.fill('[data-testid="input-comment"]', 'Great post! Looking forward to connecting.');
      await page.click('[data-testid="button-submit-comment"]');
      
      // Verify interaction
      await expect(post.locator('[data-testid="like-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="comment-content"]')).toContainText('Great post');
    });

    // Step 7: Send a Message
    await test.step('Send a message', async () => {
      await page.click('[data-testid="nav-messages"]');
      await page.waitForURL('/messages');
      
      // Start new conversation
      await page.click('[data-testid="button-new-message"]');
      
      // Select recipient
      await page.fill('[data-testid="input-recipient"]', 'admin');
      await page.click('[data-testid="recipient-admin"]');
      
      // Type and send message
      const messageText = 'Hello! I just joined the community.';
      await page.fill('[data-testid="input-message"]', messageText);
      await page.click('[data-testid="button-send"]');
      
      // Verify message sent
      await expect(page.locator('[data-testid="message-content"]')).toContainText(messageText);
    });

    // Step 8: Update Profile
    await test.step('Update profile', async () => {
      await page.click('[data-testid="user-avatar"]');
      await page.click('[data-testid="menu-profile"]');
      await page.waitForURL('/profile');
      
      // Update bio
      const updatedBio = 'Experienced tango dancer and community enthusiast';
      await page.fill('textarea[data-testid="input-bio"]', updatedBio);
      
      // Add social links
      await page.fill('[data-testid="input-instagram"]', 'instagram.com/testuser');
      await page.fill('[data-testid="input-twitter"]', 'twitter.com/testuser');
      
      // Save changes
      await page.click('[data-testid="button-save-profile"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Profile updated');
    });

    // Step 9: View Timeline
    await test.step('View timeline with activities', async () => {
      await page.click('[data-testid="nav-timeline"]');
      await page.waitForURL('/timeline');
      
      // Verify timeline shows recent activities
      await expect(page.locator('[data-testid="timeline-item"]')).toHaveCount(5, { timeout: 10000 });
      
      // Check different activity types
      await expect(page.locator('[data-testid="activity-post"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-event"]')).toBeVisible();
    });

    // Step 10: Test Search Functionality
    await test.step('Use search functionality', async () => {
      await page.fill('[data-testid="input-search"]', 'tango');
      await page.click('[data-testid="button-search"]');
      
      // Check search results
      await page.waitForSelector('[data-testid="search-results"]');
      await expect(page.locator('[data-testid="search-result-posts"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-result-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-result-events"]')).toBeVisible();
    });
  });
});

test.describe('Mobile User Journey', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Mobile-specific user flow', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Navigate using mobile menu
    await page.click('[data-testid="mobile-nav-events"]');
    await page.waitForURL('/events');
    
    // Check mobile-optimized layout
    const eventCards = page.locator('[data-testid^="event-card-"]');
    await expect(eventCards.first()).toBeVisible();
    
    // Test swipe gestures (if implemented)
    const firstCard = eventCards.first();
    const box = await firstCard.boundingBox();
    if (box) {
      // Simulate swipe
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 10, box.y + box.height / 2);
      await page.mouse.up();
    }
  });
});

test.describe('Performance User Journey', () => {
  test('Page load performance', async ({ page }) => {
    const navigationPromise = page.waitForNavigation();
    
    await page.goto('/');
    await navigationPromise;
    
    // Measure page load metrics
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    // Performance thresholds
    expect(performanceTiming.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(performanceTiming.loadComplete).toBeLessThan(5000); // 5 seconds
  });

  test('Navigation performance', async ({ page }) => {
    await page.goto('/dashboard');
    
    const startTime = Date.now();
    await page.click('[data-testid="nav-events"]');
    await page.waitForURL('/events');
    const navigationTime = Date.now() - startTime;
    
    expect(navigationTime).toBeLessThan(1000); // 1 second
  });
});

test.describe('Error Recovery Journey', () => {
  test('Handles network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    
    await page.goto('/');
    
    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Restore connection
    await context.setOffline(false);
    
    // Should recover
    await page.reload();
    await expect(page.locator('[data-testid="offline-message"]')).not.toBeVisible();
  });

  test('Handles form validation errors', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Submit empty form
    await page.click('button[data-testid="button-submit"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="error-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-password"]')).toBeVisible();
    
    // Fix errors one by one
    await page.fill('input[data-testid="input-name"]', 'Test User');
    await expect(page.locator('[data-testid="error-name"]')).not.toBeVisible();
    
    await page.fill('input[data-testid="input-email"]', 'test@example.com');
    await expect(page.locator('[data-testid="error-email"]')).not.toBeVisible();
  });
});

test.describe('Accessibility Journey', () => {
  test('Keyboard-only navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate using only keyboard
    await page.keyboard.press('Tab'); // Focus first element
    await page.keyboard.press('Tab'); // Move to login button
    await page.keyboard.press('Enter'); // Click login
    
    await page.waitForURL('/auth/login');
    
    // Fill form with keyboard
    await page.keyboard.press('Tab'); // Focus email field
    await page.keyboard.type('test@example.com');
    
    await page.keyboard.press('Tab'); // Focus password field
    await page.keyboard.type('password123');
    
    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Submit form
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    
    // Check ARIA labels
    const mainNav = page.locator('nav[role="navigation"]');
    await expect(mainNav).toHaveAttribute('aria-label');
    
    // Check heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1); // Only one h1 per page
    
    // Check alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });
});