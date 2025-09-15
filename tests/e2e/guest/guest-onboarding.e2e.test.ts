import { test, expect, devices } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import { AccommodationStep } from '../pages/guest-onboarding/AccommodationStep';
import { DietaryStep } from '../pages/guest-onboarding/DietaryStep';
import { LanguagesInterestsStep } from '../pages/guest-onboarding/LanguagesInterestsStep';
import { LocationDurationStep } from '../pages/guest-onboarding/LocationDurationStep';
import { BudgetStep } from '../pages/guest-onboarding/BudgetStep';
import { EmergencyContactStep } from '../pages/guest-onboarding/EmergencyContactStep';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Test data fixtures
const testData = {
  accommodation: {
    propertyTypes: ['Apartment', 'Loft'],
    roomTypes: ['Private room'],
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Workspace']
  },
  dietary: {
    restrictions: ['Vegetarian', 'Gluten-free'],
    specialNeeds: 'I need wheelchair accessible accommodations and prefer ground floor rooms.'
  },
  languagesInterests: {
    languages: ['English', 'Spanish', 'Portuguese'],
    interests: ['Tango Dancing', 'Food Tours', 'Wine Tasting', 'Local Markets']
  },
  location: {
    neighborhoods: ['Palermo', 'Recoleta', 'San Telmo'],
    duration: 'medium'
  },
  budget: {
    currency: 'USD',
    min: 50,
    max: 150
  },
  emergencyContact: {
    name: 'Jane Smith',
    phone: '+1 234 567 8900',
    relationship: 'Spouse',
    email: 'jane.smith@example.com',
    alternatePhone: '+1 234 567 8901',
    notes: 'Available 24/7 for emergencies'
  }
};

