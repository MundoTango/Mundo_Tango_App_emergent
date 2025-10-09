import { test, expect } from '@playwright/test';
test('Admin Jobs page renders', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('Mundo Tango — Jobs')).toBeVisible();
});