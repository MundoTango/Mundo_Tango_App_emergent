/**
 * ESA LIFE CEO 61×21 - Authentication & Memory Visibility Tests
 * Tests the core auth flow and memory visibility enforcement across user contexts
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const TEST_USERS = {
  owner: {
    email: process.env.OWNER_EMAIL || 'owner@mundotango.com',
    password: process.env.OWNER_PW || 'testpass123'
  },
  friend: {
    email: process.env.FRIEND_EMAIL || 'friend@mundotango.com',
    password: process.env.FRIEND_PW || 'testpass123'
  },
  stranger: {
    email: process.env.STRANGER_EMAIL || 'stranger@mundotango.com',
    password: process.env.STRANGER_PW || 'testpass123'
  }
};

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed/, { timeout: 10000 });
}

test.describe('Authentication & Memory Visibility', () => {
  test('Auth → Create Memory → Visibility enforced (public/mutual/private)', async ({ browser }) => {
    // Owner creates memories with different visibility
    const ownerCtx = await browser.newContext();
    const owner = await ownerCtx.newPage();
    
    await loginUser(owner, TEST_USERS.owner.email, TEST_USERS.owner.password);
    
    // Create public memory
    await owner.goto('/memories');
    await owner.getByTestId('button-create-memory').click();
    await owner.getByTestId('input-memory-content').fill('Public memory - everyone can see this #public');
    await owner.getByTestId('select-visibility').selectOption('public');
    await owner.getByTestId('button-submit-memory').click();
    await expect(owner.getByText('Memory shared successfully')).toBeVisible();
    
    // Create mutual memory (friends only)
    await owner.getByTestId('button-create-memory').click();
    await owner.getByTestId('input-memory-content').fill('Mutual memory - only friends can see #friends');
    await owner.getByTestId('select-visibility').selectOption('mutual');
    await owner.getByTestId('button-submit-memory').click();
    await expect(owner.getByText('Memory shared successfully')).toBeVisible();
    
    // Create private memory
    await owner.getByTestId('button-create-memory').click();
    await owner.getByTestId('input-memory-content').fill('Private memory - only I can see #private');
    await owner.getByTestId('select-visibility').selectOption('private');
    await owner.getByTestId('button-submit-memory').click();
    await expect(owner.getByText('Memory shared successfully')).toBeVisible();
    
    // Friend user checks visibility
    const friendCtx = await browser.newContext();
    const friend = await friendCtx.newPage();
    await loginUser(friend, TEST_USERS.friend.email, TEST_USERS.friend.password);
    
    await friend.goto('/memories');
    await expect(friend.getByText('Public memory - everyone can see this')).toBeVisible();
    await expect(friend.getByText('Mutual memory - only friends can see')).toBeVisible();
    await expect(friend.getByText('Private memory - only I can see')).toHaveCount(0);
    
    // Stranger user checks visibility
    const strangerCtx = await browser.newContext();
    const stranger = await strangerCtx.newPage();
    await loginUser(stranger, TEST_USERS.stranger.email, TEST_USERS.stranger.password);
    
    await stranger.goto('/memories');
    await expect(stranger.getByText('Public memory - everyone can see this')).toBeVisible();
    await expect(stranger.getByText('Mutual memory - only friends can see')).toHaveCount(0);
    await expect(stranger.getByText('Private memory - only I can see')).toHaveCount(0);
    
    // Cleanup
    await ownerCtx.close();
    await friendCtx.close();
    await strangerCtx.close();
  });

  test('Failed login shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('input-email').fill('invalid@email.com');
    await page.getByTestId('input-password').fill('wrongpassword');
    await page.getByTestId('button-submit').click();
    
    await expect(page.getByText(/invalid credentials|wrong password|user not found/i)).toBeVisible();
  });

  test('Session expiry redirects to login', async ({ page }) => {
    // Simulate expired session by clearing cookies
    await page.goto('/memories');
    await page.context().clearCookies();
    await page.reload();
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});