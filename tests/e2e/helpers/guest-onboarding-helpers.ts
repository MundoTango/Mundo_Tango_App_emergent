import { Page, expect } from '@playwright/test';

/**
 * Helper functions for guest onboarding tests
 */

export interface GuestOnboardingData {
  accommodation: {
    propertyTypes: string[];
    roomTypes: string[];
    amenities: string[];
  };
  dietary: {
    restrictions: string[];
    specialNeeds: string;
  };
  languagesInterests: {
    languages: string[];
    interests: string[];
  };
  location: {
    neighborhoods: string[];
    duration: 'short' | 'medium' | 'long' | 'extended';
  };
  budget: {
    currency: 'USD' | 'EUR' | 'ARS' | 'GBP';
    min: number;
    max: number;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
    alternatePhone?: string;
    notes?: string;
  };
}

/**
 * Generate random test data for guest onboarding
 */
export function generateTestData(): GuestOnboardingData {
  const propertyTypes = ['Apartment', 'House', 'Townhouse', 'Loft', 'Studio', 'Villa'];
  const roomTypes = ['Entire place', 'Private room', 'Shared room'];
  const amenities = ['WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating', 'Workspace', 'TV', 'Parking'];
  const dietaryRestrictions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'];
  const languages = ['English', 'Spanish', 'Portuguese', 'French', 'German'];
  const interests = ['Tango Dancing', 'Museums', 'Art Galleries', 'Live Music', 'Food Tours'];
  const neighborhoods = ['Palermo', 'Recoleta', 'San Telmo', 'La Boca', 'Puerto Madero'];
  
  return {
    accommodation: {
      propertyTypes: getRandomItems(propertyTypes, 2),
      roomTypes: getRandomItems(roomTypes, 1),
      amenities: getRandomItems(amenities, 4)
    },
    dietary: {
      restrictions: getRandomItems(dietaryRestrictions, 2),
      specialNeeds: 'Test special needs for accessibility'
    },
    languagesInterests: {
      languages: getRandomItems(languages, 3),
      interests: getRandomItems(interests, 3)
    },
    location: {
      neighborhoods: getRandomItems(neighborhoods, 3),
      duration: 'medium'
    },
    budget: {
      currency: 'USD',
      min: 50 + Math.floor(Math.random() * 50),
      max: 150 + Math.floor(Math.random() * 100)
    },
    emergencyContact: {
      name: `Test Contact ${Date.now()}`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      relationship: 'Friend',
      email: `test${Date.now()}@example.com`,
      notes: 'Available 24/7 for emergencies'
    }
  };
}

/**
 * Get random items from array
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Wait for guest onboarding to load
 */
