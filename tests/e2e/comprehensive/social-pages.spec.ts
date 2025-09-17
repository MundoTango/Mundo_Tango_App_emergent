import { test, expect } from '@playwright/test';

test.describe('Social Features Pages - ESA Layer 51', () => {
  test.describe('Friends Page', () => {
    test('should display friends list and requests', async ({ page }) => {
      await page.goto('/friends');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check main elements
      await expect(page.getByTestId('friends-list')).toBeVisible();
      await expect(page.getByTestId('friend-requests')).toBeVisible();
      await expect(page.getByTestId('button-find-friends')).toBeVisible();
      await expect(page.getByTestId('search-friends')).toBeVisible();
    });

    test('should handle friend requests', async ({ page }) => {
      await page.goto('/friends');
      
      await page.getByTestId('tab-requests').click();
      const requests = page.getByTestId('friend-request-item');
      
      if (await requests.count() > 0) {
        await expect(requests.first().getByTestId('button-accept')).toBeVisible();
        await expect(requests.first().getByTestId('button-decline')).toBeVisible();
      }
    });

    test('should search for friends', async ({ page }) => {
      await page.goto('/friends');
      
      await page.getByTestId('search-friends').fill('john');
      await page.getByTestId('button-search').click();
      
      await expect(page.getByTestId('search-results')).toBeVisible();
    });

    test('should show mutual friends', async ({ page }) => {
      await page.goto('/friends');
      
      const friendCard = page.getByTestId('friend-card').first();
      await friendCard.hover();
      
      await expect(friendCard.getByTestId('mutual-friends-count')).toBeVisible();
    });
  });

  test.describe('Enhanced Friends Page', () => {
    test('should display friend suggestions', async ({ page }) => {
      await page.goto('/friends');
      
      await expect(page.getByTestId('friend-suggestions')).toBeVisible();
      await expect(page.getByTestId('people-you-may-know')).toBeVisible();
    });

    test('should show friend categories', async ({ page }) => {
      await page.goto('/friends');
      
      await expect(page.getByTestId('category-close-friends')).toBeVisible();
      await expect(page.getByTestId('category-family')).toBeVisible();
      await expect(page.getByTestId('category-colleagues')).toBeVisible();
    });
  });

  test.describe('Friendship Page', () => {
    test('should display friendship details', async ({ page }) => {
      await page.goto('/friendship/test-friend-id');
      
      await expect(page.getByTestId('friendship-timeline')).toBeVisible();
      await expect(page.getByTestId('shared-memories')).toBeVisible();
      await expect(page.getByTestId('friendship-stats')).toBeVisible();
      await expect(page.getByTestId('button-message')).toBeVisible();
    });

    test('should show shared activities', async ({ page }) => {
      await page.goto('/friendship/test-friend-id');
      
      await expect(page.getByTestId('shared-events')).toBeVisible();
      await expect(page.getByTestId('shared-groups')).toBeVisible();
      await expect(page.getByTestId('shared-interests')).toBeVisible();
    });
  });

  test.describe('Messages Page', () => {
    test('should display conversation list', async ({ page }) => {
      await page.goto('/messages');
      
      await expect(page.getByTestId('conversation-list')).toBeVisible();
      await expect(page.getByTestId('message-thread')).toBeVisible();
      await expect(page.getByTestId('input-message')).toBeVisible();
      await expect(page.getByTestId('button-send')).toBeVisible();
    });

    test('should search conversations', async ({ page }) => {
      await page.goto('/messages');
      
      await page.getByTestId('search-conversations').fill('test');
      await expect(page.getByTestId('search-results')).toBeVisible();
    });

    test('should send a message', async ({ page }) => {
      await page.goto('/messages');
      
      await page.getByTestId('conversation-item').first().click();
      await page.getByTestId('input-message').fill('Hello!');
      await page.getByTestId('button-send').click();
      
      await expect(page.getByTestId('message-sent')).toBeVisible();
    });

    test('should show message status', async ({ page }) => {
      await page.goto('/messages');
      
      await page.getByTestId('conversation-item').first().click();
      await expect(page.getByTestId('message-status-delivered')).toBeVisible();
    });

    test('should support attachments', async ({ page }) => {
      await page.goto('/messages');
      
      await expect(page.getByTestId('button-attach-file')).toBeVisible();
      await expect(page.getByTestId('button-attach-photo')).toBeVisible();
      await expect(page.getByTestId('button-emoji')).toBeVisible();
    });
  });

  test.describe('Groups Page', () => {
    test('should display user groups', async ({ page }) => {
      await page.goto('/groups');
      
      await expect(page.getByTestId('groups-grid')).toBeVisible();
      await expect(page.getByTestId('button-create-group')).toBeVisible();
      await expect(page.getByTestId('suggested-groups')).toBeVisible();
      await expect(page.getByTestId('group-categories')).toBeVisible();
    });

    test('should create a new group', async ({ page }) => {
      await page.goto('/groups');
      
      await page.getByTestId('button-create-group').click();
      await expect(page.getByTestId('modal-create-group')).toBeVisible();
      await expect(page.getByTestId('input-group-name')).toBeVisible();
      await expect(page.getByTestId('textarea-group-description')).toBeVisible();
      await expect(page.getByTestId('select-group-privacy')).toBeVisible();
    });

    test('should filter groups by category', async ({ page }) => {
      await page.goto('/groups');
      
      await page.getByTestId('filter-category').selectOption('milonga');
      await expect(page.getByTestId('filtered-groups')).toBeVisible();
    });

    test('should search groups', async ({ page }) => {
      await page.goto('/groups');
      
      await page.getByTestId('search-groups').fill('tango');
      await page.getByTestId('button-search').click();
      
      await expect(page.getByTestId('search-results')).toBeVisible();
    });
  });

  test.describe('Group Detail Page', () => {
    test('should display group information', async ({ page }) => {
      await page.goto('/groups/test-group-slug');
      
      await expect(page.getByTestId('group-header')).toBeVisible();
      await expect(page.getByTestId('group-description')).toBeVisible();
      await expect(page.getByTestId('member-count')).toBeVisible();
      await expect(page.getByTestId('button-join-group')).toBeVisible();
    });

    test('should show group posts', async ({ page }) => {
      await page.goto('/groups/test-group-slug');
      
      await expect(page.getByTestId('group-posts')).toBeVisible();
      await expect(page.getByTestId('post-creator')).toBeVisible();
    });

    test('should display group events', async ({ page }) => {
      await page.goto('/groups/test-group-slug');
      
      await page.getByTestId('tab-events').click();
      await expect(page.getByTestId('group-events')).toBeVisible();
    });

    test('should show group members', async ({ page }) => {
      await page.goto('/groups/test-group-slug');
      
      await page.getByTestId('tab-members').click();
      await expect(page.getByTestId('members-list')).toBeVisible();
      await expect(page.getByTestId('member-role-badges')).toBeVisible();
    });
  });

  test.describe('Invitations Page', () => {
    test('should display pending invitations', async ({ page }) => {
      await page.goto('/invitations');
      
      await expect(page.getByTestId('invitations-list')).toBeVisible();
      await expect(page.getByTestId('event-invitations')).toBeVisible();
      await expect(page.getByTestId('group-invitations')).toBeVisible();
    });

    test('should accept or decline invitations', async ({ page }) => {
      await page.goto('/invitations');
      
      const invitation = page.getByTestId('invitation-item').first();
      if (await invitation.isVisible()) {
        await expect(invitation.getByTestId('button-accept')).toBeVisible();
        await expect(invitation.getByTestId('button-decline')).toBeVisible();
        await expect(invitation.getByTestId('button-maybe')).toBeVisible();
      }
    });

    test('should send invitations', async ({ page }) => {
      await page.goto('/invitations');
      
      await page.getByTestId('button-send-invitation').click();
      await expect(page.getByTestId('modal-send-invitation')).toBeVisible();
      await expect(page.getByTestId('input-recipient')).toBeVisible();
      await expect(page.getByTestId('select-invitation-type')).toBeVisible();
    });
  });
});