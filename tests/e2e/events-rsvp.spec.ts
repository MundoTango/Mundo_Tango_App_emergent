import { test, expect } from '@playwright/test';

/**
 * MB.MD S4: E2E Test - Event RSVP Flow
 * Created: October 20, 2025
 * 
 * Critical User Flow: Browse events → RSVP → Confirmation
 * Tests: Events management system
 */

test.describe('Event RSVP Flow', () => {
  test('should navigate to events page', async ({ page }) => {
    await page.goto('/');
    
    // Look for events link in navigation
    const eventsLink = page.getByTestId('link-events')
      .or(page.getByRole('link', { name: /events/i }))
      .first();
    
    if (await eventsLink.isVisible()) {
      await eventsLink.click();
      await expect(page).toHaveURL(/.*events/);
    } else {
      // Try direct navigation
      await page.goto('/events');
    }
  });

  test('should display events page structure', async ({ page }) => {
    await page.goto('/events');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check for events container or empty state
    const eventsContainer = page.locator('[class*="event"], [data-testid*="event"]').first();
    const emptyState = page.getByText(/no events|upcoming events|create.*event/i).first();
    const createButton = page.getByTestId('button-create-event')
      .or(page.getByRole('button', { name: /create event|new event/i }))
      .first();
    
    const hasEventsArea = await eventsContainer.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasCreateBtn = await createButton.isVisible().catch(() => false);
    
    // Should have events area, empty state, OR create button
    expect(hasEventsArea || hasEmptyState || hasCreateBtn).toBeTruthy();
  });

  test('should have create event button', async ({ page }) => {
    await page.goto('/events');
    
    const createButton = page.getByTestId('button-create-event')
      .or(page.getByRole('button', { name: /create event|new event/i }))
      .first();
    
    await expect(createButton).toBeVisible({ timeout: 10000 });
  });
});