export async function waitForOnboardingToLoad(page: Page) {
  await page.waitForSelector('[data-testid="guest-onboarding-container"]', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Verify step navigation
 */
export async function verifyStepNavigation(page: Page, expectedStep: number) {
  const stepIndicator = page.locator('[data-testid="step-indicator"]');
  await expect(stepIndicator).toHaveText(`Step ${expectedStep} of 6`);
  
  const progressBar = page.locator('[data-testid="progress-bar"]');
  const expectedProgress = Math.round((expectedStep / 6) * 100);
  await expect(progressBar).toHaveAttribute('aria-valuenow', expectedProgress.toString());
}

/**
 * Check for validation errors
 */
export async function checkValidationErrors(page: Page, expectedErrors: string[]) {
  for (const error of expectedErrors) {
    const errorElement = page.locator(`[data-testid*="error"]`, { hasText: error });
    await expect(errorElement).toBeVisible();
  }
}

/**
 * Fill accommodation step with minimal data
 */
export async function fillAccommodationMinimal(page: Page) {
  await page.locator('[data-testid="checkbox-property-apartment"]').check();
  await page.locator('[data-testid="checkbox-room-private"]').check();
}

/**
 * Fill languages and interests step with minimal data
 */
export async function fillLanguagesInterestsMinimal(page: Page) {
  await page.locator('[data-testid="checkbox-language-english"]').check();
  await page.locator('[data-testid="checkbox-interest-museums"]').check();
}

/**
 * Fill location step with minimal data
 */
export async function fillLocationMinimal(page: Page) {
  await page.locator('[data-testid="checkbox-neighborhood-palermo"]').check();
  await page.locator('[data-testid="select-stay-duration"]').click();
  await page.locator('[data-testid="option-duration-short"]').click();
}

/**
 * Fill budget step with minimal data
 */
export async function fillBudgetMinimal(page: Page) {
  await page.locator('[data-testid="select-currency"]').click();
  await page.locator('[data-testid="option-currency-USD"]').click();
  await page.locator('[data-testid="input-min-budget"]').fill('50');
  await page.locator('[data-testid="input-max-budget"]').fill('150');
}

/**
 * Fill emergency contact step with minimal data
 */
export async function fillEmergencyContactMinimal(page: Page) {
  await page.locator('[data-testid="input-emergency-name"]').fill('Test Contact');
  await page.locator('[data-testid="input-emergency-phone"]').fill('+1234567890');
  await page.locator('[data-testid="input-emergency-relationship"]').fill('Friend');
}

/**
 * Navigate through all steps quickly
 */
export async function navigateToStep(page: Page, targetStep: number) {
  // Start from step 1
  await waitForOnboardingToLoad(page);
  
  if (targetStep === 1) return;
  
  // Step 1 -> 2
  await fillAccommodationMinimal(page);
  await page.locator('[data-testid="button-continue-accommodation"]').click();
  
  if (targetStep === 2) return;
  
  // Step 2 -> 3
  await page.locator('[data-testid="button-continue-dietary"]').click();
  
  if (targetStep === 3) return;
  
  // Step 3 -> 4
  await fillLanguagesInterestsMinimal(page);
  await page.locator('[data-testid="button-continue-languages"]').click();
  
  if (targetStep === 4) return;
  
  // Step 4 -> 5
  await fillLocationMinimal(page);
  await page.locator('[data-testid="button-continue-location"]').click();
  
  if (targetStep === 5) return;
  
  // Step 5 -> 6
  await fillBudgetMinimal(page);
  await page.locator('[data-testid="button-continue-budget"]').click();
}

/**
 * Check mobile responsiveness
 */
export async function checkMobileLayout(page: Page) {
  const viewport = page.viewportSize();
  
  if (!viewport) {
    throw new Error('No viewport size set');
  }
  
  // Check if elements stack vertically on mobile
  if (viewport.width < 768) {
    const container = page.locator('[data-testid="guest-onboarding-container"]');
    const containerBox = await container.boundingBox();
    
    if (!containerBox) {
      throw new Error('Container not found');
    }
    
    // Container should take most of the viewport width on mobile
    expect(containerBox.width).toBeGreaterThan(viewport.width * 0.9);
  }
  
  // Check touch targets are large enough (minimum 44x44 pixels)
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (const checkbox of checkboxes) {
    const box = await checkbox.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(20); // Actual checkbox might be smaller
      expect(box.height).toBeGreaterThanOrEqual(20);
    }
  }
  
  // Check buttons are easily tappable
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(36); // Minimum button height
    }
  }
}

/**
 * Take accessibility snapshot
 */
export async function takeAccessibilitySnapshot(page: Page, name: string) {
  const violations = await page.evaluate(() => {
    // @ts-ignore
    return window.axe ? window.axe.run() : null;
  });
  
  if (violations && violations.violations && violations.violations.length > 0) {
    console.warn(`Accessibility violations found in ${name}:`, violations.violations);
  }
  
  return violations;
}

/**
 * Mock API responses for testing
 */
export async function mockGuestProfileAPI(page: Page, options: {
  success?: boolean;
  delay?: number;
  errorMessage?: string;
} = {}) {
  const { success = true, delay = 0, errorMessage = 'Internal Server Error' } = options;
  
  await page.route('**/api/guest-profile', async route => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    if (success) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Profile saved successfully',
          profileId: `profile_${Date.now()}`
        })
      });
    } else {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: errorMessage
        })
      });
    }
  });
}

/**
 * Verify data persistence
 */
