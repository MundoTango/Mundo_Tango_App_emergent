/**
 * ESA LIFE CEO 61×21 - Comprehensive Groups System Tests
 * Tests unified groups architecture (city and professional groups)
 * 
 * Components Tested:
 * - GroupDetailPageMT: Unified group detail page for all types
 * - EnhancedCityGroupCard: City group card components
 * - Join/Leave functionality
 * - Conditional Housing/Recommendations tabs (city groups only)
 * - Member filtering (residents/visitors, members/non-members)
 * 
 * Test Coverage:
 * - Group navigation and routing
 * - Join/leave group functionality
 * - Conditional tab rendering by group type
 * - Post filtering within groups
 * - Member management
 * - Housing listings (city groups only)
 * - Recommendations (city groups only)
 */

import { test, expect, Page } from '@playwright/test';

// Helper: Login function
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-login').click();
  
  await page.waitForURL(/\/feed|\/dashboard/, { timeout: 10000 });
}

test.describe('Groups System - City Groups', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should display city groups on /groups page', async ({ page }) => {
    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
    
    // Check for city groups section
    const cityGroupsSection = page.locator('text=City Communities');
    await expect(cityGroupsSection).toBeVisible({ timeout: 5000 });
    
    // Should have at least one city group card
    const cityGroupCards = page.locator('[data-testid^="card-city-group-"]');
    await expect(cityGroupCards.first()).toBeVisible({ timeout: 3000 });
  });

  test('should navigate to city group detail page by slug', async ({ page }) => {
    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
    
    // Click first city group card
    const firstCityGroup = page.locator('[data-testid^="card-city-group-"]').first();
    await firstCityGroup.click();
    
    // Should navigate to group detail page
    await page.waitForURL(/\/community\/groups\/[^\/]+/, { timeout: 5000 });
    
    // Page should load with group name
    const groupName = page.locator('h1').first();
    await expect(groupName).toBeVisible();
  });

  test('should show all 7 tabs for city groups', async ({ page }) => {
    // Navigate to Buenos Aires group (known city group)
    await page.goto('/community/groups/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // Check for all 7 tabs
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Posts')).toBeVisible();
    await expect(page.getByText('Events')).toBeVisible();
    await expect(page.getByText('Members')).toBeVisible();
    await expect(page.getByText('Community Hub')).toBeVisible();
    
    // City groups should have Housing and Recommendations
    await expect(page.getByText('Housing')).toBeVisible();
    await expect(page.getByText('Recommendations')).toBeVisible();
  });

  test('should allow user to join city group', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // Look for join button (if not already member)
    const joinButton = page.getByTestId('button-join-group');
    
    if (await joinButton.isVisible()) {
      await joinButton.click();
      
      // Should show success message
      await expect(page.getByText(/joined|welcome/i)).toBeVisible({ timeout: 3000 });
      
      // Button should change to "Leave Group"
      await expect(page.getByTestId('button-leave-group')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should allow user to leave city group', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // First join if not already a member
    const joinButton = page.getByTestId('button-join-group');
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(1500);
    }
    
    // Now leave
    const leaveButton = page.getByTestId('button-leave-group');
    await expect(leaveButton).toBeVisible({ timeout: 3000 });
    await leaveButton.click();
    
    // Should show confirmation
    await expect(page.getByText(/left|goodbye/i)).toBeVisible({ timeout: 3000 });
    
    // Button should change back to "Join Group"
    await expect(page.getByTestId('button-join-group')).toBeVisible({ timeout: 2000 });
  });

  test('should show Housing tab content for city groups', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=housing');
    await page.waitForLoadState('networkidle');
    
    // Housing tab should be selected
    const housingTab = page.getByText('Housing');
    await expect(housingTab).toBeVisible();
    
    // Should show housing listings or empty state
    const housingContent = page.locator('[data-testid*="housing"]').first();
    await expect(housingContent).toBeVisible({ timeout: 5000 });
  });

  test('should show Recommendations tab content for city groups', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=recommendations');
    await page.waitForLoadState('networkidle');
    
    // Recommendations tab should be selected
    const recommendationsTab = page.getByText('Recommendations');
    await expect(recommendationsTab).toBeVisible();
    
    // Should show recommendations or empty state
    const recommendationsContent = page.locator('text=/recommendation|suggest|tip/i').first();
    await expect(recommendationsContent).toBeVisible({ timeout: 5000 });
  });

  test('should filter posts by residents/visitors', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=posts');
    await page.waitForLoadState('networkidle');
    
    // Should have filter buttons
    const residentsFilter = page.getByTestId('filter-residents');
    const visitorsFilter = page.getByTestId('filter-visitors');
    
    await expect(residentsFilter).toBeVisible();
    await expect(visitorsFilter).toBeVisible();
    
    // Click residents filter
    await residentsFilter.click();
    await page.waitForTimeout(1000);
    
    // URL should update with filter parameter
    expect(page.url()).toContain('filter=residents');
  });
});

