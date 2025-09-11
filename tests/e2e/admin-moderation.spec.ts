/**
 * ESA LIFE CEO 61×21 - Admin & Moderation Tests
 * Tests admin capabilities, role management, content moderation, and system controls
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const TEST_USERS = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mundotango.com',
    password: process.env.ADMIN_PW || 'adminpass123',
    role: 'admin'
  },
  moderator: {
    email: process.env.MOD_EMAIL || 'moderator@mundotango.com',
    password: process.env.MOD_PW || 'modpass123',
    role: 'moderator'
  },
  regularUser: {
    email: process.env.USER_EMAIL || 'user@mundotango.com',
    password: process.env.USER_PW || 'userpass123',
    role: 'user'
  },
  bannedUser: {
    email: process.env.BANNED_EMAIL || 'banned@mundotango.com',
    password: process.env.BANNED_PW || 'bannedpass123',
    role: 'user'
  }
};

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|admin/, { timeout: 10000 });
}

test.describe('Admin & Moderation', () => {
  test('Happy: Admin role management', async ({ browser }) => {
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Navigate to admin panel
    await admin.goto('/admin');
    await expect(admin.getByTestId('panel-admin-dashboard')).toBeVisible();
    
    // Go to user management
    await admin.getByTestId('nav-users').click();
    await expect(admin.getByTestId('table-users')).toBeVisible();
    
    // Search for regular user
    await admin.getByTestId('input-search-users').fill(TEST_USERS.regularUser.email);
    await admin.getByTestId('button-search').click();
    
    // Find user in table
    const userRow = admin.getByTestId(`user-row-${TEST_USERS.regularUser.email}`);
    await expect(userRow).toBeVisible();
    
    // Check current role
    await expect(userRow.getByTestId('text-user-role')).toContainText('user');
    
    // Open role management
    await userRow.getByTestId('button-manage-role').click();
    await expect(admin.getByTestId('modal-role-management')).toBeVisible();
    
    // Change role to moderator
    await admin.getByTestId('select-new-role').selectOption('moderator');
    await admin.getByTestId('input-role-reason').fill('Trusted community member');
    await admin.getByTestId('button-confirm-role-change').click();
    
    await expect(admin.getByText('Role updated successfully')).toBeVisible();
    
    // Verify role changed
    await expect(userRow.getByTestId('text-user-role')).toContainText('moderator');
    
    // Check audit log
    await admin.getByTestId('nav-audit-log').click();
    await expect(admin.getByTestId('log-entry').first()).toContainText('Role changed');
    await expect(admin.getByTestId('log-entry').first()).toContainText(TEST_USERS.regularUser.email);
    
    await adminCtx.close();
  });

  test('Happy: Content moderation - hide/delete posts', async ({ browser }) => {
    // Regular user creates a post
    const userCtx = await browser.newContext();
    const user = await userCtx.newPage();
    
    await loginUser(user, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await user.goto('/feed');
    await user.getByTestId('button-create-post').click();
    await user.getByTestId('textarea-post-content').fill('This is a test post that violates guidelines');
    await user.getByTestId('button-submit-post').click();
    await expect(user.getByText('Post created successfully')).toBeVisible();
    
    // Get post ID
    const postElement = user.getByTestId('post-item').first();
    const postId = await postElement.getAttribute('data-post-id');
    
    // Moderator reviews the post
    const modCtx = await browser.newContext();
    const mod = await modCtx.newPage();
    
    await loginUser(mod, TEST_USERS.moderator.email, TEST_USERS.moderator.password);
    await mod.goto('/admin/moderation');
    
    // Find reported/flagged content
    await mod.getByTestId('tab-reported-content').click();
    
    // If not reported, search for it
    await mod.getByTestId('input-search-content').fill(postId || 'test post');
    await mod.getByTestId('button-search').click();
    
    const contentItem = mod.getByTestId(`content-item-${postId}`);
    await expect(contentItem).toBeVisible();
    
    // Review content
    await contentItem.getByTestId('button-review').click();
    await expect(mod.getByTestId('modal-content-review')).toBeVisible();
    
    // Hide the post
    await mod.getByTestId('button-hide-content').click();
    await mod.getByTestId('select-hide-reason').selectOption('guidelines-violation');
    await mod.getByTestId('textarea-mod-notes').fill('Violates community guidelines - inappropriate content');
    await mod.getByTestId('button-confirm-hide').click();
    
    await expect(mod.getByText('Content hidden successfully')).toBeVisible();
    
    // User should see post is hidden
    await user.reload();
    const hiddenPost = user.getByTestId(`post-item-${postId}`);
    await expect(hiddenPost).toHaveAttribute('data-status', 'hidden');
    await expect(hiddenPost.getByTestId('text-content-hidden')).toContainText('This content has been hidden');
    
    await userCtx.close();
    await modCtx.close();
  });

  test('Happy: User ban/unban flow', async ({ browser }) => {
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await admin.goto('/admin/users');
    
    // Search for user to ban
    await admin.getByTestId('input-search-users').fill(TEST_USERS.bannedUser.email);
    await admin.getByTestId('button-search').click();
    
    const userRow = admin.getByTestId(`user-row-${TEST_USERS.bannedUser.email}`);
    await expect(userRow).toBeVisible();
    
    // Ban user
    await userRow.getByTestId('button-user-actions').click();
    await admin.getByTestId('button-ban-user').click();
    
    // Fill ban details
    await expect(admin.getByTestId('modal-ban-user')).toBeVisible();
    await admin.getByTestId('select-ban-duration').selectOption('7days');
    await admin.getByTestId('select-ban-reason').selectOption('spam');
    await admin.getByTestId('textarea-ban-details').fill('Multiple spam posts detected');
    await admin.getByTestId('button-confirm-ban').click();
    
    await expect(admin.getByText('User banned successfully')).toBeVisible();
    
    // Verify user is banned
    await expect(userRow.getByTestId('badge-banned')).toBeVisible();
    
    // Banned user tries to login
    const bannedCtx = await browser.newContext();
    const banned = await bannedCtx.newPage();
    
    await banned.goto('/login');
    await banned.getByTestId('input-email').fill(TEST_USERS.bannedUser.email);
    await banned.getByTestId('input-password').fill(TEST_USERS.bannedUser.password);
    await banned.getByTestId('button-submit').click();
    
    // Should see ban message
    await expect(banned.getByTestId('alert-account-banned')).toBeVisible();
    await expect(banned.getByTestId('alert-account-banned')).toContainText(/banned|suspended/i);
    await expect(banned.getByTestId('text-ban-duration')).toContainText('7 days');
    
    // Admin unbans user
    await userRow.getByTestId('button-user-actions').click();
    await admin.getByTestId('button-unban-user').click();
    await admin.getByTestId('button-confirm-unban').click();
    
    await expect(admin.getByText('User unbanned successfully')).toBeVisible();
    await expect(userRow.getByTestId('badge-banned')).toHaveCount(0);
    
    // User can now login
    await banned.reload();
    await banned.getByTestId('input-email').fill(TEST_USERS.bannedUser.email);
    await banned.getByTestId('input-password').fill(TEST_USERS.bannedUser.password);
    await banned.getByTestId('button-submit').click();
    await expect(banned).toHaveURL(/dashboard|feed/);
    
    await adminCtx.close();
    await bannedCtx.close();
  });

  test('Happy: Feature flag management', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await page.goto('/admin/features');
    await expect(page.getByTestId('panel-feature-flags')).toBeVisible();
    
    // Toggle a feature flag
    const videoCallFlag = page.getByTestId('flag-video-calls');
    const initialState = await videoCallFlag.getByTestId('toggle-flag').isChecked();
    
    await videoCallFlag.getByTestId('toggle-flag').click();
    await expect(page.getByText('Feature flag updated')).toBeVisible();
    
    // Configure rollout percentage
    if (!initialState) {
      await videoCallFlag.getByTestId('input-rollout-percentage').fill('25');
      await videoCallFlag.getByTestId('button-save-rollout').click();
      await expect(page.getByText('Rollout updated to 25%')).toBeVisible();
    }
    
    // Add user to allowlist
    await videoCallFlag.getByTestId('button-manage-allowlist').click();
    await page.getByTestId('input-allowlist-email').fill(TEST_USERS.regularUser.email);
    await page.getByTestId('button-add-to-allowlist').click();
    await expect(page.getByText('User added to allowlist')).toBeVisible();
    
    // Check feature availability for user
    await page.getByTestId('button-test-feature').click();
    await page.getByTestId('input-test-user-email').fill(TEST_USERS.regularUser.email);
    await page.getByTestId('button-check-access').click();
    await expect(page.getByTestId('text-access-result')).toContainText('Feature enabled');
  });

  test('Happy: System announcements', async ({ browser }) => {
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await admin.goto('/admin/announcements');
    
    // Create announcement
    await admin.getByTestId('button-new-announcement').click();
    await admin.getByTestId('input-announcement-title').fill('Scheduled Maintenance');
    await admin.getByTestId('textarea-announcement-content').fill(
      'The platform will undergo maintenance on Saturday from 2-4 AM. Some features may be unavailable.'
    );
    
    // Set announcement type and priority
    await admin.getByTestId('select-announcement-type').selectOption('maintenance');
    await admin.getByTestId('select-priority').selectOption('high');
    
    // Set display period
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await admin.getByTestId('input-start-date').fill(tomorrow.toISOString().split('T')[0]);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await admin.getByTestId('input-end-date').fill(nextWeek.toISOString().split('T')[0]);
    
    // Publish announcement
    await admin.getByTestId('button-publish-announcement').click();
    await expect(admin.getByText('Announcement published')).toBeVisible();
    
    // Regular user sees announcement
    const userCtx = await browser.newContext();
    const user = await userCtx.newPage();
    
    await loginUser(user, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    
    // Should see announcement banner
    await expect(user.getByTestId('banner-announcement')).toBeVisible();
    await expect(user.getByTestId('banner-announcement')).toContainText('Scheduled Maintenance');
    
    // Can dismiss announcement
    await user.getByTestId('button-dismiss-announcement').click();
    await expect(user.getByTestId('banner-announcement')).toBeHidden();
    
    await adminCtx.close();
    await userCtx.close();
  });

  test('Edge: Moderator permissions limitations', async ({ page }) => {
    await loginUser(page, TEST_USERS.moderator.email, TEST_USERS.moderator.password);
    
    // Moderator can access moderation panel
    await page.goto('/admin/moderation');
    await expect(page.getByTestId('panel-moderation')).toBeVisible();
    
    // But cannot access user management
    await page.goto('/admin/users');
    await expect(page.getByTestId('alert-permission-denied')).toBeVisible();
    await expect(page.getByTestId('alert-permission-denied')).toContainText(/permission|authorized/i);
    
    // Cannot change roles
    await page.goto('/admin/moderation');
    const userActions = page.getByTestId('button-user-actions').first();
    if (await userActions.count() > 0) {
      await userActions.click();
      await expect(page.getByTestId('button-manage-role')).toHaveCount(0);
      await expect(page.getByTestId('button-ban-user')).toHaveCount(0);
    }
    
    // Can only hide content, not delete
    await page.getByTestId('tab-reported-content').click();
    const content = page.getByTestId('content-item').first();
    if (await content.count() > 0) {
      await content.getByTestId('button-review').click();
      await expect(page.getByTestId('button-hide-content')).toBeVisible();
      await expect(page.getByTestId('button-delete-content')).toHaveCount(0);
    }
  });

  test('Failure: Non-admin access attempt', async ({ page }) => {
    await loginUser(page, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    
    // Try to access admin panel
    await page.goto('/admin');
    
    // Should be redirected or see access denied
    if (page.url().includes('/admin')) {
      await expect(page.getByTestId('alert-access-denied')).toBeVisible();
      await expect(page.getByTestId('alert-access-denied')).toContainText(/authorized|permission|admin/i);
    } else {
      // Redirected away from admin
      expect(page.url()).not.toContain('/admin');
    }
    
    // Try direct API access
    const response = await page.request.get('/api/admin/users');
    expect(response.status()).toBe(403); // Forbidden
  });

  test('Happy: Dashboard statistics and monitoring', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await page.goto('/admin');
    
    // Check dashboard widgets
    await expect(page.getByTestId('widget-active-users')).toBeVisible();
    await expect(page.getByTestId('widget-new-signups')).toBeVisible();
    await expect(page.getByTestId('widget-content-stats')).toBeVisible();
    await expect(page.getByTestId('widget-reports-pending')).toBeVisible();
    
    // Check real-time updates
    const initialActiveUsers = await page.getByTestId('text-active-users-count').textContent();
    
    // Wait for potential update
    await page.waitForTimeout(5000);
    
    const updatedActiveUsers = await page.getByTestId('text-active-users-count').textContent();
    // Active users might have changed
    expect(updatedActiveUsers).toBeTruthy();
    
    // View detailed analytics
    await page.getByTestId('button-view-analytics').click();
    await expect(page.getByTestId('panel-analytics')).toBeVisible();
    
    // Check charts are rendered
    await expect(page.getByTestId('chart-user-growth')).toBeVisible();
    await expect(page.getByTestId('chart-engagement')).toBeVisible();
    await expect(page.getByTestId('chart-content-types')).toBeVisible();
    
    // Export report
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-export-report').click();
    await page.getByTestId('select-report-type').selectOption('monthly');
    await page.getByTestId('button-generate-report').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('admin-report');
  });

  test('Happy: Review and respond to user reports', async ({ browser }) => {
    // User reports content
    const userCtx = await browser.newContext();
    const user = await userCtx.newPage();
    
    await loginUser(user, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await user.goto('/feed');
    
    // Find a post to report
    const post = user.getByTestId('post-item').first();
    await post.getByTestId('button-more-options').click();
    await user.getByTestId('button-report-post').click();
    
    // Fill report
    await expect(user.getByTestId('modal-report')).toBeVisible();
    await user.getByTestId('select-report-reason').selectOption('inappropriate');
    await user.getByTestId('textarea-report-details').fill('This content is inappropriate for the platform');
    await user.getByTestId('button-submit-report').click();
    await expect(user.getByText('Report submitted')).toBeVisible();
    
    // Admin reviews report
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await admin.goto('/admin/reports');
    
    // Find new report
    await admin.getByTestId('filter-status').selectOption('pending');
    const report = admin.getByTestId('report-item').first();
    await expect(report).toBeVisible();
    
    // Review report
    await report.getByTestId('button-review-report').click();
    await expect(admin.getByTestId('modal-report-review')).toBeVisible();
    
    // See report details
    await expect(admin.getByTestId('text-report-reason')).toContainText('inappropriate');
    await expect(admin.getByTestId('text-report-details')).toContainText('inappropriate for the platform');
    
    // Take action
    await admin.getByTestId('select-action').selectOption('remove-content');
    await admin.getByTestId('textarea-action-notes').fill('Content violates guidelines - removed');
    await admin.getByTestId('button-take-action').click();
    
    await expect(admin.getByText('Action taken successfully')).toBeVisible();
    
    // Report status updated
    await expect(report.getByTestId('badge-status')).toContainText('Resolved');
    
    await userCtx.close();
    await adminCtx.close();
  });
});