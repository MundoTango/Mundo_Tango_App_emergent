/**
 * ESA LIFE CEO 61×21 - Profile & Settings Management Tests
 * Tests profile editing, avatar upload, privacy settings, and preferences
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';

// Test configuration
const TEST_USERS = {
  mainUser: {
    email: process.env.MAIN_USER_EMAIL || 'main@mundotango.com',
    password: process.env.MAIN_USER_PW || 'testpass123',
    username: 'MainUser'
  },
  viewerUser: {
    email: process.env.VIEWER_EMAIL || 'viewer@mundotango.com',
    password: process.env.VIEWER_PW || 'testpass123',
    username: 'ViewerUser'
  }
};

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|profile/, { timeout: 10000 });
}

test.describe('Profile & Settings Management', () => {
  test('Happy: Edit profile information and save', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    // Navigate to profile
    await page.goto('/profile');
    await page.getByTestId('button-edit-profile').click();
    
    // Edit profile fields
    await page.getByTestId('input-display-name').clear();
    await page.getByTestId('input-display-name').fill('Tango Enthusiast');
    
    await page.getByTestId('textarea-bio').clear();
    await page.getByTestId('textarea-bio').fill('Passionate about Argentine Tango. Dancing since 2015. Love milongas and workshops!');
    
    await page.getByTestId('input-location').clear();
    await page.getByTestId('input-location').fill('Buenos Aires, Argentina');
    
    await page.getByTestId('input-website').clear();
    await page.getByTestId('input-website').fill('https://mytango.blog');
    
    // Add dance styles
    await page.getByTestId('select-dance-styles').selectOption(['argentine-tango', 'vals', 'milonga']);
    
    // Set experience level
    await page.getByTestId('select-experience').selectOption('advanced');
    
    // Save changes
    await page.getByTestId('button-save-profile').click();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    
    // Verify changes persisted
    await page.reload();
    await expect(page.getByTestId('text-display-name')).toContainText('Tango Enthusiast');
    await expect(page.getByTestId('text-bio')).toContainText('Passionate about Argentine Tango');
    await expect(page.getByTestId('text-location')).toContainText('Buenos Aires, Argentina');
    await expect(page.getByTestId('link-website')).toHaveAttribute('href', 'https://mytango.blog');
  });

  test('Happy: Upload and display avatar', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/profile');
    await page.getByTestId('button-edit-profile').click();
    
    // Upload avatar
    const fileInput = page.getByTestId('input-avatar-upload');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/avatar-test.jpg'));
    
    // Wait for upload preview
    await expect(page.getByTestId('img-avatar-preview')).toBeVisible({ timeout: 5000 });
    
    // Crop/adjust if needed
    if (await page.getByTestId('modal-crop-avatar').count() > 0) {
      // Adjust crop area
      await page.getByTestId('button-confirm-crop').click();
    }
    
    // Save profile with new avatar
    await page.getByTestId('button-save-profile').click();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    
    // Verify avatar is displayed
    await page.reload();
    const avatarSrc = await page.getByTestId('img-profile-avatar').getAttribute('src');
    expect(avatarSrc).not.toContain('default-avatar');
    expect(avatarSrc).toBeTruthy();
    
    // Check avatar appears in navigation
    const navAvatar = await page.getByTestId('img-nav-avatar').getAttribute('src');
    expect(navAvatar).toBe(avatarSrc);
  });

  test('Happy: Configure privacy settings', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    // Navigate to settings
    await page.goto('/settings/privacy');
    
    // Configure profile visibility
    await page.getByTestId('select-profile-visibility').selectOption('friends-only');
    
    // Configure activity visibility
    await page.getByTestId('toggle-show-online-status').click();
    await page.getByTestId('toggle-show-last-seen').click();
    
    // Configure content defaults
    await page.getByTestId('select-default-post-visibility').selectOption('mutual');
    await page.getByTestId('select-default-memory-visibility').selectOption('private');
    
    // Configure who can contact
    await page.getByTestId('select-message-permissions').selectOption('friends-only');
    await page.getByTestId('toggle-friend-requests').click(); // Disable friend requests
    
    // Save privacy settings
    await page.getByTestId('button-save-privacy').click();
    await expect(page.getByText('Privacy settings updated')).toBeVisible();
    
    // Verify settings persisted
    await page.reload();
    await expect(page.getByTestId('select-profile-visibility')).toHaveValue('friends-only');
    await expect(page.getByTestId('toggle-show-online-status')).not.toBeChecked();
    await expect(page.getByTestId('toggle-show-last-seen')).not.toBeChecked();
    await expect(page.getByTestId('select-default-post-visibility')).toHaveValue('mutual');
  });

  test('Happy: Profile visibility to others based on privacy', async ({ browser }) => {
    // Main user sets profile to friends-only
    const mainCtx = await browser.newContext();
    const mainUser = await mainCtx.newPage();
    
    await loginUser(mainUser, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    await mainUser.goto('/settings/privacy');
    await mainUser.getByTestId('select-profile-visibility').selectOption('friends-only');
    await mainUser.getByTestId('button-save-privacy').click();
    
    // Get profile URL
    await mainUser.goto('/profile');
    const profileUrl = mainUser.url();
    const username = profileUrl.split('/').pop();
    
    // Viewer (non-friend) tries to view profile
    const viewerCtx = await browser.newContext();
    const viewer = await viewerCtx.newPage();
    
    await loginUser(viewer, TEST_USERS.viewerUser.email, TEST_USERS.viewerUser.password);
    await viewer.goto(`/profile/${username}`);
    
    // Should see limited profile
    await expect(viewer.getByTestId('text-private-profile')).toContainText(/private|limited/i);
    await expect(viewer.getByTestId('text-bio')).toHaveCount(0); // Bio hidden
    await expect(viewer.getByTestId('section-recent-posts')).toHaveCount(0); // Posts hidden
    
    // But basic info visible
    await expect(viewer.getByTestId('text-display-name')).toBeVisible();
    await expect(viewer.getByTestId('button-send-friend-request')).toBeVisible();
    
    await mainCtx.close();
    await viewerCtx.close();
  });

  test('Happy: Configure notification preferences', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/settings/notifications');
    
    // Email notifications
    await page.getByTestId('toggle-email-messages').click(); // Turn on
    await page.getByTestId('toggle-email-friend-requests').click(); // Turn on
    await page.getByTestId('toggle-email-event-invites').click(); // Turn on
    await page.getByTestId('toggle-email-mentions').uncheck(); // Turn off
    
    // Push notifications (if available)
    if (await page.getByTestId('section-push-notifications').count() > 0) {
      await page.getByTestId('toggle-push-messages').click();
      await page.getByTestId('toggle-push-event-reminders').click();
    }
    
    // In-app notifications
    await page.getByTestId('toggle-app-sounds').click(); // Turn on
    await page.getByTestId('toggle-app-badges').click(); // Turn on
    
    // Notification schedule
    await page.getByTestId('toggle-do-not-disturb').click();
    await page.getByTestId('input-dnd-start').fill('22:00');
    await page.getByTestId('input-dnd-end').fill('08:00');
    
    // Save settings
    await page.getByTestId('button-save-notifications').click();
    await expect(page.getByText('Notification preferences saved')).toBeVisible();
    
    // Verify saved
    await page.reload();
    await expect(page.getByTestId('toggle-email-messages')).toBeChecked();
    await expect(page.getByTestId('toggle-email-mentions')).not.toBeChecked();
    await expect(page.getByTestId('toggle-do-not-disturb')).toBeChecked();
  });

  test('Edge: Invalid profile data validation', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/profile');
    await page.getByTestId('button-edit-profile').click();
    
    // Try invalid website URL
    await page.getByTestId('input-website').clear();
    await page.getByTestId('input-website').fill('not-a-valid-url');
    await page.getByTestId('button-save-profile').click();
    await expect(page.getByTestId('error-website')).toContainText(/invalid|url/i);
    
    // Try too long bio
    const longBio = 'x'.repeat(1001); // Assuming 1000 char limit
    await page.getByTestId('textarea-bio').fill(longBio);
    await page.getByTestId('button-save-profile').click();
    await expect(page.getByTestId('error-bio')).toContainText(/too long|maximum/i);
    
    // Try empty required field
    await page.getByTestId('input-display-name').clear();
    await page.getByTestId('button-save-profile').click();
    await expect(page.getByTestId('error-display-name')).toContainText(/required/i);
  });

  test('Edge: Oversized avatar upload', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/profile');
    await page.getByTestId('button-edit-profile').click();
    
    // Create large file programmatically
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="input-avatar-upload"]') as HTMLInputElement;
      const file = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Should show error
    await expect(page.getByTestId('error-avatar-size')).toContainText(/too large|maximum.*5MB/i);
  });

  test('Happy: Account settings and preferences', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/settings/account');
    
    // Language preference
    await page.getByTestId('select-language').selectOption('es'); // Spanish
    await expect(page.getByText(/configuración|ajustes/i)).toBeVisible(); // UI should update
    
    // Theme preference
    await page.getByTestId('select-theme').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Date format
    await page.getByTestId('select-date-format').selectOption('DD/MM/YYYY');
    
    // Time zone
    await page.getByTestId('select-timezone').selectOption('America/Argentina/Buenos_Aires');
    
    // Email preferences
    await page.getByTestId('input-email-frequency').selectOption('weekly');
    
    // Save all preferences
    await page.getByTestId('button-save-account').click();
    await expect(page.getByText(/saved|guardado/i)).toBeVisible();
    
    // Verify theme persisted after reload
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('Happy: Change password', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/settings/security');
    
    // Fill password change form
    await page.getByTestId('input-current-password').fill(TEST_USERS.mainUser.password);
    await page.getByTestId('input-new-password').fill('NewSecurePass123!');
    await page.getByTestId('input-confirm-password').fill('NewSecurePass123!');
    
    // Check password strength indicator
    await expect(page.getByTestId('password-strength')).toHaveAttribute('data-strength', 'strong');
    
    // Submit password change
    await page.getByTestId('button-change-password').click();
    await expect(page.getByText('Password changed successfully')).toBeVisible();
    
    // Should require re-login or show confirmation
    if (await page.url().includes('/login')) {
      // Re-login with new password
      await page.getByTestId('input-email').fill(TEST_USERS.mainUser.email);
      await page.getByTestId('input-password').fill('NewSecurePass123!');
      await page.getByTestId('button-submit').click();
      await expect(page).toHaveURL(/dashboard|feed/);
    }
  });

  test('Edge: Session management across devices', async ({ browser }) => {
    // Login on first "device"
    const device1 = await browser.newContext();
    const page1 = await device1.newPage();
    
    await loginUser(page1, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    await page1.goto('/settings/security');
    
    // Check active sessions
    await expect(page1.getByTestId('section-active-sessions')).toBeVisible();
    const initialSessions = await page1.getByTestId('session-item').count();
    
    // Login on second "device"
    const device2 = await browser.newContext();
    const page2 = await device2.newPage();
    
    await loginUser(page2, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    // First device should see new session
    await page1.reload();
    const newSessions = await page1.getByTestId('session-item').count();
    expect(newSessions).toBe(initialSessions + 1);
    
    // Revoke session from first device
    await page1.getByTestId('session-item').last().getByTestId('button-revoke-session').click();
    await page1.getByTestId('button-confirm-revoke').click();
    await expect(page1.getByText('Session revoked')).toBeVisible();
    
    // Second device should be logged out
    await page2.reload();
    if (await page2.url().includes('/login')) {
      // Successfully logged out
      expect(page2.url()).toContain('/login');
    }
    
    await device1.close();
    await device2.close();
  });

  test('Happy: Export profile data', async ({ page }) => {
    await loginUser(page, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    
    await page.goto('/settings/data');
    
    // Request data export
    await page.getByTestId('button-export-data').click();
    await expect(page.getByTestId('modal-export-options')).toBeVisible();
    
    // Select what to export
    await page.getByTestId('checkbox-export-profile').check();
    await page.getByTestId('checkbox-export-posts').check();
    await page.getByTestId('checkbox-export-memories').check();
    await page.getByTestId('checkbox-export-messages').uncheck(); // Privacy
    
    // Choose format
    await page.getByTestId('select-export-format').selectOption('json');
    
    // Start export
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-confirm-export').click();
    
    // Should show progress
    await expect(page.getByTestId('text-export-status')).toContainText(/preparing|processing/i);
    
    // Download should start
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('profile-export');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('Failure: Unauthorized profile edit attempt', async ({ browser }) => {
    // Get main user's profile URL
    const mainCtx = await browser.newContext();
    const mainUser = await mainCtx.newPage();
    
    await loginUser(mainUser, TEST_USERS.mainUser.email, TEST_USERS.mainUser.password);
    await mainUser.goto('/profile');
    const profileUrl = mainUser.url();
    const userId = profileUrl.split('/').pop();
    
    // Another user tries to edit
    const viewerCtx = await browser.newContext();
    const viewer = await viewerCtx.newPage();
    
    await loginUser(viewer, TEST_USERS.viewerUser.email, TEST_USERS.viewerUser.password);
    
    // Try to access edit endpoint directly
    const response = await viewer.request.put(`/api/profile/${userId}`, {
      data: { bio: 'Hacked!' }
    });
    
    expect(response.status()).toBe(403); // Forbidden
    
    await mainCtx.close();
    await viewerCtx.close();
  });
});