test.describe('Groups System - Professional Groups', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should display professional groups on /groups page', async ({ page }) => {
    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
    
    // Check for professional groups section
    const professionalGroupsSection = page.locator('text=/Professional|DJ|Instructor|Organizer/i');
    await expect(professionalGroupsSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to professional group detail page', async ({ page }) => {
    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
    
    // Find and click on a professional group (e.g., DJs)
    const djGroup = page.locator('text=/DJ|instructor|organizer/i').first();
    if (await djGroup.isVisible()) {
      await djGroup.click();
      await page.waitForURL(/\/community\/groups\/[^\/]+/, { timeout: 5000 });
    }
  });

  test('should show only 5 tabs for professional groups (NO Housing/Recommendations)', async ({ page }) => {
    // Navigate to DJ group (known professional group)
    await page.goto('/community/groups/djs');
    await page.waitForLoadState('networkidle');
    
    // Check for 5 standard tabs
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Posts')).toBeVisible();
    await expect(page.getByText('Events')).toBeVisible();
    await expect(page.getByText('Members')).toBeVisible();
    await expect(page.getByText('Community Hub')).toBeVisible();
    
    // Professional groups should NOT have Housing or Recommendations
    await expect(page.getByText('Housing')).not.toBeVisible();
    await expect(page.getByText('Recommendations')).not.toBeVisible();
  });

  test('should allow user to join professional group', async ({ page }) => {
    await page.goto('/community/groups/djs');
    await page.waitForLoadState('networkidle');
    
    const joinButton = page.getByTestId('button-join-group');
    
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await expect(page.getByText(/joined|welcome/i)).toBeVisible({ timeout: 3000 });
      await expect(page.getByTestId('button-leave-group')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should filter posts by members/non-members in professional groups', async ({ page }) => {
    await page.goto('/community/groups/instructors?tab=posts');
    await page.waitForLoadState('networkidle');
    
    // Should have member filter buttons
    const membersFilter = page.getByTestId('filter-members');
    const nonMembersFilter = page.getByTestId('filter-non-members');
    
    await expect(membersFilter).toBeVisible();
    await expect(nonMembersFilter).toBeVisible();
    
    // Click members filter
    await membersFilter.click();
    await page.waitForTimeout(1000);
    
    // URL should update
    expect(page.url()).toContain('filter=members');
  });
});

test.describe('Groups System - Posts Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should display group posts on Posts tab', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=posts');
    await page.waitForLoadState('networkidle');
    
    // Should show posts or empty state
    const postsContainer = page.locator('[data-testid^="post-card-"]').first();
    
    // Either posts are visible or empty state message
    const hasContent = await postsContainer.isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/no posts|create.*post/i).isVisible().catch(() => false);
    
    expect(hasContent || hasEmptyState).toBe(true);
  });

  test('should allow creating a post in group', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=posts');
    await page.waitForLoadState('networkidle');
    
    // Look for create post button or text area
    const createPostButton = page.getByTestId('button-create-post');
    if (await createPostButton.isVisible()) {
      await createPostButton.click();
      await page.waitForTimeout(500);
      
      // Should show post creation interface
      const postInput = page.getByTestId('input-post-content');
      await expect(postInput).toBeVisible({ timeout: 3000 });
    }
  });

  test('should load more posts when clicking Load More', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=posts');
    await page.waitForLoadState('networkidle');
    
    // Count initial posts
    const initialPosts = await page.locator('[data-testid^="post-card-"]').count();
    
    // Look for load more button
    const loadMoreButton = page.getByTestId('button-load-more-posts');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(1500);
      
      // Should have more posts
      const afterLoadPosts = await page.locator('[data-testid^="post-card-"]').count();
      expect(afterLoadPosts).toBeGreaterThanOrEqual(initialPosts);
    }
  });
});

test.describe('Groups System - Members Tab', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should display group members', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=members');
    await page.waitForLoadState('networkidle');
    
    // Should show members list
    const membersContainer = page.locator('[data-testid*="member"]').first();
    await expect(membersContainer).toBeVisible({ timeout: 5000 });
  });

  test('should show member count in group header', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // Should show member count
    const memberCount = page.locator('text=/\\d+ member/i');
    await expect(memberCount).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Groups System - Events Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should display group events', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=events');
    await page.waitForLoadState('networkidle');
    
    // Should show events or empty state
    const eventsContent = page.locator('[data-testid*="event"]').first();
    const hasEvents = await eventsContent.isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/no events|upcoming/i).isVisible().catch(() => false);
    
    expect(hasEvents || hasEmptyState).toBe(true);
  });
});

test.describe('Groups System - Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should update member count in real-time when user joins', async ({ page }) => {
    await page.goto('/community/groups/madrid');
    await page.waitForLoadState('networkidle');
    
    // Get initial member count
    const memberCountElement = page.locator('text=/\\d+ member/i');
    const initialText = await memberCountElement.textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    // Join group
    const joinButton = page.getByTestId('button-join-group');
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(1500);
      
      // Member count should increase
      const updatedText = await memberCountElement.textContent();
      const updatedCount = parseInt(updatedText?.match(/\d+/)?.[0] || '0');
      
      expect(updatedCount).toBeGreaterThan(initialCount);
    }
  });
});

test.describe('Groups System - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should handle non-existent group gracefully', async ({ page }) => {
    await page.goto('/community/groups/non-existent-group-xyz');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or error message
    const errorMessage = page.locator('text=/not found|doesn\'t exist|404/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle network errors when joining group', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // Block API requests
    await page.route('**/api/groups/*/join', route => route.abort());
    
    // Try to join
    const joinButton = page.getByTestId('button-join-group');
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await page.waitForTimeout(1000);
      
      // Should show error message
      await expect(page.getByText(/error|failed|try again/i)).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Groups System - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'testuser@test.com', 'password123');
  });

  test('should navigate between tabs with URL parameters', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // Click Posts tab
    await page.getByText('Posts').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('tab=posts');
    
    // Click Events tab
    await page.getByText('Events').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('tab=events');
    
    // Click Housing tab
    await page.getByText('Housing').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('tab=housing');
  });

  test('should preserve tab selection on page reload', async ({ page }) => {
    await page.goto('/community/groups/buenos-aires?tab=housing');
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on Housing tab
    expect(page.url()).toContain('tab=housing');
  });
});

console.log('✅ Groups System Comprehensive Test Suite - All tests defined');
