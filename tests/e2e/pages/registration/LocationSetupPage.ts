import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object model for Step 4: Location Setup
 * Handles user location and hosting preferences
 */
export class LocationSetupPage extends BasePage {
  readonly countrySelect: Locator;
  readonly cityInput: Locator;
  readonly cityAutocomplete: Locator;
  readonly mapContainer: Locator;
  readonly mapMarker: Locator;
  readonly addressInput: Locator;
  readonly neighborhoodInput: Locator;
  readonly postalCodeInput: Locator;
  readonly canHostCheckbox: Locator;
  readonly hostingCapacityInput: Locator;
  readonly hostingDescriptionTextarea: Locator;
  readonly canGuideCheckbox: Locator;
  readonly guideLanguagesSelect: Locator;
  readonly nearbyVenuesCheckbox: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly skipButton: Locator;
  readonly useCurrentLocationButton: Locator;
  readonly progressBar: Locator;
  readonly locationPrivacyInfo: Locator;

  constructor(page: Page) {
    super(page);
    
    // Location fields
    this.countrySelect = page.locator('[data-testid="select-country"]');
    this.cityInput = page.locator('[data-testid="input-city"]');
    this.cityAutocomplete = page.locator('[data-testid="city-autocomplete"]');
    this.addressInput = page.locator('[data-testid="input-address"]');
    this.neighborhoodInput = page.locator('[data-testid="input-neighborhood"]');
    this.postalCodeInput = page.locator('[data-testid="input-postal-code"]');
    
    // Map elements
    this.mapContainer = page.locator('[data-testid="location-map"]');
    this.mapMarker = page.locator('[data-testid="map-marker"]');
    this.useCurrentLocationButton = page.locator('[data-testid="button-use-current-location"]');
    
    // Hosting preferences
    this.canHostCheckbox = page.locator('[data-testid="checkbox-can-host"]');
    this.hostingCapacityInput = page.locator('[data-testid="input-hosting-capacity"]');
    this.hostingDescriptionTextarea = page.locator('[data-testid="textarea-hosting-description"]');
    
    // Guide preferences
    this.canGuideCheckbox = page.locator('[data-testid="checkbox-can-guide"]');
    this.guideLanguagesSelect = page.locator('[data-testid="select-guide-languages"]');
    
    // Additional options
    this.nearbyVenuesCheckbox = page.locator('[data-testid="checkbox-show-nearby-venues"]');
    
    // Buttons
    this.continueButton = page.locator('[data-testid="button-continue-step-4"]');
    this.backButton = page.locator('[data-testid="button-back-step-4"]');
    this.skipButton = page.locator('[data-testid="button-skip-step-4"]');
    
    // UI elements
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.locationPrivacyInfo = page.locator('[data-testid="location-privacy-info"]');
  }

  async selectCountry(country: string) {
    await this.countrySelect.selectOption(country);
  }

  async enterCity(city: string, selectFromAutocomplete: boolean = true) {
    await this.cityInput.fill(city);
    if (selectFromAutocomplete) {
      await this.page.waitForTimeout(500); // Wait for autocomplete
      const suggestion = this.cityAutocomplete.locator(`text="${city}"`).first();
      if (await suggestion.isVisible()) {
        await suggestion.click();
      }
    }
  }

  async fillAddress(data: {
    address?: string;
    neighborhood?: string;
    postalCode?: string;
  }) {
    if (data.address) {
      await this.addressInput.fill(data.address);
    }
    if (data.neighborhood) {
      await this.neighborhoodInput.fill(data.neighborhood);
    }
    if (data.postalCode) {
      await this.postalCodeInput.fill(data.postalCode);
    }
  }

  async useCurrentLocation() {
    // Handle geolocation permission if needed
    await this.page.context().grantPermissions(['geolocation']);
    await this.page.context().setGeolocation({ latitude: -34.6037, longitude: -58.3816 }); // Buenos Aires
    await this.useCurrentLocationButton.click();
  }

  async setupHostingPreferences(data: {
    canHost: boolean;
    capacity?: number;
    description?: string;
  }) {
    if (data.canHost) {
      await this.canHostCheckbox.check();
      if (data.capacity) {
        await this.hostingCapacityInput.fill(data.capacity.toString());
      }
      if (data.description) {
        await this.hostingDescriptionTextarea.fill(data.description);
      }
    } else {
      await this.canHostCheckbox.uncheck();
    }
  }

  async setupGuidePreferences(data: {
    canGuide: boolean;
    languages?: string[];
  }) {
    if (data.canGuide) {
      await this.canGuideCheckbox.check();
      if (data.languages && data.languages.length > 0) {
        await this.guideLanguagesSelect.selectOption(data.languages);
      }
    } else {
      await this.canGuideCheckbox.uncheck();
    }
  }

  async setShowNearbyVenues(show: boolean) {
    if (show) {
      await this.nearbyVenuesCheckbox.check();
    } else {
      await this.nearbyVenuesCheckbox.uncheck();
    }
  }

  async continueToNextStep() {
    await this.continueButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async skipStep() {
    await this.skipButton.click();
  }

  async isMapVisible(): Promise<boolean> {
    return await this.mapContainer.isVisible();
  }

  async hasMapMarker(): Promise<boolean> {
    return await this.mapMarker.isVisible();
  }

  async getProgressPercentage(): Promise<number> {
    const progress = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(progress || '0');
  }
}