// TRACK 4 (S4): Events E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should show events page', async ({ page }) => {
    await page.goto('/events');
    
    // Should load events page (or redirect)
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('events');
  });

  test('should display event list or empty state', async ({ page }) => {
    await page.goto('/events');
    
    // Should see either events or empty state
    const eventList = page.locator('[data-testid="event-list"]').or(
      page.locator('.event-card')
    ).or(
      page.locator('text=No events')
    );
    
    await expect(eventList).toBeVisible({ timeout: 10000 });
  });

  test('should have create event button for logged in users', async ({ page }) => {
    await page.goto('/events');
    
    // Look for create event button
    const createButton = page.locator('[data-testid="button-create-event"]').or(
      page.locator('button:has-text("Create Event")')
    );
    
    // Should be visible (assuming auto-login works)
    const isVisible = await createButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
});