test.describe('Guest Onboarding E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/guest-onboarding-entrance`);
    
    // Click "Get Started" to begin onboarding
    await page.locator('[data-testid="button-start-onboarding"]').click();
    await page.waitForURL('**/guest-onboarding');
  });

  test.describe('Complete Onboarding Flow', () => {
    test('should complete all 6 steps successfully', async ({ page }) => {
      // Step 1: Accommodation Preferences
      const accommodationStep = new AccommodationStep(page);
      await expect(accommodationStep.stepTitle).toHaveText('Accommodation Preferences');
      await accommodationStep.selectPropertyTypes(testData.accommodation.propertyTypes);
      await accommodationStep.selectRoomTypes(testData.accommodation.roomTypes);
      await accommodationStep.selectAmenities(testData.accommodation.amenities);
      
      // Take Percy snapshot for Step 1
      await percySnapshot(page, 'Guest Onboarding - Step 1 - Accommodation');
      
      // Check accessibility for Step 1
      await accommodationStep.checkAccessibility();
      
      await accommodationStep.continueToNextStep();

      // Step 2: Dietary Preferences
      const dietaryStep = new DietaryStep(page);
      await expect(dietaryStep.stepTitle).toHaveText('Dietary Preferences');
      await dietaryStep.selectDietaryRestrictions(testData.dietary.restrictions);
      await dietaryStep.enterSpecialNeeds(testData.dietary.specialNeeds);
      
      // Take Percy snapshot for Step 2
      await percySnapshot(page, 'Guest Onboarding - Step 2 - Dietary');
      
      // Check accessibility for Step 2
      await dietaryStep.checkAccessibility();
      
      await dietaryStep.continueToNextStep();

      // Step 3: Languages & Interests
      const languagesStep = new LanguagesInterestsStep(page);
      await expect(languagesStep.stepTitle).toHaveText('Languages & Interests');
      await languagesStep.selectLanguages(testData.languagesInterests.languages);
      await languagesStep.selectInterests(testData.languagesInterests.interests);
      
      // Take Percy snapshot for Step 3
      await percySnapshot(page, 'Guest Onboarding - Step 3 - Languages & Interests');
      
      // Check accessibility for Step 3
      await languagesStep.checkAccessibility();
      
      await languagesStep.continueToNextStep();

      // Step 4: Location & Duration
      const locationStep = new LocationDurationStep(page);
      await expect(locationStep.stepTitle).toHaveText('Location & Duration');
      await locationStep.selectNeighborhoods(testData.location.neighborhoods);
      await locationStep.selectStayDuration(testData.location.duration);
      
      // Take Percy snapshot for Step 4
      await percySnapshot(page, 'Guest Onboarding - Step 4 - Location');
      
      // Check accessibility for Step 4
      await locationStep.checkAccessibility();
      
      await locationStep.continueToNextStep();

      // Step 5: Budget Range
      const budgetStep = new BudgetStep(page);
      await expect(budgetStep.stepTitle).toHaveText('Budget Range');
      await budgetStep.selectCurrency(testData.budget.currency);
      await budgetStep.setBudgetRange(testData.budget.min, testData.budget.max);
      
      // Take Percy snapshot for Step 5
      await percySnapshot(page, 'Guest Onboarding - Step 5 - Budget');
      
      // Check accessibility for Step 5
      await budgetStep.checkAccessibility();
      
      await budgetStep.continueToNextStep();

      // Step 6: Emergency Contact
      const emergencyStep = new EmergencyContactStep(page);
      await expect(emergencyStep.stepTitle).toHaveText('Emergency Contact');
      await emergencyStep.fillEmergencyContact(testData.emergencyContact);
      
      // Take Percy snapshot for Step 6
      await percySnapshot(page, 'Guest Onboarding - Step 6 - Emergency Contact');
      
      // Check accessibility for Step 6
      await emergencyStep.checkAccessibility();
      
      // Complete onboarding
      await emergencyStep.completeOnboarding();
      
      // Verify successful completion
      await expect(page).toHaveURL(/\/(profile|dashboard|community)/);
      await expect(page.locator('[data-testid="toast-success"]')).toHaveText(/Profile Created|Welcome/i);
    });

    test('should persist data when navigating between steps', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      const dietaryStep = new DietaryStep(page);
      
      // Fill Step 1
      await accommodationStep.selectPropertyTypes(['Apartment']);
      await accommodationStep.selectRoomTypes(['Private room']);
      await accommodationStep.continueToNextStep();
      
      // Fill Step 2
      await dietaryStep.selectDietaryRestrictions(['Vegan']);
      await dietaryStep.enterSpecialNeeds('Test notes');
      
      // Go back to Step 1
      await dietaryStep.goBackToPreviousStep();
      
      // Verify Step 1 data is preserved
      const selectedPropertyTypes = await accommodationStep.getSelectedPropertyTypes();
      expect(selectedPropertyTypes).toContain('apartment');
      
      const selectedRoomTypes = await accommodationStep.getSelectedRoomTypes();
      expect(selectedRoomTypes).toContain('private');
      
      // Go forward to Step 2
      await accommodationStep.continueToNextStep();
      
      // Verify Step 2 data is preserved
      const selectedRestrictions = await dietaryStep.getSelectedDietaryRestrictions();
      expect(selectedRestrictions).toContain('vegan');
      
      const specialNeeds = await dietaryStep.getSpecialNeeds();
      expect(specialNeeds).toBe('Test notes');
    });

    test('should show progress bar correctly for each step', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      const dietaryStep = new DietaryStep(page);
      const languagesStep = new LanguagesInterestsStep(page);
      const locationStep = new LocationDurationStep(page);
      const budgetStep = new BudgetStep(page);
      const emergencyStep = new EmergencyContactStep(page);
      
      // Step 1 - should show ~17% progress
      let progress = await accommodationStep.getProgressPercentage();
      expect(progress).toBeGreaterThanOrEqual(15);
      expect(progress).toBeLessThanOrEqual(20);
      
      await accommodationStep.selectPropertyTypes(['House']);
      await accommodationStep.selectRoomTypes(['Entire place']);
      await accommodationStep.continueToNextStep();
      
      // Step 2 - should show ~33% progress
      progress = await dietaryStep.getProgressPercentage();
      expect(progress).toBeGreaterThanOrEqual(30);
      expect(progress).toBeLessThanOrEqual(35);
      
      await dietaryStep.continueToNextStep();
      
      // Step 3 - should show ~50% progress
      progress = await languagesStep.getProgressPercentage();
      expect(progress).toBeGreaterThanOrEqual(48);
      expect(progress).toBeLessThanOrEqual(52);
      
      await languagesStep.selectLanguages(['English']);
      await languagesStep.selectInterests(['Museums']);
      await languagesStep.continueToNextStep();
      
      // Step 4 - should show ~67% progress
      progress = await locationStep.getProgressPercentage();
      expect(progress).toBeGreaterThanOrEqual(65);
      expect(progress).toBeLessThanOrEqual(70);
      
      await locationStep.selectNeighborhoods(['Palermo']);
      await locationStep.selectStayDuration('short');
      await locationStep.continueToNextStep();
      
      // Step 5 - should show ~83% progress
      progress = await budgetStep.getProgressPercentage();
      expect(progress).toBeGreaterThanOrEqual(80);
      expect(progress).toBeLessThanOrEqual(85);
      
      await budgetStep.selectCurrency('USD');
      await budgetStep.setBudgetRange(100, 200);
      await budgetStep.continueToNextStep();
      
      // Step 6 - should show 100% progress
      progress = await emergencyStep.getProgressPercentage();
      expect(progress).toBe(100);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields in accommodation step', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      
      // Try to continue without selecting anything
      await accommodationStep.continueToNextStep();
      
      // Should show validation errors
      await expect(page.locator('[data-testid="error-property-types"]')).toHaveText(/Please select at least one property type/i);
      await expect(page.locator('[data-testid="error-room-types"]')).toHaveText(/Please select at least one room type/i);
      
      // Should not navigate to next step
      await expect(accommodationStep.stepTitle).toHaveText('Accommodation Preferences');
    });

    test('should validate phone number format in emergency contact step', async ({ page }) => {
      // Navigate to emergency contact step
      const accommodationStep = new AccommodationStep(page);
      await accommodationStep.selectPropertyTypes(['Apartment']);
      await accommodationStep.selectRoomTypes(['Private room']);
      await accommodationStep.continueToNextStep();
      
      const dietaryStep = new DietaryStep(page);
      await dietaryStep.continueToNextStep();
      
      const languagesStep = new LanguagesInterestsStep(page);
      await languagesStep.selectLanguages(['English']);
      await languagesStep.selectInterests(['Museums']);
      await languagesStep.continueToNextStep();
      
      const locationStep = new LocationDurationStep(page);
      await locationStep.selectNeighborhoods(['Palermo']);
      await locationStep.selectStayDuration('short');
      await locationStep.continueToNextStep();
      
      const budgetStep = new BudgetStep(page);
      await budgetStep.selectCurrency('USD');
      await budgetStep.setBudgetRange(100, 200);
      await budgetStep.continueToNextStep();
      
      const emergencyStep = new EmergencyContactStep(page);
      
      // Test invalid phone numbers
      await emergencyStep.fillEmergencyContact({
        name: 'Test Name',
        phone: 'invalid-phone',
        relationship: 'Friend'
      });
      
      await emergencyStep.completeOnboarding();
      
      // Should show validation error
      await expect(page.locator('[data-testid="error-emergency-phone"]')).toHaveText(/Invalid phone number format/i);
    });

    test('should validate budget range', async ({ page }) => {
      // Navigate to budget step quickly
      const steps = [
        new AccommodationStep(page),
        new DietaryStep(page),
        new LanguagesInterestsStep(page),
        new LocationDurationStep(page)
      ];
      
      // Quick navigation through steps
      await steps[0].selectPropertyTypes(['Apartment']);
      await steps[0].selectRoomTypes(['Private room']);
      await steps[0].continueToNextStep();
      
      await steps[1].continueToNextStep();
      
      await steps[2].selectLanguages(['English']);
      await steps[2].selectInterests(['Museums']);
      await steps[2].continueToNextStep();
      
      await steps[3].selectNeighborhoods(['Palermo']);
      await steps[3].selectStayDuration('short');
      await steps[3].continueToNextStep();
      
      const budgetStep = new BudgetStep(page);
      
      // Test max < min
      await budgetStep.selectCurrency('USD');
      await budgetStep.setMinBudget(200);
      await budgetStep.setMaxBudget(100);
      await budgetStep.continueToNextStep();
      
      // Should show validation error
      await expect(page.locator('[data-testid="error-budget-range"]')).toHaveText(/Maximum budget must be greater than or equal to minimum budget/i);
      
      // Test negative values
      await budgetStep.setMinBudget(-50);
      await budgetStep.setMaxBudget(-10);
      await budgetStep.continueToNextStep();
      
      // Should show validation error
      await expect(page.locator('[data-testid="error-budget-negative"]')).toHaveText(/Budget must be greater than 0/i);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices - iPhone 12', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12']
      });
      const page = await context.newPage();
      
      await page.goto(`${BASE_URL}/guest-onboarding-entrance`);
      await page.locator('[data-testid="button-start-onboarding"]').click();
      
      const accommodationStep = new AccommodationStep(page);
      
      // Check mobile layout
      await expect(accommodationStep.stepTitle).toBeVisible();
      await expect(accommodationStep.progressBar).toBeVisible();
      
      // Test touch interactions
      await accommodationStep.apartmentCheckbox.tap();
      await accommodationStep.entirePlaceCheckbox.tap();
      
      // Scroll to see more options
      await page.evaluate(() => window.scrollBy(0, 300));
      
      await accommodationStep.wifiCheckbox.tap();
      await accommodationStep.kitchenCheckbox.tap();
      
      // Take mobile snapshot
      await percySnapshot(page, 'Guest Onboarding - Mobile - iPhone 12');
      
      // Navigate should work
      await accommodationStep.continueToNextStep();
      
      const dietaryStep = new DietaryStep(page);
      await expect(dietaryStep.stepTitle).toBeVisible();
      
      await context.close();
    });

    test('should work on tablet devices - iPad Pro', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad Pro']
      });
      const page = await context.newPage();
      
      await page.goto(`${BASE_URL}/guest-onboarding-entrance`);
      await page.locator('[data-testid="button-start-onboarding"]').click();
      
      const accommodationStep = new AccommodationStep(page);
      
      // Check tablet layout
      await expect(accommodationStep.stepTitle).toBeVisible();
      await expect(accommodationStep.progressBar).toBeVisible();
      
      // Test that multiple columns are visible on tablet
      const propertyTypesBox = await accommodationStep.propertyTypesSection.boundingBox();
      expect(propertyTypesBox?.width).toBeGreaterThan(600);
      
      // Take tablet snapshot
      await percySnapshot(page, 'Guest Onboarding - Tablet - iPad Pro');
      
      await context.close();
    });

    test('should handle landscape orientation', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12 Pro Max landscape']
      });
      const page = await context.newPage();
      
      await page.goto(`${BASE_URL}/guest-onboarding-entrance`);
      await page.locator('[data-testid="button-start-onboarding"]').click();
      
      const accommodationStep = new AccommodationStep(page);
      
      // Check landscape layout
      await expect(accommodationStep.stepTitle).toBeVisible();
      
      // Take landscape snapshot
      await percySnapshot(page, 'Guest Onboarding - Mobile Landscape');
      
      await context.close();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have no accessibility violations on all steps', async ({ page }) => {
      // Inject axe for accessibility testing
      await injectAxe(page);
      
      // Test Step 1
      const accommodationStep = new AccommodationStep(page);
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
      
      await accommodationStep.selectPropertyTypes(['Apartment']);
      await accommodationStep.selectRoomTypes(['Private room']);
      await accommodationStep.continueToNextStep();
      
      // Test Step 2
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
      
      const dietaryStep = new DietaryStep(page);
      await dietaryStep.continueToNextStep();
      
      // Test Step 3
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
      
      const languagesStep = new LanguagesInterestsStep(page);
      await languagesStep.selectLanguages(['English']);
      await languagesStep.selectInterests(['Museums']);
      await languagesStep.continueToNextStep();
      
      // Test Step 4
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
      
      const locationStep = new LocationDurationStep(page);
      await locationStep.selectNeighborhoods(['Palermo']);
      await locationStep.selectStayDuration('short');
      await locationStep.continueToNextStep();
      
      // Test Step 5
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
      
      const budgetStep = new BudgetStep(page);
      await budgetStep.selectCurrency('USD');
      await budgetStep.setBudgetRange(100, 200);
      await budgetStep.continueToNextStep();
      
      // Test Step 6
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
    });

    test('should support keyboard navigation', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      
      // Tab to first checkbox
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Select with space
      await page.keyboard.press('Space');
      
      // Verify selection
      const isChecked = await accommodationStep.apartmentCheckbox.isChecked();
      expect(isChecked).toBe(true);
      
      // Tab to continue button
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Press Enter to continue
      await page.keyboard.press('Enter');
      
      // Should show validation since room type not selected
      await expect(page.locator('[data-testid="error-room-types"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      
      // Check ARIA labels
      await expect(accommodationStep.progressBar).toHaveAttribute('role', 'progressbar');
      await expect(accommodationStep.progressBar).toHaveAttribute('aria-label', /Step 1 of 6/i);
      
      await expect(accommodationStep.apartmentCheckbox).toHaveAttribute('aria-label', /Apartment/i);
      await expect(accommodationStep.continueButton).toHaveAttribute('aria-label', /Continue to next step/i);
      await expect(accommodationStep.backButton).toHaveAttribute('aria-label', /Go back to previous step/i);
    });
  });

  test.describe('Error Recovery', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/guest-profile', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // Complete all steps
      const accommodationStep = new AccommodationStep(page);
      await accommodationStep.selectPropertyTypes(['Apartment']);
      await accommodationStep.selectRoomTypes(['Private room']);
      await accommodationStep.continueToNextStep();
      
      const dietaryStep = new DietaryStep(page);
      await dietaryStep.continueToNextStep();
      
      const languagesStep = new LanguagesInterestsStep(page);
      await languagesStep.selectLanguages(['English']);
      await languagesStep.selectInterests(['Museums']);
      await languagesStep.continueToNextStep();
      
      const locationStep = new LocationDurationStep(page);
      await locationStep.selectNeighborhoods(['Palermo']);
      await locationStep.selectStayDuration('short');
      await locationStep.continueToNextStep();
      
      const budgetStep = new BudgetStep(page);
      await budgetStep.selectCurrency('USD');
      await budgetStep.setBudgetRange(100, 200);
      await budgetStep.continueToNextStep();
      
      const emergencyStep = new EmergencyContactStep(page);
      await emergencyStep.fillEmergencyContact({
        name: 'Test Contact',
        phone: '+1234567890',
        relationship: 'Friend'
      });
      
      await emergencyStep.completeOnboarding();
      
      // Should show error message
      await expect(page.locator('[data-testid="toast-error"]')).toHaveText(/Failed to save your profile/i);
      
      // Should remain on last step
      await expect(emergencyStep.stepTitle).toHaveText('Emergency Contact');
    });

    test('should handle network interruption', async ({ page, context }) => {
      const accommodationStep = new AccommodationStep(page);
      await accommodationStep.selectPropertyTypes(['Apartment']);
      await accommodationStep.selectRoomTypes(['Private room']);
      
      // Simulate offline
      await context.setOffline(true);
      
      await accommodationStep.continueToNextStep();
      
      // Should show offline message
      await expect(page.locator('[data-testid="offline-banner"]')).toHaveText(/You are offline/i);
      
      // Go back online
      await context.setOffline(false);
      
      // Should be able to continue
      await accommodationStep.continueToNextStep();
      
      const dietaryStep = new DietaryStep(page);
      await expect(dietaryStep.stepTitle).toBeVisible();
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should capture visual snapshots for all steps', async ({ page }) => {
      // Step 1 - Empty state
      await percySnapshot(page, 'Guest Onboarding - Step 1 - Empty');
      
      const accommodationStep = new AccommodationStep(page);
      await accommodationStep.selectPropertyTypes(['Apartment', 'House']);
      await accommodationStep.selectRoomTypes(['Entire place']);
      await accommodationStep.selectAmenities(['WiFi', 'Kitchen', 'Parking']);
      
      // Step 1 - Filled state
      await percySnapshot(page, 'Guest Onboarding - Step 1 - Filled');
      
      await accommodationStep.continueToNextStep();
      
      // Step 2 - Empty state
      await percySnapshot(page, 'Guest Onboarding - Step 2 - Empty');
      
      const dietaryStep = new DietaryStep(page);
      await dietaryStep.selectDietaryRestrictions(['Vegetarian', 'Gluten-free']);
      await dietaryStep.enterSpecialNeeds('Special requirements text');
      
      // Step 2 - Filled state
      await percySnapshot(page, 'Guest Onboarding - Step 2 - Filled');
      
      await dietaryStep.continueToNextStep();
      
      // Continue for all steps...
      const languagesStep = new LanguagesInterestsStep(page);
      await percySnapshot(page, 'Guest Onboarding - Step 3 - Empty');
      await languagesStep.selectLanguages(['English', 'Spanish']);
      await languagesStep.selectInterests(['Tango Dancing', 'Museums']);
      await percySnapshot(page, 'Guest Onboarding - Step 3 - Filled');
      await languagesStep.continueToNextStep();
      
      const locationStep = new LocationDurationStep(page);
      await percySnapshot(page, 'Guest Onboarding - Step 4 - Empty');
      await locationStep.selectNeighborhoods(['Palermo', 'Recoleta']);
      await locationStep.selectStayDuration('medium');
      await percySnapshot(page, 'Guest Onboarding - Step 4 - Filled');
      await locationStep.continueToNextStep();
      
      const budgetStep = new BudgetStep(page);
      await percySnapshot(page, 'Guest Onboarding - Step 5 - Empty');
      await budgetStep.selectCurrency('USD');
      await budgetStep.setBudgetRange(75, 125);
      await percySnapshot(page, 'Guest Onboarding - Step 5 - Filled');
      await budgetStep.continueToNextStep();
      
      const emergencyStep = new EmergencyContactStep(page);
      await percySnapshot(page, 'Guest Onboarding - Step 6 - Empty');
      await emergencyStep.fillEmergencyContact({
        name: 'Emergency Contact',
        phone: '+1234567890',
        relationship: 'Family',
        email: 'emergency@example.com'
      });
      await percySnapshot(page, 'Guest Onboarding - Step 6 - Filled');
    });

    test('should capture error states visually', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      
      // Try to continue without selection
      await accommodationStep.continueToNextStep();
      
      // Capture validation error state
      await percySnapshot(page, 'Guest Onboarding - Validation Errors');
    });
  });

  test.describe('Performance Tests', () => {
    test('should load onboarding flow within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/guest-onboarding`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('should transition between steps quickly', async ({ page }) => {
      const accommodationStep = new AccommodationStep(page);
      await accommodationStep.selectPropertyTypes(['Apartment']);
      await accommodationStep.selectRoomTypes(['Private room']);
      
      const startTime = Date.now();
      await accommodationStep.continueToNextStep();
      const transitionTime = Date.now() - startTime;
      
      expect(transitionTime).toBeLessThan(500);
    });
  });
});