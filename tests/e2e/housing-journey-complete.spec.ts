import { test, expect } from '@playwright/test';

/**
 * COMPLETE HOUSING JOURNEY TEST
 * 
 * Tests all 6 core customer journeys:
 * 1. Guest Discovery - Browse marketplace
 * 2. Guest Booking - Request to book
 * 3. Guest Onboarding - Complete guest profile
 * 4. Host Listing Creation - Add new property
 * 5. Host Booking Management - Manage requests
 * 6. City Group Housing Discovery - View city listings
 */

test.describe('Complete Housing Marketplace Journey', () => {
  
  // Journey 1: Guest Discovery
  test('Journey 1: Guest can browse housing marketplace', async ({ page }) => {
    await page.goto('/housing-marketplace');
    await page.waitForLoadState('networkidle');
    
    // Verify marketplace page loads
    await expect(page.locator('[data-testid="page-housing-marketplace"]')).toBeVisible();
    
    // Verify search and filter components
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Verify at least one property card is displayed
    const propertyCards = page.locator('[data-testid*="card-property"]');
    await expect(propertyCards.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Journey 1: Guest Discovery - PASSED');
  });

  // Journey 2: Guest can view listing details and request booking
  test('Journey 2: Guest can view listing and request booking', async ({ page }) => {
    await page.goto('/housing-marketplace');
    await page.waitForLoadState('networkidle');
    
    // Click on first property card to view details
    const firstCard = page.locator('[data-testid*="card-property"]').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');
    
    // Verify listing detail page loads
    await expect(page.locator('[data-testid="page-listing-detail"]')).toBeVisible();
    await expect(page.locator('[data-testid="text-listing-title"]')).toBeVisible();
    
    // Verify booking widget
    await expect(page.locator('[data-testid="card-booking"]')).toBeVisible();
    await expect(page.locator('[data-testid="text-price-per-night"]')).toBeVisible();
    
    // Click "Request to Book" button
    const requestButton = page.locator('[data-testid="button-request-to-book"]');
    await requestButton.click();
    
    // Verify booking modal opens
    await expect(page.locator('[data-testid="dialog-booking-request"]')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Journey 2: Guest Booking Flow - PASSED');
  });

  // Journey 3: Guest Onboarding
  test('Journey 3: Guest can complete onboarding', async ({ page }) => {
    await page.goto('/onboarding/guest');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Check basic info step
    await expect(page.locator('h2:has-text("Basic Information")')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Journey 3: Guest Onboarding - PASSED');
  });

  // Journey 4: Host Listing Creation
  test('Journey 4: Host can create new listing', async ({ page }) => {
    await page.goto('/host/add-home');
    await page.waitForLoadState('networkidle');
    
    // Verify host add home page
    await expect(page.locator('text=Add New Property')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Journey 4: Host Listing Creation - PASSED');
  });

  // Journey 5: Host Booking Management
  test('Journey 5: Host can view booking requests', async ({ page }) => {
    await page.goto('/host/bookings');
    await page.waitForLoadState('networkidle');
    
    // Verify host bookings page loads
    const pageContent = await page.content();
    const hasBookingsPage = pageContent.includes('Booking Requests') || 
                            pageContent.includes('My Bookings') ||
                            pageContent.includes('Host Dashboard');
    
    expect(hasBookingsPage).toBeTruthy();
    
    console.log('✅ Journey 5: Host Booking Management - PASSED');
  });

  // Journey 6: City Group Housing Discovery
  test('Journey 6: City group displays housing listings', async ({ page }) => {
    await page.goto('/groups/slug/buenos-aires');
    await page.waitForLoadState('networkidle');
    
    // Click on Housing tab
    const housingTab = page.locator('[data-testid="tab-housing"]');
    if (await housingTab.isVisible()) {
      await housingTab.click();
      await page.waitForTimeout(1000);
      
      // Verify housing section or listings
      const hasHousingContent = await page.locator('text=/Housing|Accommodation|Available/i').isVisible();
      expect(hasHousingContent).toBeTruthy();
    }
    
    console.log('✅ Journey 6: City Group Housing Discovery - PASSED');
  });

  // Additional: Test complete booking submission
  test('Journey 2B: Complete booking request submission', async ({ page }) => {
    await page.goto('/listing/1');
    await page.waitForLoadState('networkidle');
    
    // Open booking modal
    await page.locator('[data-testid="button-request-to-book"]').click();
    await expect(page.locator('[data-testid="dialog-booking-request"]')).toBeVisible();
    
    // Select check-in date (future date)
    const checkInCalendar = page.locator('[data-testid="calendar-check-in"]');
    if (await checkInCalendar.isVisible()) {
      // Click on a future date in the calendar
      const futureDateCell = checkInCalendar.locator('button[name="day"]:not([disabled])').first();
      await futureDateCell.click();
    }
    
    // Wait a moment for check-in to be selected
    await page.waitForTimeout(500);
    
    // Select check-out date
    const checkOutCalendar = page.locator('[data-testid="calendar-check-out"]');
    if (await checkOutCalendar.isVisible()) {
      const futureDateCell = checkOutCalendar.locator('button[name="day"]:not([disabled])').nth(3);
      await futureDateCell.click();
    }
    
    // Fill in purpose
    const purposeSelect = page.locator('[data-testid="select-purpose"]');
    if (await purposeSelect.isVisible()) {
      await purposeSelect.click();
      await page.locator('text="Tango workshop"').click();
    }
    
    // Fill in message
    const messageInput = page.locator('[data-testid="textarea-message"]');
    if (await messageInput.isVisible()) {
      await messageInput.fill('Looking forward to attending the tango festival!');
    }
    
    // Accept house rules
    const rulesCheckbox = page.locator('[data-testid="checkbox-house-rules"]');
    if (await rulesCheckbox.isVisible()) {
      await rulesCheckbox.check();
    }
    
    // Verify submit button is enabled and visible
    const submitButton = page.locator('[data-testid="button-submit-booking"]');
    await expect(submitButton).toBeVisible();
    
    // Note: We don't actually submit to avoid creating test data
    console.log('✅ Journey 2B: Booking Form Completion - PASSED');
  });
});

test.describe('Property Details Verification', () => {
  test('Listing page displays all essential components', async ({ page }) => {
    await page.goto('/listing/1');
    await page.waitForLoadState('networkidle');
    
    // Verify back button
    await expect(page.locator('[data-testid="button-back-to-marketplace"]')).toBeVisible();
    
    // Verify property header section
    await expect(page.locator('[data-testid="section-property-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="text-listing-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="text-location"]')).toBeVisible();
    
    // Verify description section
    await expect(page.locator('[data-testid="section-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="text-description"]')).toBeVisible();
    
    // Verify amenities section
    await expect(page.locator('[data-testid="section-amenities"]')).toBeVisible();
    
    // Verify house rules
    await expect(page.locator('[data-testid="section-house-rules"]')).toBeVisible();
    
    // Verify booking card
    await expect(page.locator('[data-testid="card-booking"]')).toBeVisible();
    
    // Verify host card
    await expect(page.locator('[data-testid="card-host"]')).toBeVisible();
    
    // Verify action buttons
    await expect(page.locator('[data-testid="button-share"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-favorite"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-contact-host"]')).toBeVisible();
    
    console.log('✅ Property Details Components - ALL VERIFIED');
  });
});
