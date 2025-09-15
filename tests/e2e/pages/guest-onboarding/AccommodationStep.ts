import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 1: Accommodation Preferences
 * Handles property types, room types, and amenities selection
 */
export class AccommodationStep extends BasePage {
  readonly stepTitle: Locator;
  readonly stepDescription: Locator;
  readonly propertyTypesSection: Locator;
  readonly roomTypesSection: Locator;
  readonly amenitiesSection: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;

  // Property type checkboxes
  readonly apartmentCheckbox: Locator;
  readonly houseCheckbox: Locator;
  readonly townhouseCheckbox: Locator;
  readonly loftCheckbox: Locator;
  readonly studioCheckbox: Locator;
  readonly villaCheckbox: Locator;

  // Room type checkboxes
  readonly entirePlaceCheckbox: Locator;
  readonly privateRoomCheckbox: Locator;
  readonly sharedRoomCheckbox: Locator;

  // Amenity checkboxes
  readonly wifiCheckbox: Locator;
  readonly kitchenCheckbox: Locator;
  readonly washerCheckbox: Locator;
  readonly dryerCheckbox: Locator;
  readonly airConditioningCheckbox: Locator;
  readonly heatingCheckbox: Locator;
  readonly workspaceCheckbox: Locator;
  readonly tvCheckbox: Locator;
  readonly parkingCheckbox: Locator;
  readonly elevatorCheckbox: Locator;
  readonly gymCheckbox: Locator;
  readonly poolCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // Step elements
    this.stepTitle = page.locator('[data-testid="step-title-accommodation"]');
    this.stepDescription = page.locator('[data-testid="step-description-accommodation"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');

    // Sections
    this.propertyTypesSection = page.locator('[data-testid="section-property-types"]');
    this.roomTypesSection = page.locator('[data-testid="section-room-types"]');
    this.amenitiesSection = page.locator('[data-testid="section-amenities"]');

    // Navigation buttons
    this.continueButton = page.locator('[data-testid="button-continue-accommodation"]');
    this.backButton = page.locator('[data-testid="button-back-accommodation"]');

    // Property type checkboxes
    this.apartmentCheckbox = page.locator('[data-testid="checkbox-property-apartment"]');
    this.houseCheckbox = page.locator('[data-testid="checkbox-property-house"]');
    this.townhouseCheckbox = page.locator('[data-testid="checkbox-property-townhouse"]');
    this.loftCheckbox = page.locator('[data-testid="checkbox-property-loft"]');
    this.studioCheckbox = page.locator('[data-testid="checkbox-property-studio"]');
    this.villaCheckbox = page.locator('[data-testid="checkbox-property-villa"]');

    // Room type checkboxes
    this.entirePlaceCheckbox = page.locator('[data-testid="checkbox-room-entire"]');
    this.privateRoomCheckbox = page.locator('[data-testid="checkbox-room-private"]');
    this.sharedRoomCheckbox = page.locator('[data-testid="checkbox-room-shared"]');

