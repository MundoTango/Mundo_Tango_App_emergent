/**
 * ESA LIFE CEO 61×21 - Professional Groups & City Groups Tests
 * Tests group creation, membership, city-based assignment, and permissions
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';

// Test configuration
const TEST_USERS = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mundotango.com',
    password: process.env.ADMIN_PW || 'adminpass123'
  },
  buenosAiresUser: {
    email: process.env.BA_USER_EMAIL || 'ba_user@mundotango.com',
    password: process.env.BA_USER_PW || 'testpass123',
    city: 'Buenos Aires'
  },
  parisUser: {
    email: process.env.PARIS_USER_EMAIL || 'paris_user@mundotango.com',
    password: process.env.PARIS_USER_PW || 'testpass123',
    city: 'Paris'
  },
  regularUser: {
    email: process.env.USER_EMAIL || 'user@mundotango.com',
    password: process.env.USER_PW || 'testpass123'
  }
};

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|groups/, { timeout: 10000 });
}

// Helper to create a group
async function createGroup(page: Page, name: string, type: 'public' | 'private', description: string) {
  await page.goto('/groups');
  await page.getByTestId('button-create-group').click();
  await page.getByTestId('input-group-name').fill(name);
  await page.getByTestId('textarea-group-description').fill(description);
  await page.getByTestId('select-group-type').selectOption(type);
  await page.getByTestId('button-submit-group').click();
  await expect(page.getByText('Group created successfully')).toBeVisible();
}

test.describe('Professional Groups & City Groups', () => {
  test('Happy: Create public group and users can join', async ({ browser }) => {
    // Admin creates a public group
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await createGroup(admin, 'Tango Professionals', 'public', 'A group for professional tango dancers');
    
    // Navigate to the created group
    await admin.getByTestId('card-group-Tango Professionals').click();
    await expect(admin.getByTestId('text-group-name')).toContainText('Tango Professionals');
    await expect(admin.getByTestId('text-member-count')).toContainText('1'); // Creator is member
    
    // Regular user joins the public group
    const userCtx = await browser.newContext();
    const user = await userCtx.newPage();
    
    await loginUser(user, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await user.goto('/groups');
    await user.getByTestId('card-group-Tango Professionals').click();
    await user.getByTestId('button-join-group').click();
    await expect(user.getByText('Successfully joined group')).toBeVisible();
    await expect(user.getByTestId('button-leave-group')).toBeVisible();
    
    // Verify member count updated
    await admin.reload();
    await expect(admin.getByTestId('text-member-count')).toContainText('2');
    
    // User posts in the group
    await user.getByTestId('button-create-post').click();
    await user.getByTestId('textarea-post-content').fill('Hello fellow tango professionals!');
    await user.getByTestId('button-submit-post').click();
    await expect(user.getByText('Post created successfully')).toBeVisible();
    
    // Admin sees the post
    await admin.reload();
    await expect(admin.getByText('Hello fellow tango professionals!')).toBeVisible();
    
    // Cleanup
    await adminCtx.close();
    await userCtx.close();
  });

  test('Happy: City-based group auto-assignment (Buenos Aires)', async ({ browser }) => {
    const baUserCtx = await browser.newContext();
    const baUser = await baUserCtx.newPage();
    
    await loginUser(baUser, TEST_USERS.buenosAiresUser.email, TEST_USERS.buenosAiresUser.password);
    
    // User should automatically be in Buenos Aires city group
    await baUser.goto('/groups');
    await expect(baUser.getByTestId('section-my-groups')).toBeVisible();
    await expect(baUser.getByTestId('card-group-Buenos Aires Tango')).toBeVisible();
    
    // Click on the city group
    await baUser.getByTestId('card-group-Buenos Aires Tango').click();
    await expect(baUser.getByTestId('text-group-type')).toContainText('City Group');
    await expect(baUser.getByTestId('button-leave-group')).toBeDisabled(); // Can't leave city group
    
    // Post in city group
    await baUser.getByTestId('button-create-post').click();
    await baUser.getByTestId('textarea-post-content').fill('Milonga tonight at Salon Canning!');
    await baUser.getByTestId('button-submit-post').click();
    await expect(baUser.getByText('Post created successfully')).toBeVisible();
    
    // Paris user shouldn't see Buenos Aires posts
    const parisUserCtx = await browser.newContext();
    const parisUser = await parisUserCtx.newPage();
    
    await loginUser(parisUser, TEST_USERS.parisUser.email, TEST_USERS.parisUser.password);
    await parisUser.goto('/groups');
    
    // Paris user should be in Paris group, not Buenos Aires
    await expect(parisUser.getByTestId('card-group-Paris Tango')).toBeVisible();
    await expect(parisUser.getByTestId('card-group-Buenos Aires Tango')).toHaveCount(0);
    
    await baUserCtx.close();
    await parisUserCtx.close();
  });

  test('Edge: Private group requires invitation', async ({ browser }) => {
    // Admin creates private group
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await createGroup(admin, 'Elite Dancers', 'private', 'Invitation only group');
    
    // Get group ID from URL
    await admin.getByTestId('card-group-Elite Dancers').click();
    const groupUrl = admin.url();
    const groupId = groupUrl.split('/').pop();
    
    // Regular user tries to join
    const userCtx = await browser.newContext();
    const user = await userCtx.newPage();
    
    await loginUser(user, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await user.goto(`/groups/${groupId}`);
    
    // Should not see join button for private group
    await expect(user.getByTestId('button-join-group')).toHaveCount(0);
    await expect(user.getByTestId('text-private-group-notice')).toContainText('This is a private group');
    
    // Admin invites user
    await admin.getByTestId('button-manage-members').click();
    await admin.getByTestId('input-invite-email').fill(TEST_USERS.regularUser.email);
    await admin.getByTestId('button-send-invitation').click();
    await expect(admin.getByText('Invitation sent')).toBeVisible();
    
    // User accepts invitation (simulated via notification)
    await user.goto('/notifications');
    await user.getByTestId('notification-group-invite').click();
    await user.getByTestId('button-accept-invitation').click();
    await expect(user.getByText('Successfully joined group')).toBeVisible();
    
    await adminCtx.close();
    await userCtx.close();
  });

  test('Edge: Group capacity limits', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Create group with capacity limit
    await page.goto('/groups');
    await page.getByTestId('button-create-group').click();
    await page.getByTestId('input-group-name').fill('Limited Workshop');
    await page.getByTestId('textarea-group-description').fill('Max 5 members');
    await page.getByTestId('input-max-members').fill('5');
    await page.getByTestId('button-submit-group').click();
    
    // Simulate 5 users joining (would be done with multiple contexts in real scenario)
    await page.getByTestId('card-group-Limited Workshop').click();
    
    // Admin adds 4 test members (for demo purposes)
    await page.getByTestId('button-manage-members').click();
    for (let i = 1; i <= 4; i++) {
      await page.getByTestId('input-invite-email').fill(`test${i}@example.com`);
      await page.getByTestId('button-send-invitation').click();
      await page.waitForTimeout(500); // Small delay between invites
    }
    
    // Try to add 6th member - should fail
    await page.getByTestId('input-invite-email').fill('test6@example.com');
    await page.getByTestId('button-send-invitation').click();
    await expect(page.getByText(/group is full|capacity reached/i)).toBeVisible();
  });

  test('Failure: Non-admin cannot delete group', async ({ browser }) => {
    // Admin creates group
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await createGroup(admin, 'Test Group', 'public', 'Test description');
    
    const groupUrl = admin.url();
    
    // Regular user tries to delete
    const userCtx = await browser.newContext();
    const user = await userCtx.newPage();
    
    await loginUser(user, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await user.goto(groupUrl);
    
    // Delete button should not be visible to non-admin
    await expect(user.getByTestId('button-delete-group')).toHaveCount(0);
    
    // Try to access delete endpoint directly
    const response = await user.request.delete(`/api/groups/${groupUrl.split('/').pop()}`);
    expect(response.status()).toBe(403); // Forbidden
    
    await adminCtx.close();
    await userCtx.close();
  });

  test('Edge: Leave and rejoin group', async ({ page }) => {
    await loginUser(page, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    
    // Join a public group
    await page.goto('/groups');
    const publicGroup = page.getByTestId('card-group-public').first();
    if (await publicGroup.count() > 0) {
      await publicGroup.click();
      
      // Join if not already member
      if (await page.getByTestId('button-join-group').count() > 0) {
        await page.getByTestId('button-join-group').click();
        await expect(page.getByText('Successfully joined group')).toBeVisible();
      }
      
      // Leave group
      await page.getByTestId('button-leave-group').click();
      await page.getByTestId('button-confirm-leave').click();
      await expect(page.getByText('Left group successfully')).toBeVisible();
      
      // Rejoin
      await page.getByTestId('button-join-group').click();
      await expect(page.getByText('Successfully joined group')).toBeVisible();
    }
  });

  test('Happy: Role-based permissions in group', async ({ browser }) => {
    const adminCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    
    await loginUser(admin, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await createGroup(admin, 'Moderated Group', 'public', 'Group with moderators');
    
    // Make a user moderator
    await admin.getByTestId('card-group-Moderated Group').click();
    await admin.getByTestId('button-manage-members').click();
    
    // Add regular user as member first
    await admin.getByTestId('input-invite-email').fill(TEST_USERS.regularUser.email);
    await admin.getByTestId('button-send-invitation').click();
    
    // Promote to moderator
    await admin.getByTestId(`member-row-${TEST_USERS.regularUser.email}`).getByTestId('button-member-actions').click();
    await admin.getByTestId('button-make-moderator').click();
    await expect(admin.getByText('User promoted to moderator')).toBeVisible();
    
    // Moderator user logs in
    const modCtx = await browser.newContext();
    const mod = await modCtx.newPage();
    
    await loginUser(mod, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await mod.goto('/groups');
    await mod.getByTestId('card-group-Moderated Group').click();
    
    // Moderator should see moderation tools
    await expect(mod.getByTestId('button-moderate-posts')).toBeVisible();
    await expect(mod.getByTestId('button-pin-post')).toBeVisible();
    
    // But not admin-only tools
    await expect(mod.getByTestId('button-delete-group')).toHaveCount(0);
    
    await adminCtx.close();
    await modCtx.close();
  });

  test('Happy: Search and filter groups', async ({ page }) => {
    await loginUser(page, TEST_USERS.regularUser.email, TEST_USERS.regularUser.password);
    await page.goto('/groups');
    
    // Search by name
    await page.getByTestId('input-search-groups').fill('Tango');
    await page.getByTestId('button-search').click();
    
    // Should show tango-related groups
    await expect(page.getByTestId('search-results')).toBeVisible();
    const results = page.getByTestId('card-group');
    const count = await results.count();
    
    for (let i = 0; i < count; i++) {
      const text = await results.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('tango');
    }
    
    // Filter by type
    await page.getByTestId('select-filter-type').selectOption('city');
    await expect(page.getByTestId('text-group-type')).toContainText('City Group');
    
    // Filter by member count
    await page.getByTestId('select-filter-size').selectOption('large'); // >50 members
    const memberCounts = page.getByTestId('text-member-count');
    const firstCount = await memberCounts.first().textContent();
    expect(parseInt(firstCount || '0')).toBeGreaterThan(50);
  });
});