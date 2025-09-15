import { test, expect, devices } from '@playwright/test';
import { CreateAccountPage } from '../pages/registration/CreateAccountPage';
import { ProfileDetailsPage } from '../pages/registration/ProfileDetailsPage';
import { DancePreferencesPage } from '../pages/registration/DancePreferencesPage';
import { LocationSetupPage } from '../pages/registration/LocationSetupPage';
import { WelcomeTutorialPage } from '../pages/registration/WelcomeTutorialPage';
import { 
  runAccessibilityScan, 
  assertNoA11yViolations, 
  checkKeyboardNavigation,
  checkFormLabels,
  checkHeadingHierarchy,
  generateA11yReport 
} from '../helpers/accessibility';
import { 
  takePercySnapshot, 
  stabilizePage, 
  takeResponsiveScreenshots,
  hideDynamicElements,
  testDarkMode 
} from '../helpers/visual-regression';

/**
 * Comprehensive Registration Flow E2E Tests for Mundo Tango
 * Tests the complete 5-step registration process with accessibility and visual regression
 */

test.describe('Mundo Tango Registration Flow', () => {
  let createAccountPage: CreateAccountPage;
  let profileDetailsPage: ProfileDetailsPage;
  let dancePreferencesPage: DancePreferencesPage;
  let locationSetupPage: LocationSetupPage;
  let welcomeTutorialPage: WelcomeTutorialPage;

  // Test data for registration
  const testUserData = {
    // Step 1: Create Account
    name: 'Maria González',
    username: `maria_tango_${Date.now()}`,
    email: `maria.test.${Date.now()}@example.com`,
    password: 'Tango2024!Secure',
    confirmPassword: 'Tango2024!Secure',
    
    // Step 2: Profile Details
    bio: 'Passionate tango dancer from Buenos Aires, seeking to connect with the global tango community.',
    birthDate: '1990-06-15',
    gender: 'female',
    phone: '+54 11 4567-8900',
    hasWhatsapp: true,
    instagram: '@maria_tango_dancer',
    facebook: 'maria.gonzalez.tango',
    
    // Step 3: Dance Preferences
    experienceLevel: 'intermediate',
    yearsOfExperience: 5,
    danceStyles: ['salon', 'milonguero', 'vals'],
    roles: ['dancer', 'teacher', 'host'],
    partnerPreference: 'both',
    favoriteOrchestra: 'Carlos Di Sarli',
    aboutTango: 'Tango is my life and passion. I love the connection and emotion it brings.',
    
    // Step 4: Location Setup
    country: 'Argentina',
    city: 'Buenos Aires',
    address: 'Av. Corrientes 1234',
    neighborhood: 'San Telmo',
    postalCode: 'C1043',
    canHost: true,
    hostingCapacity: 2,
    hostingDescription: 'Cozy apartment in the heart of tango neighborhood, close to milongas.',
    canGuide: true,
    guideLanguages: ['Spanish', 'English', 'Portuguese'],
    
    // Step 5: Welcome & Tutorial
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  };

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    createAccountPage = new CreateAccountPage(page);
    profileDetailsPage = new ProfileDetailsPage(page);
    dancePreferencesPage = new DancePreferencesPage(page);
    locationSetupPage = new LocationSetupPage(page);
    welcomeTutorialPage = new WelcomeTutorialPage(page);
    
    // Navigate to registration page
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
  });

  test('Complete registration flow - Happy path', async ({ page }) => {
    // Step 1: Create Account
    await test.step('Step 1: Create Account', async () => {
      // Fill account details
      await createAccountPage.fillAccountDetails({
        name: testUserData.name,
        username: testUserData.username,
        email: testUserData.email,
        password: testUserData.password,
        confirmPassword: testUserData.confirmPassword,
      });
      
      // Check username availability
      await page.waitForTimeout(1000); // Debounce delay
      const isUsernameAvailable = await createAccountPage.checkUsernameAvailability();
      expect(isUsernameAvailable).toBe(true);
      
      // Check password strength
      const passwordStrength = await createAccountPage.checkPasswordStrength();
      expect(passwordStrength).toContain('Strong');
      
      // Accept terms
      await createAccountPage.acceptTermsAndPrivacy();
      
      // Verify form is valid
      expect(await createAccountPage.isFormValid()).toBe(true);
      
      // Check progress (should be 20%)
      expect(await createAccountPage.getProgressPercentage()).toBe(20);
      
      // Continue to next step
      await createAccountPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
    });

    // Step 2: Profile Details
    await test.step('Step 2: Profile Details', async () => {
      // Upload avatar (using test image)
      const testImagePath = 'tests/e2e/fixtures/test-avatar.jpg';
      await profileDetailsPage.uploadAvatar(testImagePath);
      
      // Verify avatar preview is shown
      expect(await profileDetailsPage.hasAvatarPreview()).toBe(true);
      
      // Fill profile details
      await profileDetailsPage.fillProfileDetails({
        bio: testUserData.bio,
        birthDate: testUserData.birthDate,
        gender: testUserData.gender,
        phone: testUserData.phone,
        hasWhatsapp: testUserData.hasWhatsapp,
        instagram: testUserData.instagram,
        facebook: testUserData.facebook,
      });
      
      // Check bio character count
      const charCount = await profileDetailsPage.getBioCharacterCount();
      expect(charCount).toBeGreaterThan(0);
      expect(charCount).toBeLessThanOrEqual(500);
      
      // Check progress (should be 40%)
      expect(await profileDetailsPage.getProgressPercentage()).toBe(40);
      
      // Continue to next step
      await profileDetailsPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
    });

    // Step 3: Dance Preferences
    await test.step('Step 3: Dance Preferences', async () => {
      // Select experience level
      await dancePreferencesPage.selectExperienceLevel(testUserData.experienceLevel as any);
      await dancePreferencesPage.setYearsOfExperience(testUserData.yearsOfExperience);
      
      // Select dance styles
      await dancePreferencesPage.selectDanceStyles(testUserData.danceStyles);
      
      // Select roles in community
      await dancePreferencesPage.selectRoles(testUserData.roles);
      
      // Verify selected roles count
      const rolesCount = await dancePreferencesPage.getSelectedRolesCount();
      expect(rolesCount).toBe(testUserData.roles.length);
      
      // Select partner preference
      await dancePreferencesPage.selectPartnerPreference(testUserData.partnerPreference as any);
      
      // Fill additional info
      await dancePreferencesPage.fillAdditionalInfo({
        favoriteOrchestra: testUserData.favoriteOrchestra,
        aboutTango: testUserData.aboutTango,
      });
      
      // Check progress (should be 60%)
      expect(await dancePreferencesPage.getProgressPercentage()).toBe(60);
      
      // Continue to next step
      await dancePreferencesPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
    });

    // Step 4: Location Setup
    await test.step('Step 4: Location Setup', async () => {
      // Select country
      await locationSetupPage.selectCountry(testUserData.country);
      
      // Enter city with autocomplete
      await locationSetupPage.enterCity(testUserData.city);
      
      // Verify map is visible
      expect(await locationSetupPage.isMapVisible()).toBe(true);
      
      // Fill address details
      await locationSetupPage.fillAddress({
        address: testUserData.address,
        neighborhood: testUserData.neighborhood,
        postalCode: testUserData.postalCode,
      });
      
      // Setup hosting preferences
      await locationSetupPage.setupHostingPreferences({
        canHost: testUserData.canHost,
        capacity: testUserData.hostingCapacity,
        description: testUserData.hostingDescription,
      });
      
      // Setup guide preferences
      await locationSetupPage.setupGuidePreferences({
        canGuide: testUserData.canGuide,
        languages: testUserData.guideLanguages,
      });
      
      // Enable nearby venues
      await locationSetupPage.setShowNearbyVenues(true);
      
      // Check progress (should be 80%)
      expect(await locationSetupPage.getProgressPercentage()).toBe(80);
      
      // Continue to final step
      await locationSetupPage.continueToNextStep();
      await page.waitForLoadState('networkidle');
    });

    // Step 5: Welcome & Tutorial
    await test.step('Step 5: Welcome & Tutorial', async () => {
      // Verify welcome message
      const welcomeMessage = await welcomeTutorialPage.getWelcomeMessage();
      expect(welcomeMessage).toContain('Welcome');
      expect(welcomeMessage).toContain(testUserData.name.split(' ')[0]);
      
      // Check confetti animation
      expect(await welcomeTutorialPage.hasConfettiAnimation()).toBe(true);
      
      // Verify profile completion
      const profileCompletion = await welcomeTutorialPage.getProfileCompletionPercentage();
      expect(profileCompletion).toBeGreaterThanOrEqual(80);
      
      // Check recommendations are shown
      const groupsCount = await welcomeTutorialPage.getRecommendedGroupsCount();
      const eventsCount = await welcomeTutorialPage.getRecommendedEventsCount();
      const peopleCount = await welcomeTutorialPage.getRecommendedPeopleCount();
      
      expect(groupsCount).toBeGreaterThan(0);
      expect(eventsCount).toBeGreaterThan(0);
      expect(peopleCount).toBeGreaterThan(0);
      
      // Join a recommended group
      await welcomeTutorialPage.joinRecommendedGroup(0);
      
      // Follow a recommended user
      await welcomeTutorialPage.followRecommendedUser(0);
      
      // Set notification preferences
      await welcomeTutorialPage.setNotificationPreferences({
        email: testUserData.emailNotifications,
        push: testUserData.pushNotifications,
        sms: testUserData.smsNotifications,
      });
      
      // Complete tutorial
      await welcomeTutorialPage.completeTutorial();
      
      // Check final progress (should be 100%)
      expect(await welcomeTutorialPage.getProgressPercentage()).toBe(100);
      
      // Start exploring
      await welcomeTutorialPage.startExploring();
      
      // Verify redirect to dashboard
      await page.waitForURL('**/dashboard');
      expect(page.url()).toContain('/dashboard');
    });
  });

  test('Step navigation - Back and forward', async ({ page }) => {
    // Fill Step 1
    await createAccountPage.fillAccountDetails({
      name: testUserData.name,
      username: testUserData.username,
      email: testUserData.email,
      password: testUserData.password,
    });
    await createAccountPage.acceptTermsAndPrivacy();
    await createAccountPage.continueToNextStep();
    
    // Navigate to Step 2
    await page.waitForLoadState('networkidle');
    expect(await profileDetailsPage.getProgressPercentage()).toBe(40);
    
    // Go back to Step 1
    await profileDetailsPage.goBack();
    await page.waitForLoadState('networkidle');
    expect(await createAccountPage.getProgressPercentage()).toBe(20);
    
    // Verify data persistence
    const nameValue = await createAccountPage.nameInput.inputValue();
    expect(nameValue).toBe(testUserData.name);
    
    // Go forward again
    await createAccountPage.continueToNextStep();
    await page.waitForLoadState('networkidle');
    expect(await profileDetailsPage.getProgressPercentage()).toBe(40);
  });

  test('Skip optional steps', async ({ page }) => {
    // Complete Step 1 (required)
    await createAccountPage.fillAccountDetails({
      name: testUserData.name,
      username: `skip_test_${Date.now()}`,
      email: `skip.test.${Date.now()}@example.com`,
      password: testUserData.password,
    });
    await createAccountPage.acceptTermsAndPrivacy();
    await createAccountPage.continueToNextStep();
    
    // Skip Step 2 (optional)
    await profileDetailsPage.skipStep();
    await page.waitForLoadState('networkidle');
    
    // Skip Step 3 (optional)
    await dancePreferencesPage.skipStep();
    await page.waitForLoadState('networkidle');
    
    // Skip Step 4 (optional)
    await locationSetupPage.skipStep();
    await page.waitForLoadState('networkidle');
    
    // Should reach Step 5
    const welcomeMessage = await welcomeTutorialPage.getWelcomeMessage();
    expect(welcomeMessage).toBeTruthy();
    
    // Skip tutorial
    await welcomeTutorialPage.skipTutorial();
    await welcomeTutorialPage.startExploring();
    
    // Should complete registration
    await page.waitForURL('**/dashboard');
  });

  test('Form validation - Invalid inputs', async ({ page }) => {
    // Test invalid email
    await createAccountPage.emailInput.fill('invalid-email');
    await createAccountPage.emailInput.blur();
    await page.waitForTimeout(500);
    let errorMessage = await createAccountPage.getErrorMessage();
    expect(errorMessage).toContain('valid email');
    
    // Test weak password
    await createAccountPage.passwordInput.fill('weak');
    await createAccountPage.passwordInput.blur();
    await page.waitForTimeout(500);
    const passwordStrength = await createAccountPage.checkPasswordStrength();
    expect(passwordStrength).toContain('Weak');
    
    // Test password mismatch
    await createAccountPage.passwordInput.fill(testUserData.password);
    await createAccountPage.confirmPasswordInput.fill('different-password');
    await createAccountPage.confirmPasswordInput.blur();
    await page.waitForTimeout(500);
    errorMessage = await createAccountPage.getErrorMessage();
    expect(errorMessage).toContain('match');
    
    // Test username too short
    await createAccountPage.usernameInput.fill('ab');
    await createAccountPage.usernameInput.blur();
    await page.waitForTimeout(500);
    errorMessage = await createAccountPage.getErrorMessage();
    expect(errorMessage).toContain('at least 3 characters');
    
    // Verify continue button is disabled
    expect(await createAccountPage.isFormValid()).toBe(false);
  });

  test('Username availability check', async ({ page }) => {
    // Test with existing username (simulate)
    await page.route('**/api/users/check-availability', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ available: false }),
      });
    });
    
    await createAccountPage.usernameInput.fill('existing_user');
    await page.waitForTimeout(1000); // Debounce delay
    
    const isAvailable = await createAccountPage.checkUsernameAvailability();
    expect(isAvailable).toBe(false);
    
    const errorMessage = await createAccountPage.getErrorMessage();
    expect(errorMessage).toContain('already taken');
  });

  test('Social signup options', async ({ page }) => {
    // Test Google signup
    await createAccountPage.attemptSocialSignup('google');
    // Should show coming soon toast
    await expect(page.locator('text=Google sign-up will be available soon')).toBeVisible();
    
    // Test Facebook signup
    await createAccountPage.attemptSocialSignup('facebook');
    // Should show coming soon toast
    await expect(page.locator('text=Facebook sign-up will be available soon')).toBeVisible();
  });

  test('Location with geolocation API', async ({ page, context }) => {
    // Complete steps 1-3 quickly
    await createAccountPage.fillAccountDetails({
      name: testUserData.name,
      username: `geo_test_${Date.now()}`,
      email: `geo.test.${Date.now()}@example.com`,
      password: testUserData.password,
    });
    await createAccountPage.acceptTermsAndPrivacy();
    await createAccountPage.continueToNextStep();
    await profileDetailsPage.skipStep();
    await dancePreferencesPage.skipStep();
    
    // Test geolocation
    await locationSetupPage.useCurrentLocation();
    await page.waitForTimeout(1000);
    
    // Verify map marker is placed
    expect(await locationSetupPage.hasMapMarker()).toBe(true);
    
    // Verify city is auto-filled
    const cityValue = await locationSetupPage.cityInput.inputValue();
    expect(cityValue).toContain('Buenos Aires');
  });

  test.describe('Accessibility Tests', () => {
    test('Step 1: Create Account - Accessibility', async ({ page }) => {
      // Run accessibility scan
      const results = await runAccessibilityScan(page, {
        includedImpacts: ['critical', 'serious'],
      });
      
      // Assert no violations
      await assertNoA11yViolations(page);
      
      // Check form labels
      await checkFormLabels(page);
      
      // Check heading hierarchy
      await checkHeadingHierarchy(page);
      
      // Test keyboard navigation
      await checkKeyboardNavigation(page, [
        '[data-testid="input-name"]',
        '[data-testid="input-username"]',
        '[data-testid="input-email"]',
        '[data-testid="input-password"]',
        '[data-testid="input-confirm-password"]',
        '[data-testid="checkbox-terms"]',
        '[data-testid="checkbox-privacy"]',
        '[data-testid="button-continue-step-1"]',
      ]);
      
      // Generate accessibility report
      await generateA11yReport(page, 'registration-step-1-a11y');
    });

    test('All steps - Accessibility compliance', async ({ page }) => {
      // Test each step for accessibility
      const steps = [
        { name: 'create-account', action: async () => {} },
        { 
          name: 'profile-details', 
          action: async () => {
            await createAccountPage.fillAccountDetails({
              name: testUserData.name,
              username: `a11y_test_${Date.now()}`,
              email: `a11y.test.${Date.now()}@example.com`,
              password: testUserData.password,
            });
            await createAccountPage.acceptTermsAndPrivacy();
            await createAccountPage.continueToNextStep();
          }
        },
        { 
          name: 'dance-preferences', 
          action: async () => {
            await profileDetailsPage.skipStep();
          }
        },
        { 
          name: 'location-setup', 
          action: async () => {
            await dancePreferencesPage.skipStep();
          }
        },
        { 
          name: 'welcome-tutorial', 
          action: async () => {
            await locationSetupPage.skipStep();
          }
        },
      ];
      
      for (const step of steps) {
        await step.action();
        await page.waitForLoadState('networkidle');
        
        // Run accessibility checks
        await assertNoA11yViolations(page, {
          skipImpacts: ['minor'],
        });
        
        // Generate report for each step
        await generateA11yReport(page, `registration-${step.name}-a11y`);
      }
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('All steps - Visual snapshots', async ({ page }) => {
      // Hide dynamic elements
      await hideDynamicElements(page);
      
      // Step 1: Create Account
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Step 1 - Create Account');
      
      // Fill and move to Step 2
      await createAccountPage.fillAccountDetails({
        name: testUserData.name,
        username: `visual_test_${Date.now()}`,
        email: `visual.test.${Date.now()}@example.com`,
        password: testUserData.password,
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      
      // Step 2: Profile Details
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Step 2 - Profile Details');
      await profileDetailsPage.skipStep();
      
      // Step 3: Dance Preferences
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Step 3 - Dance Preferences');
      await dancePreferencesPage.skipStep();
      
      // Step 4: Location Setup
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Step 4 - Location Setup');
      await locationSetupPage.skipStep();
      
      // Step 5: Welcome & Tutorial
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Step 5 - Welcome Tutorial');
    });

    test('Dark mode - Registration flow', async ({ page }) => {
      // Test dark mode for registration
      await testDarkMode(page, 'registration-create-account');
      
      // Test with filled form
      await createAccountPage.fillAccountDetails({
        name: testUserData.name,
        username: testUserData.username,
        email: testUserData.email,
        password: testUserData.password,
      });
      
      await testDarkMode(page, 'registration-create-account-filled');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('iPhone 12 - Registration flow', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();
      
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');
      
      // Verify mobile layout
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
      
      // Test touch interactions
      await page.tap('[data-testid="input-name"]');
      await page.type('[data-testid="input-name"]', testUserData.name);
      
      // Test mobile-specific UI elements
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.tap();
      }
      
      // Take mobile screenshots
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Mobile - iPhone 12');
      
      await context.close();
    });

    test('iPad - Registration flow', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
      });
      const page = await context.newPage();
      
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');
      
      // Verify tablet layout
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeGreaterThanOrEqual(768);
      expect(viewport?.width).toBeLessThan(1280);
      
      // Test tablet interactions
      await stabilizePage(page);
      await takePercySnapshot(page, 'Registration - Tablet - iPad');
      
      await context.close();
    });

    test('Responsive screenshots - All devices', async ({ page }) => {
      await takeResponsiveScreenshots(page, 'registration-responsive', [
        { width: 375, height: 667, label: 'mobile-small' },
        { width: 414, height: 896, label: 'mobile-large' },
        { width: 768, height: 1024, label: 'tablet-portrait' },
        { width: 1024, height: 768, label: 'tablet-landscape' },
        { width: 1280, height: 720, label: 'desktop-hd' },
        { width: 1920, height: 1080, label: 'desktop-full-hd' },
        { width: 2560, height: 1440, label: 'desktop-2k' },
      ]);
    });
  });

  test.describe('Data Persistence', () => {
    test('Form data persists across navigation', async ({ page }) => {
      // Fill Step 1
      const userData = {
        name: 'Test Persistence',
        username: `persist_test_${Date.now()}`,
        email: `persist.test.${Date.now()}@example.com`,
        password: testUserData.password,
      };
      
      await createAccountPage.fillAccountDetails(userData);
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      
      // Fill Step 2
      const profileData = {
        bio: 'Test bio for persistence',
        birthDate: '1995-01-01',
        gender: 'male',
      };
      
      await profileDetailsPage.fillProfileDetails(profileData);
      await profileDetailsPage.continueToNextStep();
      
      // Go back to Step 1
      await dancePreferencesPage.goBack();
      await profileDetailsPage.goBack();
      
      // Verify Step 1 data persists
      expect(await createAccountPage.nameInput.inputValue()).toBe(userData.name);
      expect(await createAccountPage.usernameInput.inputValue()).toBe(userData.username);
      expect(await createAccountPage.emailInput.inputValue()).toBe(userData.email);
      expect(await createAccountPage.termsCheckbox.isChecked()).toBe(true);
      
      // Go forward to Step 2
      await createAccountPage.continueToNextStep();
      
      // Verify Step 2 data persists
      expect(await profileDetailsPage.bioTextarea.inputValue()).toBe(profileData.bio);
      expect(await profileDetailsPage.birthDateInput.inputValue()).toBe(profileData.birthDate);
      expect(await profileDetailsPage.genderSelect.inputValue()).toBe(profileData.gender);
    });

    test('Session storage maintains progress', async ({ page }) => {
      // Start registration
      await createAccountPage.fillAccountDetails({
        name: testUserData.name,
        username: `session_test_${Date.now()}`,
        email: `session.test.${Date.now()}@example.com`,
        password: testUserData.password,
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      await profileDetailsPage.skipStep();
      
      // Get current progress
      const progress = await dancePreferencesPage.getProgressPercentage();
      expect(progress).toBe(60);
      
      // Simulate page refresh
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should maintain current step
      const progressAfterReload = await dancePreferencesPage.getProgressPercentage();
      expect(progressAfterReload).toBe(60);
    });
  });

  test.describe('Error Handling', () => {
    test('Network error during registration', async ({ page }) => {
      // Fill form
      await createAccountPage.fillAccountDetails({
        name: testUserData.name,
        username: `network_test_${Date.now()}`,
        email: `network.test.${Date.now()}@example.com`,
        password: testUserData.password,
      });
      await createAccountPage.acceptTermsAndPrivacy();
      
      // Simulate network error
      await page.route('**/api/auth/register', route => {
        route.abort('failed');
      });
      
      // Try to submit
      await createAccountPage.continueToNextStep();
      
      // Should show error message
      await page.waitForSelector('[data-testid="error-message"]');
      const errorMessage = await createAccountPage.getErrorMessage();
      expect(errorMessage).toContain('network');
    });

    test('Server validation errors', async ({ page }) => {
      // Mock server validation error
      await page.route('**/api/auth/register', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Email already exists',
            field: 'email',
          }),
        });
      });
      
      // Fill and submit form
      await createAccountPage.fillAccountDetails({
        name: testUserData.name,
        username: `server_test_${Date.now()}`,
        email: 'existing@example.com',
        password: testUserData.password,
      });
      await createAccountPage.acceptTermsAndPrivacy();
      await createAccountPage.continueToNextStep();
      
      // Should show server error
      await page.waitForSelector('[data-testid="error-message"]');
      const errorMessage = await createAccountPage.getErrorMessage();
      expect(errorMessage).toContain('Email already exists');
    });
  });

  test.describe('Performance', () => {
    test('Registration flow performance metrics', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Measure form interaction responsiveness
      const inputStartTime = Date.now();
      await createAccountPage.nameInput.fill('Test User');
      const inputResponseTime = Date.now() - inputStartTime;
      
      // Input should be responsive (< 100ms)
      expect(inputResponseTime).toBeLessThan(100);
      
      // Check for memory leaks during navigation
      const metrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });
      
      if (metrics) {
        // Initial memory usage
        const initialMemory = metrics.usedJSHeapSize;
        
        // Navigate through all steps
        await createAccountPage.fillAccountDetails({
          name: testUserData.name,
          username: `perf_test_${Date.now()}`,
          email: `perf.test.${Date.now()}@example.com`,
          password: testUserData.password,
        });
        await createAccountPage.acceptTermsAndPrivacy();
        await createAccountPage.continueToNextStep();
        await profileDetailsPage.skipStep();
        await dancePreferencesPage.skipStep();
        await locationSetupPage.skipStep();
        
        // Final memory usage
        const finalMetrics = await page.evaluate(() => {
          if ('memory' in performance) {
            return (performance as any).memory;
          }
          return null;
        });
        
        if (finalMetrics) {
          const memoryIncrease = finalMetrics.usedJSHeapSize - initialMemory;
          // Memory increase should be reasonable (< 50MB)
          expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        }
      }
    });
  });
});