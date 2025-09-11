/**
 * ESA LIFE CEO 61×21 - Search & Discovery Tests
 * Tests search functionality for memories, users, events, and groups with filters
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_USER = {
  email: process.env.TEST_EMAIL || 'test@mundotango.com',
  password: process.env.TEST_PW || 'testpass123'
};

// Helper function to login
async function loginUser(page: Page) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(TEST_USER.email);
  await page.getByTestId('input-password').fill(TEST_USER.password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|search/, { timeout: 10000 });
}

// Helper to perform search
async function performSearch(page: Page, query: string, type?: string) {
  await page.goto('/search');
  await page.getByTestId('input-search-query').fill(query);
  
  if (type) {
    await page.getByTestId('select-search-type').selectOption(type);
  }
  
  // Either press Enter or click search button
  await Promise.race([
    page.getByTestId('input-search-query').press('Enter'),
    page.getByTestId('button-search').click()
  ]);
  
  // Wait for results to load
  await page.waitForLoadState('networkidle');
}

test.describe('Search & Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('Happy: Search memories by keyword', async ({ page }) => {
    await performSearch(page, 'tango');
    
    // Should show search results
    await expect(page.getByTestId('search-results')).toBeVisible();
    await expect(page.getByTestId('text-result-count')).toBeVisible();
    
    // Results should contain the search term
    const results = page.getByTestId('card-search-result');
    const count = await results.count();
    
    if (count > 0) {
      // Check first few results contain search term
      for (let i = 0; i < Math.min(3, count); i++) {
        const resultText = await results.nth(i).textContent();
        expect(resultText?.toLowerCase()).toContain('tango');
      }
      
      // Click on a result
      await results.first().click();
      // Should navigate to the memory/post
      await expect(page).toHaveURL(/memories|posts|feed/);
    } else {
      // No results message should be shown
      await expect(page.getByTestId('text-no-results')).toBeVisible();
    }
  });

  test('Happy: Search with filters (date, location, tags)', async ({ page }) => {
    await page.goto('/search');
    
    // Set search query
    await page.getByTestId('input-search-query').fill('milonga');
    
    // Apply date filter
    await page.getByTestId('button-show-filters').click();
    await expect(page.getByTestId('panel-filters')).toBeVisible();
    
    // Set date range (last month)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    await page.getByTestId('input-date-from').fill(startDate.toISOString().split('T')[0]);
    await page.getByTestId('input-date-to').fill(endDate.toISOString().split('T')[0]);
    
    // Set location filter
    await page.getByTestId('input-location').fill('Buenos Aires');
    
    // Add tags
    await page.getByTestId('input-tags').fill('dance');
    await page.getByTestId('input-tags').press('Enter');
    await page.getByTestId('input-tags').fill('social');
    await page.getByTestId('input-tags').press('Enter');
    
    // Apply filters and search
    await page.getByTestId('button-apply-filters').click();
    
    // Results should be filtered
    await expect(page.getByTestId('search-results')).toBeVisible();
    
    // Check active filters are displayed
    await expect(page.getByTestId('chip-filter-date')).toBeVisible();
    await expect(page.getByTestId('chip-filter-location')).toContainText('Buenos Aires');
    await expect(page.getByTestId('chip-filter-tag-dance')).toBeVisible();
    await expect(page.getByTestId('chip-filter-tag-social')).toBeVisible();
    
    // Clear individual filter
    await page.getByTestId('chip-filter-location').getByTestId('button-remove').click();
    // Results should update
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('chip-filter-location')).toHaveCount(0);
  });

  test('Happy: Search users by name or username', async ({ page }) => {
    await performSearch(page, 'john', 'users');
    
    // Should show user results
    await expect(page.getByTestId('search-results-users')).toBeVisible();
    
    const userCards = page.getByTestId('card-user-result');
    if (await userCards.count() > 0) {
      // Check user card has expected elements
      const firstUser = userCards.first();
      await expect(firstUser.getByTestId('text-username')).toBeVisible();
      await expect(firstUser.getByTestId('img-avatar')).toBeVisible();
      
      // Click to view profile
      await firstUser.getByTestId('button-view-profile').click();
      await expect(page).toHaveURL(/profile|user/);
    }
  });

  test('Happy: Search events by title or venue', async ({ page }) => {
    await performSearch(page, 'Salon Canning', 'events');
    
    // Should show event results
    await expect(page.getByTestId('search-results-events')).toBeVisible();
    
    const eventCards = page.getByTestId('card-event-result');
    if (await eventCards.count() > 0) {
      const firstEvent = eventCards.first();
      
      // Check event details are shown
      await expect(firstEvent.getByTestId('text-event-title')).toBeVisible();
      await expect(firstEvent.getByTestId('text-event-date')).toBeVisible();
      await expect(firstEvent.getByTestId('text-event-venue')).toBeVisible();
      
      // Venue should contain search term
      const venueText = await firstEvent.getByTestId('text-event-venue').textContent();
      expect(venueText?.toLowerCase()).toContain('canning');
      
      // Click to view event
      await firstEvent.click();
      await expect(page).toHaveURL(/events/);
    }
  });

  test('Happy: Search groups by name or description', async ({ page }) => {
    await performSearch(page, 'professional', 'groups');
    
    // Should show group results
    await expect(page.getByTestId('search-results-groups')).toBeVisible();
    
    const groupCards = page.getByTestId('card-group-result');
    if (await groupCards.count() > 0) {
      const firstGroup = groupCards.first();
      
      // Check group details
      await expect(firstGroup.getByTestId('text-group-name')).toBeVisible();
      await expect(firstGroup.getByTestId('text-group-description')).toBeVisible();
      await expect(firstGroup.getByTestId('text-member-count')).toBeVisible();
      
      // Click to view group
      await firstGroup.getByTestId('button-view-group').click();
      await expect(page).toHaveURL(/groups/);
    }
  });

  test('Edge: Search with special characters', async ({ page }) => {
    // Test various special characters
    const specialQueries = [
      '#tango #milonga',
      '@username',
      'tango & dance',
      '"exact phrase"',
      'café',
      '100% tango',
      'email@example.com'
    ];
    
    for (const query of specialQueries) {
      await performSearch(page, query);
      
      // Should not error out
      await expect(page.getByTestId('search-results')).toBeVisible();
      
      // Should either show results or no results message
      const hasResults = await page.getByTestId('card-search-result').count() > 0;
      const hasNoResults = await page.getByTestId('text-no-results').count() > 0;
      expect(hasResults || hasNoResults).toBeTruthy();
    }
  });

  test('Edge: Empty search query', async ({ page }) => {
    await page.goto('/search');
    
    // Try to search with empty query
    await page.getByTestId('input-search-query').fill('');
    await page.getByTestId('button-search').click();
    
    // Should show validation message or recent/popular content
    const hasValidation = await page.getByTestId('text-search-validation').count() > 0;
    const hasRecent = await page.getByTestId('section-recent-content').count() > 0;
    const hasPopular = await page.getByTestId('section-popular-content').count() > 0;
    
    expect(hasValidation || hasRecent || hasPopular).toBeTruthy();
  });

  test('Happy: Search result pagination', async ({ page }) => {
    // Search for common term to get many results
    await performSearch(page, 'tango');
    
    // Check if pagination exists
    const pagination = page.getByTestId('pagination');
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
      
      // Check current page
      await expect(page.getByTestId('text-current-page')).toContainText('1');
      
      // Go to next page
      const nextButton = page.getByTestId('button-next-page');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // Wait for new results
        await page.waitForLoadState('networkidle');
        
        // Check page updated
        await expect(page.getByTestId('text-current-page')).toContainText('2');
        
        // Results should be different
        const firstResultPage2 = await page.getByTestId('card-search-result').first().textContent();
        
        // Go back to first page
        await page.getByTestId('button-prev-page').click();
        await page.waitForLoadState('networkidle');
        
        const firstResultPage1 = await page.getByTestId('card-search-result').first().textContent();
        expect(firstResultPage1).not.toBe(firstResultPage2);
      }
    }
  });

  test('Edge: Very long search query', async ({ page }) => {
    const longQuery = 'tango '.repeat(100); // 600 characters
    
    await page.goto('/search');
    await page.getByTestId('input-search-query').fill(longQuery);
    
    // Input should be truncated or show validation
    const inputValue = await page.getByTestId('input-search-query').inputValue();
    
    // Check if truncated to max length
    if (inputValue.length < longQuery.length) {
      expect(inputValue.length).toBeLessThanOrEqual(255); // Common max length
    }
    
    await page.getByTestId('button-search').click();
    
    // Should handle gracefully
    await expect(page.getByTestId('search-results')).toBeVisible();
  });

  test('Happy: Search suggestions/autocomplete', async ({ page }) => {
    await page.goto('/search');
    
    // Start typing
    await page.getByTestId('input-search-query').fill('tan');
    
    // Wait for suggestions to appear
    await page.waitForTimeout(500); // Debounce delay
    
    const suggestions = page.getByTestId('search-suggestions');
    if (await suggestions.count() > 0) {
      await expect(suggestions).toBeVisible();
      
      // Should show relevant suggestions
      const suggestionItems = page.getByTestId('suggestion-item');
      expect(await suggestionItems.count()).toBeGreaterThan(0);
      
      // Click a suggestion
      await suggestionItems.first().click();
      
      // Should populate search and execute
      const searchValue = await page.getByTestId('input-search-query').inputValue();
      expect(searchValue.length).toBeGreaterThan(3);
      
      await expect(page.getByTestId('search-results')).toBeVisible();
    }
  });

  test('Happy: Recent searches', async ({ page }) => {
    // Perform a few searches
    const searches = ['milonga', 'Buenos Aires', 'tango class'];
    
    for (const query of searches) {
      await performSearch(page, query);
      await page.waitForTimeout(500);
    }
    
    // Go back to search page
    await page.goto('/search');
    
    // Check if recent searches are shown
    const recentSearches = page.getByTestId('section-recent-searches');
    if (await recentSearches.count() > 0) {
      await expect(recentSearches).toBeVisible();
      
      // Should show our recent searches
      for (const query of searches.reverse()) { // Most recent first
        await expect(recentSearches).toContainText(query);
      }
      
      // Click a recent search
      await page.getByTestId(`recent-search-${searches[0]}`).click();
      
      // Should execute the search
      await expect(page.getByTestId('input-search-query')).toHaveValue(searches[0]);
      await expect(page.getByTestId('search-results')).toBeVisible();
      
      // Clear recent searches
      if (await page.getByTestId('button-clear-recent').count() > 0) {
        await page.getByTestId('button-clear-recent').click();
        await expect(recentSearches).toHaveCount(0);
      }
    }
  });

  test('Failure: Search API error handling', async ({ page, context }) => {
    // Block search API
    await context.route('**/api/search**', route => {
      route.abort('failed');
    });
    
    await performSearch(page, 'test query');
    
    // Should show error message
    await expect(page.getByTestId('alert-search-error')).toBeVisible();
    await expect(page.getByTestId('alert-search-error')).toContainText(/error|failed|try again/i);
    
    // Should show retry option
    await expect(page.getByTestId('button-retry-search')).toBeVisible();
    
    // Unblock and retry
    await context.unroute('**/api/search**');
    await page.getByTestId('button-retry-search').click();
    
    // Should work now
    await expect(page.getByTestId('search-results')).toBeVisible();
  });

  test('Edge: Search with no results', async ({ page }) => {
    // Search for something unlikely to exist
    await performSearch(page, 'xyzabc123nonexistent9876');
    
    // Should show no results message
    await expect(page.getByTestId('text-no-results')).toBeVisible();
    await expect(page.getByTestId('text-no-results')).toContainText(/no results found|no matches/i);
    
    // Should show suggestions
    const suggestions = page.getByTestId('section-search-suggestions');
    if (await suggestions.count() > 0) {
      await expect(suggestions).toBeVisible();
      await expect(suggestions).toContainText(/try|suggestions|similar/i);
    }
  });
});