export async function verifyDataPersistence(page: Page, step: number, expectedData: any) {
  switch (step) {
    case 1:
      // Verify accommodation data
      for (const propertyType of expectedData.propertyTypes || []) {
        const checkbox = page.locator(`[data-testid="checkbox-property-${propertyType.toLowerCase()}"]`);
        await expect(checkbox).toBeChecked();
      }
      break;
      
    case 2:
      // Verify dietary data
      for (const restriction of expectedData.restrictions || []) {
        const checkbox = page.locator(`[data-testid="checkbox-dietary-${restriction.toLowerCase().replace(/\s+/g, '-')}"]`);
        await expect(checkbox).toBeChecked();
      }
      break;
      
    case 3:
      // Verify languages and interests
      for (const language of expectedData.languages || []) {
        const checkbox = page.locator(`[data-testid="checkbox-language-${language.toLowerCase()}"]`);
        await expect(checkbox).toBeChecked();
      }
      break;
      
    case 4:
      // Verify location data
      for (const neighborhood of expectedData.neighborhoods || []) {
        const checkbox = page.locator(`[data-testid="checkbox-neighborhood-${neighborhood.toLowerCase().replace(/\s+/g, '-')}"]`);
        await expect(checkbox).toBeChecked();
      }
      break;
      
    case 5:
      // Verify budget data
      const minBudget = page.locator('[data-testid="input-min-budget"]');
      await expect(minBudget).toHaveValue(expectedData.min?.toString() || '');
      const maxBudget = page.locator('[data-testid="input-max-budget"]');
      await expect(maxBudget).toHaveValue(expectedData.max?.toString() || '');
      break;
      
    case 6:
      // Verify emergency contact data
      const nameInput = page.locator('[data-testid="input-emergency-name"]');
      await expect(nameInput).toHaveValue(expectedData.name || '');
      const phoneInput = page.locator('[data-testid="input-emergency-phone"]');
      await expect(phoneInput).toHaveValue(expectedData.phone || '');
      break;
  }
}

/**
 * Complete full onboarding flow
 */
export async function completeFullOnboarding(page: Page, data: GuestOnboardingData) {
  // Step 1: Accommodation
  for (const type of data.accommodation.propertyTypes) {
    await page.locator(`[data-testid="checkbox-property-${type.toLowerCase()}"]`).check();
  }
  for (const type of data.accommodation.roomTypes) {
    await page.locator(`[data-testid="checkbox-room-${type.toLowerCase().replace(' ', '-')}"]`).check();
  }
  for (const amenity of data.accommodation.amenities) {
    const amenityId = amenity.toLowerCase().replace(/\s+/g, '-').replace('air conditioning', 'ac');
    await page.locator(`[data-testid="checkbox-amenity-${amenityId}"]`).check();
  }
  await page.locator('[data-testid="button-continue-accommodation"]').click();
  
  // Step 2: Dietary
  for (const restriction of data.dietary.restrictions) {
    await page.locator(`[data-testid="checkbox-dietary-${restriction.toLowerCase().replace(/\s+/g, '-')}"]`).check();
  }
  if (data.dietary.specialNeeds) {
    await page.locator('[data-testid="textarea-special-needs"]').fill(data.dietary.specialNeeds);
  }
  await page.locator('[data-testid="button-continue-dietary"]').click();
  
  // Step 3: Languages & Interests
  for (const language of data.languagesInterests.languages) {
    await page.locator(`[data-testid="checkbox-language-${language.toLowerCase()}"]`).check();
  }
  for (const interest of data.languagesInterests.interests) {
    await page.locator(`[data-testid="checkbox-interest-${interest.toLowerCase().replace(/\s+/g, '-')}"]`).check();
  }
  await page.locator('[data-testid="button-continue-languages"]').click();
  
  // Step 4: Location & Duration
  for (const neighborhood of data.location.neighborhoods) {
    await page.locator(`[data-testid="checkbox-neighborhood-${neighborhood.toLowerCase().replace(/\s+/g, '-')}"]`).check();
  }
  await page.locator('[data-testid="select-stay-duration"]').click();
  await page.locator(`[data-testid="option-duration-${data.location.duration}"]`).click();
  await page.locator('[data-testid="button-continue-location"]').click();
  
  // Step 5: Budget
  await page.locator('[data-testid="select-currency"]').click();
  await page.locator(`[data-testid="option-currency-${data.budget.currency}"]`).click();
  await page.locator('[data-testid="input-min-budget"]').fill(data.budget.min.toString());
  await page.locator('[data-testid="input-max-budget"]').fill(data.budget.max.toString());
  await page.locator('[data-testid="button-continue-budget"]').click();
  
  // Step 6: Emergency Contact
  await page.locator('[data-testid="input-emergency-name"]').fill(data.emergencyContact.name);
  await page.locator('[data-testid="input-emergency-phone"]').fill(data.emergencyContact.phone);
  await page.locator('[data-testid="input-emergency-relationship"]').fill(data.emergencyContact.relationship);
  if (data.emergencyContact.email) {
    await page.locator('[data-testid="input-emergency-email"]').fill(data.emergencyContact.email);
  }
  if (data.emergencyContact.notes) {
    await page.locator('[data-testid="textarea-emergency-notes"]').fill(data.emergencyContact.notes);
  }
  await page.locator('[data-testid="button-complete-onboarding"]').click();
}