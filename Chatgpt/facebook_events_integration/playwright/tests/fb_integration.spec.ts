import { test, expect } from '@playwright/test';

test('Facebook connect starts OAuth', async ({ page }) => {
  await page.goto('/events/import/facebook');
  await page.click('text=Connect Facebook');
  await page.waitForURL(/facebook\.com\/.*dialog\/oauth/);
});
