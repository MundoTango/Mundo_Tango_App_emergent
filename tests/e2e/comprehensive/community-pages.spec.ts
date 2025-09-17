import { test, expect } from '@playwright/test';

test.describe('Community Pages - ESA Layer 51', () => {
  test.describe('Community Hub Page', () => {
    test('should display community sections', async ({ page }) => {
      await page.goto('/community');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check main elements
      await expect(page.getByTestId('community-stats')).toBeVisible();
      await expect(page.getByTestId('active-communities')).toBeVisible();
      await expect(page.getByTestId('featured-members')).toBeVisible();
      await expect(page.getByTestId('community-events')).toBeVisible();
      await expect(page.getByTestId('button-create-community')).toBeVisible();
    });

    test('should show community categories', async ({ page }) => {
      await page.goto('/community');
      
      await expect(page.getByTestId('category-local')).toBeVisible();
      await expect(page.getByTestId('category-interest')).toBeVisible();
      await expect(page.getByTestId('category-professional')).toBeVisible();
      await expect(page.getByTestId('category-cultural')).toBeVisible();
    });

    test('should search communities', async ({ page }) => {
      await page.goto('/community');
      
      await page.getByTestId('search-communities').fill('tango');
      await page.getByTestId('button-search').click();
      
      await expect(page.getByTestId('search-results')).toBeVisible();
    });
  });

  test.describe('Community World Map Page', () => {
    test('should display interactive world map', async ({ page }) => {
      await page.goto('/community-world-map');
      
      await expect(page.locator('.leaflet-container')).toBeVisible();
      await expect(page.getByTestId('map-clusters')).toBeVisible();
      await expect(page.getByTestId('map-legend')).toBeVisible();
      await expect(page.getByTestId('map-controls')).toBeVisible();
    });

    test('should show community markers', async ({ page }) => {
      await page.goto('/community-world-map');
      
      await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
      
      // Click on a marker
      await page.locator('.leaflet-marker-icon').first().click();
      await expect(page.getByTestId('community-popup')).toBeVisible();
    });

    test('should filter map by community type', async ({ page }) => {
      await page.goto('/community-world-map');
      
      await page.getByTestId('filter-community-type').selectOption('milonga');
      await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
    });

    test('should search location on map', async ({ page }) => {
      await page.goto('/community-world-map');
      
      await page.getByTestId('search-location').fill('Buenos Aires');
      await page.getByTestId('button-search-location').click();
      
      // Map should pan to location
      await expect(page.locator('.leaflet-container')).toBeVisible();
    });
  });

  test.describe('Create Community Page', () => {
    test('should display community creation form', async ({ page }) => {
      await page.goto('/create-community');
      
      await expect(page.getByTestId('form-create-community')).toBeVisible();
      await expect(page.getByTestId('input-community-name')).toBeVisible();
      await expect(page.getByTestId('textarea-community-description')).toBeVisible();
      await expect(page.getByTestId('select-community-type')).toBeVisible();
      await expect(page.getByTestId('input-community-location')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/create-community');
      
      await page.getByTestId('button-create').click();
      
      await expect(page.getByTestId('error-name-required')).toBeVisible();
      await expect(page.getByTestId('error-description-required')).toBeVisible();
    });

    test('should set community rules', async ({ page }) => {
      await page.goto('/create-community');
      
      await page.getByTestId('step-rules').click();
      
      await expect(page.getByTestId('community-rules-editor')).toBeVisible();
      await expect(page.getByTestId('default-rules-template')).toBeVisible();
      await expect(page.getByTestId('button-add-rule')).toBeVisible();
    });

    test('should configure privacy settings', async ({ page }) => {
      await page.goto('/create-community');
      
      await page.getByTestId('step-privacy').click();
      
      await expect(page.getByTestId('radio-public')).toBeVisible();
      await expect(page.getByTestId('radio-private')).toBeVisible();
      await expect(page.getByTestId('radio-invite-only')).toBeVisible();
      await expect(page.getByTestId('toggle-approval-required')).toBeVisible();
    });
  });

  test.describe('Tango Communities Page', () => {
    test('should display tango-specific communities', async ({ page }) => {
      await page.goto('/tango-communities');
      
      await expect(page.getByTestId('milonga-communities')).toBeVisible();
      await expect(page.getByTestId('practica-communities')).toBeVisible();
      await expect(page.getByTestId('school-communities')).toBeVisible();
      await expect(page.getByTestId('festival-communities')).toBeVisible();
    });

    test('should show community events calendar', async ({ page }) => {
      await page.goto('/tango-communities');
      
      await expect(page.getByTestId('tango-calendar')).toBeVisible();
      await expect(page.getByTestId('upcoming-milongas')).toBeVisible();
      await expect(page.getByTestId('workshops-classes')).toBeVisible();
    });

    test('should display community leaders', async ({ page }) => {
      await page.goto('/tango-communities');
      
      await expect(page.getByTestId('community-organizers')).toBeVisible();
      await expect(page.getByTestId('featured-teachers')).toBeVisible();
      await expect(page.getByTestId('dj-roster')).toBeVisible();
    });
  });

  test.describe('Tango Stories Page', () => {
    test('should display story feed', async ({ page }) => {
      await page.goto('/tango-stories');
      
      await expect(page.getByTestId('stories-timeline')).toBeVisible();
      await expect(page.getByTestId('story-cards')).toBeVisible();
      await expect(page.getByTestId('button-share-story')).toBeVisible();
    });

    test('should create new story', async ({ page }) => {
      await page.goto('/tango-stories');
      
      await page.getByTestId('button-share-story').click();
      await expect(page.getByTestId('modal-create-story')).toBeVisible();
      await expect(page.getByTestId('story-editor')).toBeVisible();
      await expect(page.getByTestId('button-add-photo')).toBeVisible();
      await expect(page.getByTestId('button-add-video')).toBeVisible();
    });

    test('should filter stories by tag', async ({ page }) => {
      await page.goto('/tango-stories');
      
      await page.getByTestId('tag-milonga').click();
      await expect(page.getByTestId('filtered-stories')).toBeVisible();
    });

    test('should like and comment on stories', async ({ page }) => {
      await page.goto('/tango-stories');
      
      const firstStory = page.getByTestId('story-card').first();
      await expect(firstStory.getByTestId('button-like')).toBeVisible();
      await expect(firstStory.getByTestId('button-comment')).toBeVisible();
      await expect(firstStory.getByTestId('button-share')).toBeVisible();
    });
  });

  test.describe('Role Invitations Page', () => {
    test('should display role-based invitations', async ({ page }) => {
      await page.goto('/invitations');
      
      await expect(page.getByTestId('role-invitations')).toBeVisible();
      await expect(page.getByTestId('teacher-invitations')).toBeVisible();
      await expect(page.getByTestId('organizer-invitations')).toBeVisible();
      await expect(page.getByTestId('dj-invitations')).toBeVisible();
    });

    test('should send role invitation', async ({ page }) => {
      await page.goto('/invitations');
      
      await page.getByTestId('button-invite-to-role').click();
      await expect(page.getByTestId('modal-role-invitation')).toBeVisible();
      await expect(page.getByTestId('select-role')).toBeVisible();
      await expect(page.getByTestId('input-invitee-email')).toBeVisible();
      await expect(page.getByTestId('textarea-invitation-message')).toBeVisible();
    });

    test('should manage role permissions', async ({ page }) => {
      await page.goto('/invitations');
      
      await page.getByTestId('tab-permissions').click();
      await expect(page.getByTestId('role-permissions-grid')).toBeVisible();
      await expect(page.getByTestId('permission-toggles')).toBeVisible();
    });
  });
});