    // Amenity checkboxes
    this.wifiCheckbox = page.locator('[data-testid="checkbox-amenity-wifi"]');
    this.kitchenCheckbox = page.locator('[data-testid="checkbox-amenity-kitchen"]');
    this.washerCheckbox = page.locator('[data-testid="checkbox-amenity-washer"]');
    this.dryerCheckbox = page.locator('[data-testid="checkbox-amenity-dryer"]');
    this.airConditioningCheckbox = page.locator('[data-testid="checkbox-amenity-ac"]');
    this.heatingCheckbox = page.locator('[data-testid="checkbox-amenity-heating"]');
    this.workspaceCheckbox = page.locator('[data-testid="checkbox-amenity-workspace"]');
    this.tvCheckbox = page.locator('[data-testid="checkbox-amenity-tv"]');
    this.parkingCheckbox = page.locator('[data-testid="checkbox-amenity-parking"]');
    this.elevatorCheckbox = page.locator('[data-testid="checkbox-amenity-elevator"]');
    this.gymCheckbox = page.locator('[data-testid="checkbox-amenity-gym"]');
    this.poolCheckbox = page.locator('[data-testid="checkbox-amenity-pool"]');
  }

  async selectPropertyTypes(types: string[]) {
    for (const type of types) {
      const checkbox = this.page.locator(`[data-testid="checkbox-property-${type.toLowerCase()}"]`);
      await checkbox.check();
    }
  }

  async selectRoomTypes(types: string[]) {
    for (const type of types) {
      const checkbox = this.page.locator(`[data-testid="checkbox-room-${type.toLowerCase().replace(' ', '-')}"]`);
      await checkbox.check();
    }
  }

  async selectAmenities(amenities: string[]) {
    for (const amenity of amenities) {
      const checkbox = this.page.locator(`[data-testid="checkbox-amenity-${amenity.toLowerCase().replace(' ', '-')}"]`);
      await checkbox.check();
    }
  }

  async unselectPropertyType(type: string) {
    const checkbox = this.page.locator(`[data-testid="checkbox-property-${type.toLowerCase()}"]`);
    await checkbox.uncheck();
  }

  async unselectRoomType(type: string) {
    const checkbox = this.page.locator(`[data-testid="checkbox-room-${type.toLowerCase().replace(' ', '-')}"]`);
    await checkbox.uncheck();
  }

  async unselectAmenity(amenity: string) {
    const checkbox = this.page.locator(`[data-testid="checkbox-amenity-${amenity.toLowerCase().replace(' ', '-')}"]`);
    await checkbox.uncheck();
  }

  async getSelectedPropertyTypes(): Promise<string[]> {
    const selected: string[] = [];
    const types = ['apartment', 'house', 'townhouse', 'loft', 'studio', 'villa'];
    
    for (const type of types) {
      const checkbox = this.page.locator(`[data-testid="checkbox-property-${type}"]`);
      if (await checkbox.isChecked()) {
        selected.push(type);
      }
    }
    
    return selected;
  }

  async getSelectedRoomTypes(): Promise<string[]> {
    const selected: string[] = [];
    const types = ['entire', 'private', 'shared'];
    
    for (const type of types) {
      const checkbox = this.page.locator(`[data-testid="checkbox-room-${type}"]`);
      if (await checkbox.isChecked()) {
        selected.push(type);
      }
    }
    
    return selected;
  }

  async getSelectedAmenities(): Promise<string[]> {
    const selected: string[] = [];
    const amenities = ['wifi', 'kitchen', 'washer', 'dryer', 'ac', 'heating', 
                       'workspace', 'tv', 'parking', 'elevator', 'gym', 'pool'];
    
    for (const amenity of amenities) {
      const checkbox = this.page.locator(`[data-testid="checkbox-amenity-${amenity}"]`);
      if (await checkbox.isChecked()) {
        selected.push(amenity);
      }
    }
    
    return selected;
  }

  async continueToNextStep() {
    await this.continueButton.click();
    await this.waitForPageLoad();
  }

  async goBackToPreviousStep() {
    await this.backButton.click();
    await this.waitForPageLoad();
  }

  async getProgressPercentage(): Promise<number> {
    const progressValue = await this.progressBar.getAttribute('aria-valuenow');
    return progressValue ? parseInt(progressValue) : 0;
  }

  async isStepComplete(): Promise<boolean> {
    const propertyTypes = await this.getSelectedPropertyTypes();
    const roomTypes = await this.getSelectedRoomTypes();
    return propertyTypes.length > 0 && roomTypes.length > 0;
  }

  async validateStep(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const propertyTypes = await this.getSelectedPropertyTypes();
    const roomTypes = await this.getSelectedRoomTypes();

    if (propertyTypes.length === 0) {
      errors.push('Please select at least one property type');
    }

    if (roomTypes.length === 0) {
      errors.push('Please select at least one room type');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async takeSnapshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/guest-onboarding-accommodation-${name}.png`,
      fullPage: true
    });
  }

  async checkAccessibility() {
    const { injectAxe, checkA11y } = await import('@axe-core/playwright');
    await injectAxe(this.page);
    await checkA11y(this.page, '[data-testid="guest-onboarding-accommodation"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }
}