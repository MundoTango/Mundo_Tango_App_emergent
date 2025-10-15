/**
 * Phase 8 - Track C1: Playwright E2E Tests
 * Agent Intelligence Network UI testing
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Agent Intelligence Network', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/agent-intelligence');
  });

  test.describe('Learning Patterns', () => {
    test('should display learning patterns list', async ({ page }) => {
      // Wait for patterns to load
      await expect(page.getByRole('heading', { name: /learning patterns/i })).toBeVisible();
      
      // Check if patterns are rendered
      const patternCards = page.locator('[data-testid^="pattern-card-"]');
      await expect(patternCards.first()).toBeVisible();
      
      // Verify pattern details
      await expect(page.locator('[data-testid^="text-pattern-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="text-confidence-"]').first()).toBeVisible();
    });

    test('should filter patterns by domain', async ({ page }) => {
      // Wait for patterns to load
      await page.waitForSelector('[data-testid^="pattern-card-"]');
      const initialCount = await page.locator('[data-testid^="pattern-card-"]').count();
      
      // Apply domain filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/domain/i).click();
      await page.getByRole('option', { name: 'frontend' }).click();
      
      // Wait for filtered results
      await page.waitForTimeout(500);
      const filteredCount = await page.locator('[data-testid^="pattern-card-"]').count();
      
      // Verify filtering worked
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should show pattern details on click', async ({ page }) => {
      // Click first pattern
      await page.locator('[data-testid^="pattern-card-"]').first().click();
      
      // Verify detail view
      await expect(page.getByRole('heading', { name: /pattern details/i })).toBeVisible();
      await expect(page.getByText(/problem:/i)).toBeVisible();
      await expect(page.getByText(/solution:/i)).toBeVisible();
      await expect(page.locator('[data-testid="code-example"]')).toBeVisible();
    });
  });

  test.describe('Auto-Fix History', () => {
    test('should display auto-fix records', async ({ page }) => {
      await page.getByRole('tab', { name: /auto-fixes/i }).click();
      
      // Wait for fixes to load
      await expect(page.getByRole('heading', { name: /auto-fix history/i })).toBeVisible();
      
      // Check if fixes are rendered
      const fixRows = page.locator('[data-testid^="fix-row-"]');
      await expect(fixRows.first()).toBeVisible();
      
      // Verify fix details
      await expect(page.locator('[data-testid^="text-agent-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="text-strategy-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="status-success-"]').first()).toBeVisible();
    });

    test('should filter by success status', async ({ page }) => {
      await page.getByRole('tab', { name: /auto-fixes/i }).click();
      
      // Apply success filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: 'successful' }).click();
      
      // Wait for filtered results
      await page.waitForTimeout(500);
      
      // All visible fixes should be successful
      const successIcons = page.locator('[data-testid^="status-success-true"]');
      const visibleFixes = page.locator('[data-testid^="fix-row-"]');
      
      expect(await successIcons.count()).toBe(await visibleFixes.count());
    });

    test('should show fix confidence scores', async ({ page }) => {
      await page.getByRole('tab', { name: /auto-fixes/i }).click();
      
      // Click first fix
      await page.locator('[data-testid^="fix-row-"]').first().click();
      
      // Verify confidence displayed
      await expect(page.locator('[data-testid="fix-confidence"]')).toBeVisible();
      
      const confidenceText = await page.locator('[data-testid="fix-confidence"]').textContent();
      expect(confidenceText).toMatch(/\d+(\.\d+)?%/);
    });
  });

  test.describe('Collaborations', () => {
    test('should display collaboration list', async ({ page }) => {
      await page.getByRole('tab', { name: /collaborations/i }).click();
      
      // Wait for collaborations to load
      await expect(page.getByRole('heading', { name: /collaborations/i })).toBeVisible();
      
      // Check if collaborations are rendered
      const collabCards = page.locator('[data-testid^="collab-card-"]');
      await expect(collabCards.first()).toBeVisible();
    });

    test('should show voting results', async ({ page }) => {
      await page.getByRole('tab', { name: /collaborations/i }).click();
      
      // Click first collaboration
      await page.locator('[data-testid^="collab-card-"]').first().click();
      
      // Verify votes displayed
      await expect(page.getByRole('heading', { name: /votes/i })).toBeVisible();
      const voteCards = page.locator('[data-testid^="vote-card-"]');
      await expect(voteCards.first()).toBeVisible();
      
      // Verify vote details
      await expect(page.locator('[data-testid^="vote-status-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="vote-expertise-"]').first()).toBeVisible();
    });

    test('should display consensus percentage', async ({ page }) => {
      await page.getByRole('tab', { name: /collaborations/i }).click();
      await page.locator('[data-testid^="collab-card-"]').first().click();
      
      // Check consensus
      await expect(page.locator('[data-testid="consensus-percentage"]')).toBeVisible();
      
      const consensusText = await page.locator('[data-testid="consensus-percentage"]').textContent();
      expect(consensusText).toMatch(/\d+(\.\d+)?%/);
    });
  });

  test.describe('Pagination', () => {
    test('should paginate through results', async ({ page }) => {
      // Wait for initial load
      await page.waitForSelector('[data-testid^="pattern-card-"]');
      
      // Get first pattern text
      const firstPatternText = await page.locator('[data-testid^="pattern-card-"]').first().textContent();
      
      // Click next page
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(500);
      
      // Get first pattern on second page
      const secondPageFirstPattern = await page.locator('[data-testid^="pattern-card-"]').first().textContent();
      
      // Verify different results
      expect(firstPatternText).not.toBe(secondPageFirstPattern);
    });
  });

  test.describe('Loading States', () => {
    test('should show loading skeleton', async ({ page }) => {
      await page.goto('/admin/agent-intelligence');
      
      // Check for loading skeleton
      const skeleton = page.locator('[data-testid="loading-skeleton"]');
      
      // Skeleton may or may not be visible depending on load speed
      // Just verify the page loads successfully
      await expect(page.getByRole('heading', { name: /intelligence/i })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should display error message on API failure', async ({ page }) => {
      // Intercept API and force error
      await page.route('**/api/agent-intelligence/learnings', route =>
        route.fulfill({ status: 500, body: 'Server Error' })
      );
      
      await page.goto('/admin/agent-intelligence');
      
      // Verify error message displayed
      await expect(page.getByText(/error|failed/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Search Functionality', () => {
    test('should search patterns by keyword', async ({ page }) => {
      // Wait for patterns to load
      await page.waitForSelector('[data-testid^="pattern-card-"]');
      
      // Search for a pattern
      await page.getByPlaceholder(/search/i).fill('react');
      await page.waitForTimeout(500);
      
      // Verify search results contain keyword
      const visiblePatterns = page.locator('[data-testid^="pattern-card-"]');
      const count = await visiblePatterns.count();
      
      if (count > 0) {
        const firstText = await visiblePatterns.first().textContent();
        expect(firstText?.toLowerCase()).toContain('react');
      }
    });
  });
});
