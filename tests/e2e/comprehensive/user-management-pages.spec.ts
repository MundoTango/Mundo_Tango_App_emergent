import { test, expect } from '@playwright/test';

test.describe('User Management Pages - ESA Layer 51', () => {
  test.describe('Settings Page', () => {
    test('should display all settings sections', async ({ page }) => {
      await page.goto('/settings');
      
      // Check MT Ocean theme
      await expect(page.locator('.gradient-turquoise')).toBeVisible();
      
      // Check sections
      await expect(page.getByTestId('section-account')).toBeVisible();
      await expect(page.getByTestId('section-privacy')).toBeVisible();
      await expect(page.getByTestId('section-notifications')).toBeVisible();
      await expect(page.getByTestId('section-appearance')).toBeVisible();
      await expect(page.getByTestId('section-language')).toBeVisible();
    });

    test('should update notification preferences', async ({ page }) => {
      await page.goto('/settings');
      
      await page.getByTestId('tab-notifications').click();
      await expect(page.getByTestId('toggle-email-notifications')).toBeVisible();
      await expect(page.getByTestId('toggle-push-notifications')).toBeVisible();
      await expect(page.getByTestId('toggle-sms-notifications')).toBeVisible();
      
      // Toggle a setting
      await page.getByTestId('toggle-email-notifications').click();
      await expect(page.getByTestId('message-settings-saved')).toBeVisible();
    });

    test('should change theme preferences', async ({ page }) => {
      await page.goto('/settings');
      
      await page.getByTestId('tab-appearance').click();
      await expect(page.getByTestId('theme-selector')).toBeVisible();
      await expect(page.getByTestId('option-light')).toBeVisible();
      await expect(page.getByTestId('option-dark')).toBeVisible();
      await expect(page.getByTestId('option-auto')).toBeVisible();
    });
  });

  test.describe('Onboarding Page', () => {
    test('should show onboarding steps', async ({ page }) => {
      await page.goto('/onboarding');
      
      await expect(page.getByTestId('step-indicator')).toBeVisible();
      await expect(page.getByTestId('step-welcome')).toBeVisible();
      await expect(page.getByTestId('button-next')).toBeVisible();
      await expect(page.getByTestId('button-skip')).toBeVisible();
    });

    test('should progress through onboarding steps', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Step 1: Welcome
      await expect(page.getByTestId('step-welcome')).toBeVisible();
      await page.getByTestId('button-next').click();
      
      // Step 2: Profile Setup
      await expect(page.getByTestId('step-profile')).toBeVisible();
      await page.getByTestId('input-display-name').fill('Test User');
      await page.getByTestId('button-next').click();
      
      // Step 3: Preferences
      await expect(page.getByTestId('step-preferences')).toBeVisible();
    });
  });

  test.describe('Resume Page', () => {
    test('should display resume sections', async ({ page }) => {
      await page.goto('/resume');
      
      await expect(page.getByTestId('resume-header')).toBeVisible();
      await expect(page.getByTestId('resume-experience')).toBeVisible();
      await expect(page.getByTestId('resume-education')).toBeVisible();
      await expect(page.getByTestId('resume-skills')).toBeVisible();
      await expect(page.getByTestId('resume-achievements')).toBeVisible();
    });

    test('should allow editing resume sections', async ({ page }) => {
      await page.goto('/resume');
      
      await page.getByTestId('button-edit-experience').click();
      await expect(page.getByTestId('modal-edit-experience')).toBeVisible();
      await expect(page.getByTestId('input-job-title')).toBeVisible();
      await expect(page.getByTestId('input-company')).toBeVisible();
      await expect(page.getByTestId('button-save')).toBeVisible();
    });

    test('should export resume as PDF', async ({ page }) => {
      await page.goto('/resume');
      
      await expect(page.getByTestId('button-export-pdf')).toBeVisible();
      await expect(page.getByTestId('button-export-docx')).toBeVisible();
      await expect(page.getByTestId('button-share-resume')).toBeVisible();
    });
  });

  test.describe('Public Resume Page', () => {
    test('should display public resume view', async ({ page }) => {
      await page.goto('/public-resume/testuser');
      
      await expect(page.getByTestId('public-resume-header')).toBeVisible();
      await expect(page.getByTestId('public-experience')).toBeVisible();
      await expect(page.getByTestId('public-skills')).toBeVisible();
      await expect(page.getByTestId('button-contact')).toBeVisible();
    });

    test('should not show edit buttons in public view', async ({ page }) => {
      await page.goto('/public-resume/testuser');
      
      await expect(page.getByTestId('button-edit-experience')).not.toBeVisible();
      await expect(page.getByTestId('button-edit-education')).not.toBeVisible();
    });
  });

  test.describe('Public Profile Page', () => {
    test('should display public profile information', async ({ page }) => {
      await page.goto('/public-profile/testuser');
      
      await expect(page.getByTestId('profile-avatar')).toBeVisible();
      await expect(page.getByTestId('profile-name')).toBeVisible();
      await expect(page.getByTestId('profile-bio')).toBeVisible();
      await expect(page.getByTestId('profile-stats')).toBeVisible();
      await expect(page.getByTestId('button-follow')).toBeVisible();
    });

    test('should show user posts', async ({ page }) => {
      await page.goto('/public-profile/testuser');
      
      await page.getByTestId('tab-posts').click();
      await expect(page.getByTestId('user-posts-list')).toBeVisible();
    });

    test('should show user events', async ({ page }) => {
      await page.goto('/public-profile/testuser');
      
      await page.getByTestId('tab-events').click();
      await expect(page.getByTestId('user-events-list')).toBeVisible();
    });
  });

  test.describe('Profile Switcher Page', () => {
    test('should display profile list', async ({ page }) => {
      await page.goto('/profile-switcher');
      
      await expect(page.getByTestId('profile-list')).toBeVisible();
      await expect(page.getByTestId('button-add-profile')).toBeVisible();
      await expect(page.getByTestId('current-profile-indicator')).toBeVisible();
    });

    test('should allow switching profiles', async ({ page }) => {
      await page.goto('/profile-switcher');
      
      const profiles = page.getByTestId('profile-item');
      if (await profiles.count() > 1) {
        await profiles.nth(1).click();
        await expect(page.getByTestId('message-profile-switched')).toBeVisible();
      }
    });

    test('should allow creating new profile', async ({ page }) => {
      await page.goto('/profile-switcher');
      
      await page.getByTestId('button-add-profile').click();
      await expect(page.getByTestId('modal-create-profile')).toBeVisible();
      await expect(page.getByTestId('input-profile-name')).toBeVisible();
      await expect(page.getByTestId('select-profile-type')).toBeVisible();
    });
  });

  test.describe('Home Page', () => {
    test('should display user dashboard', async ({ page }) => {
      await page.goto('/home');
      
      await expect(page.getByTestId('welcome-message')).toBeVisible();
      await expect(page.getByTestId('quick-actions')).toBeVisible();
      await expect(page.getByTestId('recent-activity')).toBeVisible();
      await expect(page.getByTestId('upcoming-events')).toBeVisible();
    });

    test('should show personalized recommendations', async ({ page }) => {
      await page.goto('/home');
      
      await expect(page.getByTestId('recommended-connections')).toBeVisible();
      await expect(page.getByTestId('recommended-events')).toBeVisible();
      await expect(page.getByTestId('recommended-groups')).toBeVisible();
    });

    test('should display quick stats', async ({ page }) => {
      await page.goto('/home');
      
      await expect(page.getByTestId('stat-connections')).toBeVisible();
      await expect(page.getByTestId('stat-events-attended')).toBeVisible();
      await expect(page.getByTestId('stat-groups-joined')).toBeVisible();
    });
  });
});