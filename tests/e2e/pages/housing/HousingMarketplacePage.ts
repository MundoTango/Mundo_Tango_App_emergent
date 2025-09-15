import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HousingMarketplacePage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly postListingButton: Locator;
  private readonly searchBar: Locator;
  private readonly filterButton: Locator;
  private readonly mapViewToggle: Locator;

  // Selectors - Filters
  private readonly filterSidebar: Locator;
  private readonly locationFilter: Locator;
  private readonly priceRangeFilter: Locator;
  private readonly propertyTypeFilter: Locator;
  private readonly bedroomsFilter: Locator;
  private readonly amenitiesFilter: Locator;
  private readonly availabilityFilter: Locator;
  private readonly applyFiltersButton: Locator;
  private readonly clearFiltersButton: Locator;

  // Selectors - Listings
  private readonly listingsContainer: Locator;
  private readonly listingCard: Locator;
  private readonly listingImage: Locator;
  private readonly listingTitle: Locator;
  private readonly listingPrice: Locator;
  private readonly listingLocation: Locator;
  private readonly listingDetails: Locator;
  private readonly saveLisitingButton: Locator;
  private readonly contactHostButton: Locator;

  // Selectors - Map View
  private readonly mapContainer: Locator;
  private readonly mapMarker: Locator;
  private readonly mapCluster: Locator;
  private readonly mapInfoWindow: Locator;

  // Selectors - Pagination
  private readonly paginationContainer: Locator;
  private readonly prevPageButton: Locator;
  private readonly nextPageButton: Locator;
  private readonly pageNumber: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-housing-title"]');
    this.postListingButton = page.locator('[data-testid="button-post-listing"]');
    this.searchBar = page.locator('[data-testid="input-search-housing"]');
    this.filterButton = page.locator('[data-testid="button-filters"]');
    this.mapViewToggle = page.locator('[data-testid="toggle-map-view"]');

    // Initialize filter locators
    this.filterSidebar = page.locator('[data-testid="sidebar-filters"]');
    this.locationFilter = page.locator('[data-testid="input-location-filter"]');
    this.priceRangeFilter = page.locator('[data-testid="slider-price-range"]');
    this.propertyTypeFilter = page.locator('[data-testid="select-property-type"]');
    this.bedroomsFilter = page.locator('[data-testid="select-bedrooms"]');
    this.amenitiesFilter = page.locator('[data-testid="checkbox-amenities"]');
    this.availabilityFilter = page.locator('[data-testid="date-availability"]');
    this.applyFiltersButton = page.locator('[data-testid="button-apply-filters"]');
    this.clearFiltersButton = page.locator('[data-testid="button-clear-filters"]');

    // Initialize listing locators
    this.listingsContainer = page.locator('[data-testid="listings-container"]');
    this.listingCard = page.locator('[data-testid^="card-listing-"]');
    this.listingImage = page.locator('[data-testid^="img-listing-"]');
    this.listingTitle = page.locator('[data-testid^="text-listing-title-"]');
    this.listingPrice = page.locator('[data-testid^="text-listing-price-"]');
    this.listingLocation = page.locator('[data-testid^="text-listing-location-"]');
    this.listingDetails = page.locator('[data-testid^="text-listing-details-"]');
    this.saveLisitingButton = page.locator('[data-testid^="button-save-listing-"]');
    this.contactHostButton = page.locator('[data-testid^="button-contact-host-"]');

    // Initialize map view locators
    this.mapContainer = page.locator('[data-testid="map-container"]');
    this.mapMarker = page.locator('[data-testid^="map-marker-"]');
    this.mapCluster = page.locator('[data-testid^="map-cluster-"]');
    this.mapInfoWindow = page.locator('[data-testid="map-info-window"]');

    // Initialize pagination locators
    this.paginationContainer = page.locator('[data-testid="pagination"]');
    this.prevPageButton = page.locator('[data-testid="button-prev-page"]');
    this.nextPageButton = page.locator('[data-testid="button-next-page"]');
    this.pageNumber = page.locator('[data-testid="page-number"]');
  }

  // Navigation methods
  async navigateToHousingMarketplace(): Promise<void> {
    await this.goto('/housing-marketplace');
  }

  async navigateToPostListing(): Promise<void> {
    await this.postListingButton.click();
    await this.waitForPageLoad();
  }

  async navigateToListingDetail(listingId: string): Promise<void> {
    await this.page.locator(`[data-testid="card-listing-${listingId}"]`).click();
    await this.waitForPageLoad();
  }

  // Action methods
  async searchListings(query: string): Promise<void> {
    await this.searchBar.fill(query);
    await this.searchBar.press('Enter');
    await this.waitForPageLoad();
  }

  async applyFilters(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    bedrooms?: string;
    amenities?: string[];
    availability?: string;
  }): Promise<void> {
    if (filters.location) {
      await this.locationFilter.fill(filters.location);
    }
    
    if (filters.minPrice || filters.maxPrice) {
      // Handle price range slider
      // Implementation depends on specific slider component
    }
    
    if (filters.propertyType) {
      await this.propertyTypeFilter.selectOption(filters.propertyType);
    }
    
    if (filters.bedrooms) {
      await this.bedroomsFilter.selectOption(filters.bedrooms);
    }
    
    if (filters.amenities) {
      for (const amenity of filters.amenities) {
        await this.page.locator(`[data-testid="checkbox-${amenity}"]`).check();
      }
    }
    
    if (filters.availability) {
      await this.availabilityFilter.fill(filters.availability);
    }
    
    await this.applyFiltersButton.click();
    await this.waitForPageLoad();
  }

  async clearAllFilters(): Promise<void> {
    await this.clearFiltersButton.click();
    await this.waitForPageLoad();
  }

  async toggleMapView(): Promise<void> {
    await this.mapViewToggle.click();
    await this.waitForPageLoad();
  }

  async saveListing(listingId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-save-listing-${listingId}"]`).click();
    await this.expectToastMessage('Listing saved');
  }

  async contactHost(listingId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-contact-host-${listingId}"]`).click();
    // Handle contact modal
  }

  async navigateToPage(pageNumber: number): Promise<void> {
    await this.page.locator(`[data-testid="page-${pageNumber}"]`).click();
    await this.waitForPageLoad();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.waitForPageLoad();
  }

  async goToPreviousPage(): Promise<void> {
    await this.prevPageButton.click();
    await this.waitForPageLoad();
  }

  // Validation methods
  async getListingCount(): Promise<number> {
    const listings = await this.listingCard.all();
    return listings.length;
  }

  async verifyListing(listingId: string, expected: {
    title?: string;
    price?: string;
    location?: string;
    details?: string;
  }): Promise<void> {
    if (expected.title) {
      const title = await this.page.locator(`[data-testid="text-listing-title-${listingId}"]`).textContent();
      expect(title).toContain(expected.title);
    }
    
    if (expected.price) {
      const price = await this.page.locator(`[data-testid="text-listing-price-${listingId}"]`).textContent();
      expect(price).toContain(expected.price);
    }
    
    if (expected.location) {
      const location = await this.page.locator(`[data-testid="text-listing-location-${listingId}"]`).textContent();
      expect(location).toContain(expected.location);
    }
    
    if (expected.details) {
      const details = await this.page.locator(`[data-testid="text-listing-details-${listingId}"]`).textContent();
      expect(details).toContain(expected.details);
    }
  }

  async isListingSaved(listingId: string): Promise<boolean> {
    const button = this.page.locator(`[data-testid="button-save-listing-${listingId}"]`);
    const classes = await button.getAttribute('class');
    return classes?.includes('saved') || false;
  }

  async isMapViewActive(): Promise<boolean> {
    return await this.mapContainer.isVisible();
  }

  async getCurrentPage(): Promise<number> {
    const currentPage = await this.pageNumber.textContent() || '1';
    return parseInt(currentPage);
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-housing-title"]',
      '[data-testid="button-post-listing"]',
      '[data-testid="input-search-housing"]',
      '[data-testid="listings-container"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'housing-marketplace');
  }

  async takeListingSnapshot(listingId: string): Promise<void> {
    await this.takeElementSnapshot(`[data-testid="card-listing-${listingId}"]`, `listing-${listingId}`);
  }
}