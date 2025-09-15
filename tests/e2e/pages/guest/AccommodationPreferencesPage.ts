import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 1: Accommodation Preferences
 * Handles property types, room types, and amenities selection
 */
export class AccommodationPreferencesPage extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  
  // Property Types
  readonly propertyApartment: Locator;
  readonly propertyHouse: Locator;
  readonly propertyTownhouse: Locator;
  readonly propertyLoft: Locator;
  readonly propertyStudio: Locator;
  readonly propertyVilla: Locator;
  
  // Room Types
  readonly roomEntirePlace: Locator;
  readonly roomPrivate: Locator;
  readonly roomShared: Locator;
  
  // Amenities
  readonly amenityWifi: Locator;
  readonly amenityKitchen: Locator;
  readonly amenityWasher: Locator;
  readonly amenityDryer: Locator;
  readonly amenityAC: Locator;
  readonly amenityHeating: Locator;
  readonly amenityWorkspace: Locator;
  readonly amenityTV: Locator;
  readonly amenityParking: Locator;
  readonly amenityElevator: Locator;
  readonly amenityGym: Locator;
  readonly amenityPool: Locator;
  
  // Navigation
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly skipButton: Locator;
  
  // Error/Validation
  readonly errorMessage: Locator;
  readonly validationMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Step info
    this.stepTitle = page.locator('[data-testid="step-title"]');
    this.stepDescription = page.locator('[data-testid="step-description"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');
    
    // Property Types
    this.propertyApartment = page.locator('[data-testid="checkbox-property-apartment"]');
    this.propertyHouse = page.locator('[data-testid="checkbox-property-house"]');
    this.propertyTownhouse = page.locator('[data-testid="checkbox-property-townhouse"]');
    this.propertyLoft = page.locator('[data-testid="checkbox-property-loft"]');
    this.propertyStudio = page.locator('[data-testid="checkbox-property-studio"]');
    this.propertyVilla = page.locator('[data-testid="checkbox-property-villa"]');
    
    // Room Types
    this.roomEntirePlace = page.locator('[data-testid="checkbox-room-entire"]');
    this.roomPrivate = page.locator('[data-testid="checkbox-room-private"]');
    this.roomShared = page.locator('[data-testid="checkbox-room-shared"]');
    
    // Amenities
    this.amenityWifi = page.locator('[data-testid="checkbox-amenity-wifi"]');
    this.amenityKitchen = page.locator('[data-testid="checkbox-amenity-kitchen"]');
    this.amenityWasher = page.locator('[data-testid="checkbox-amenity-washer"]');
    this.amenityDryer = page.locator('[data-testid="checkbox-amenity-dryer"]');
    this.amenityAC = page.locator('[data-testid="checkbox-amenity-ac"]');
    this.amenityHeating = page.locator('[data-testid="checkbox-amenity-heating"]');
    this.amenityWorkspace = page.locator('[data-testid="checkbox-amenity-workspace"]');
    this.amenityTV = page.locator('[data-testid="checkbox-amenity-tv"]');
    this.amenityParking = page.locator('[data-testid="checkbox-amenity-parking"]');
    this.amenityElevator = page.locator('[data-testid="checkbox-amenity-elevator"]');
    this.amenityGym = page.locator('[data-testid="checkbox-amenity-gym"]');
    this.amenityPool = page.locator('[data-testid="checkbox-amenity-pool"]');
    
    // Navigation
    this.nextButton = page.locator('[data-testid="button-next"]');
    this.previousButton = page.locator('[data-testid="button-previous"]');
    this.skipButton = page.locator('[data-testid="button-skip"]');
    
    // Error/Validation
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.validationMessage = page.locator('[data-testid="validation-message"]');
  }

  async selectPropertyTypes(types: string[]) {
    for (const type of types) {
      switch (type.toLowerCase()) {
        case 'apartment':
          await this.propertyApartment.check();
          break;
        case 'house':
          await this.propertyHouse.check();
          break;
        case 'townhouse':
          await this.propertyTownhouse.check();
          break;
        case 'loft':
          await this.propertyLoft.check();
          break;
        case 'studio':
          await this.propertyStudio.check();
          break;
        case 'villa':
          await this.propertyVilla.check();
          break;
      }
    }
  }

  async selectRoomTypes(types: string[]) {
    for (const type of types) {
      switch (type.toLowerCase()) {
        case 'entire place':
        case 'entire':
          await this.roomEntirePlace.check();
          break;
        case 'private room':
        case 'private':
          await this.roomPrivate.check();
          break;
        case 'shared room':
        case 'shared':
          await this.roomShared.check();
          break;
      }
    }
  }

  async selectAmenities(amenities: string[]) {
    for (const amenity of amenities) {
      switch (amenity.toLowerCase()) {
        case 'wifi':
          await this.amenityWifi.check();
          break;
        case 'kitchen':
          await this.amenityKitchen.check();
          break;
        case 'washer':
          await this.amenityWasher.check();
          break;
        case 'dryer':
          await this.amenityDryer.check();
          break;
        case 'air conditioning':
        case 'ac':
          await this.amenityAC.check();
          break;
        case 'heating':
          await this.amenityHeating.check();
          break;
        case 'workspace':
          await this.amenityWorkspace.check();
          break;
        case 'tv':
          await this.amenityTV.check();
          break;
        case 'parking':
          await this.amenityParking.check();
          break;
        case 'elevator':
          await this.amenityElevator.check();
          break;
        case 'gym':
          await this.amenityGym.check();
          break;
        case 'pool':
          await this.amenityPool.check();
          break;
      }
    }
  }

  async verifyStep() {
    await this.stepTitle.waitFor({ state: 'visible' });
    const title = await this.stepTitle.textContent();
    return title?.includes('Accommodation');
  }

  async getProgressPercentage() {
    const progress = await this.progressBar.getAttribute('value');
    return progress ? parseInt(progress) : 0;
  }

  async continueToNext() {
    await this.nextButton.click();
    await this.waitForPageLoad();
  }

  async goToPrevious() {
    await this.previousButton.click();
    await this.waitForPageLoad();
  }

  async skipStep() {
    if (await this.skipButton.isVisible()) {
      await this.skipButton.click();
      await this.waitForPageLoad();
    }
  }

  async isNextButtonEnabled() {
    return await this.nextButton.isEnabled();
  }

  async getSelectedPropertyTypes() {
    const selected = [];
    if (await this.propertyApartment.isChecked()) selected.push('Apartment');
    if (await this.propertyHouse.isChecked()) selected.push('House');
    if (await this.propertyTownhouse.isChecked()) selected.push('Townhouse');
    if (await this.propertyLoft.isChecked()) selected.push('Loft');
    if (await this.propertyStudio.isChecked()) selected.push('Studio');
    if (await this.propertyVilla.isChecked()) selected.push('Villa');
    return selected;
  }

  async getSelectedRoomTypes() {
    const selected = [];
    if (await this.roomEntirePlace.isChecked()) selected.push('Entire place');
    if (await this.roomPrivate.isChecked()) selected.push('Private room');
    if (await this.roomShared.isChecked()) selected.push('Shared room');
    return selected;
  }

  async getSelectedAmenities() {
    const selected = [];
    if (await this.amenityWifi.isChecked()) selected.push('WiFi');
    if (await this.amenityKitchen.isChecked()) selected.push('Kitchen');
    if (await this.amenityWasher.isChecked()) selected.push('Washer');
    if (await this.amenityDryer.isChecked()) selected.push('Dryer');
    if (await this.amenityAC.isChecked()) selected.push('Air conditioning');
    if (await this.amenityHeating.isChecked()) selected.push('Heating');
    if (await this.amenityWorkspace.isChecked()) selected.push('Workspace');
    if (await this.amenityTV.isChecked()) selected.push('TV');
    if (await this.amenityParking.isChecked()) selected.push('Parking');
    if (await this.amenityElevator.isChecked()) selected.push('Elevator');
    if (await this.amenityGym.isChecked()) selected.push('Gym');
    if (await this.amenityPool.isChecked()) selected.push('Pool');
    return selected;
  }

  async checkMobileResponsiveness() {
    // Check if elements are properly arranged for mobile
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Mobile specific checks
      const isStacked = await this.page.evaluate(() => {
        const checkboxes = document.querySelectorAll('[data-testid^="checkbox-"]');
        if (checkboxes.length < 2) return true;
        const first = checkboxes[0].getBoundingClientRect();
        const second = checkboxes[1].getBoundingClientRect();
        return first.top !== second.top; // Should be stacked vertically
      });
      return isStacked;
    }
    return true;
  }

  async captureVisualSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/guest-onboarding/${name}.png`,
      fullPage: true
    });
  }
}