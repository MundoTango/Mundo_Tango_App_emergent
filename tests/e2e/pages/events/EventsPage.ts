import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class EventsPage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly createEventButton: Locator;
  private readonly filterButton: Locator;
  private readonly searchInput: Locator;
  private readonly viewToggle: Locator;

  // Selectors - Filters
  private readonly filterModal: Locator;
  private readonly categoryFilter: Locator;
  private readonly dateFilter: Locator;
  private readonly locationFilter: Locator;
  private readonly priceFilter: Locator;
  private readonly applyFiltersButton: Locator;
  private readonly clearFiltersButton: Locator;

  // Selectors - Event List
  private readonly eventsList: Locator;
  private readonly eventCard: Locator;
  private readonly loadMoreButton: Locator;
  private readonly noEventsMessage: Locator;

  // Selectors - Event Card
  private readonly eventTitle: Locator;
  private readonly eventDate: Locator;
  private readonly eventLocation: Locator;
  private readonly eventPrice: Locator;
  private readonly eventHost: Locator;
  private readonly eventAttendees: Locator;
  private readonly eventImage: Locator;
  private readonly attendButton: Locator;
  private readonly shareButton: Locator;
  private readonly saveButton: Locator;

  // Selectors - View options
  private readonly gridView: Locator;
  private readonly listView: Locator;
  private readonly calendarView: Locator;
  private readonly mapView: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-events-title"]');
    this.createEventButton = page.locator('[data-testid="button-create-event"]');
    this.filterButton = page.locator('[data-testid="button-filter"]');
    this.searchInput = page.locator('[data-testid="input-search-events"]');
    this.viewToggle = page.locator('[data-testid="view-toggle"]');

    // Initialize filter locators
    this.filterModal = page.locator('[data-testid="modal-filters"]');
    this.categoryFilter = page.locator('[data-testid="select-category"]');
    this.dateFilter = page.locator('[data-testid="input-date-filter"]');
    this.locationFilter = page.locator('[data-testid="input-location-filter"]');
    this.priceFilter = page.locator('[data-testid="slider-price"]');
    this.applyFiltersButton = page.locator('[data-testid="button-apply-filters"]');
    this.clearFiltersButton = page.locator('[data-testid="button-clear-filters"]');

    // Initialize event list locators
    this.eventsList = page.locator('[data-testid="events-list"]');
    this.eventCard = page.locator('[data-testid^="card-event-"]');
    this.loadMoreButton = page.locator('[data-testid="button-load-more"]');
    this.noEventsMessage = page.locator('[data-testid="text-no-events"]');

    // Initialize event card locators
    this.eventTitle = page.locator('[data-testid^="text-event-title-"]');
    this.eventDate = page.locator('[data-testid^="text-event-date-"]');
    this.eventLocation = page.locator('[data-testid^="text-event-location-"]');
    this.eventPrice = page.locator('[data-testid^="text-event-price-"]');
    this.eventHost = page.locator('[data-testid^="text-event-host-"]');
    this.eventAttendees = page.locator('[data-testid^="text-event-attendees-"]');
    this.eventImage = page.locator('[data-testid^="img-event-"]');
    this.attendButton = page.locator('[data-testid^="button-attend-"]');
    this.shareButton = page.locator('[data-testid^="button-share-"]');
    this.saveButton = page.locator('[data-testid^="button-save-"]');

    // Initialize view option locators
    this.gridView = page.locator('[data-testid="button-grid-view"]');
    this.listView = page.locator('[data-testid="button-list-view"]');
    this.calendarView = page.locator('[data-testid="button-calendar-view"]');
    this.mapView = page.locator('[data-testid="button-map-view"]');
  }

  // Navigation methods
  async navigateToEvents(): Promise<void> {
    await this.goto('/events');
  }

  async navigateToCreateEvent(): Promise<void> {
    await this.createEventButton.click();
    await this.waitForPageLoad();
  }

  async navigateToEventDetail(eventId: string): Promise<void> {
    await this.page.locator(`[data-testid="card-event-${eventId}"]`).click();
    await this.waitForPageLoad();
  }

  // Action methods
  async searchEvents(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async openFilters(): Promise<void> {
    await this.filterButton.click();
    await this.filterModal.waitFor({ state: 'visible' });
  }

  async applyFilters(filters: {
    category?: string;
    date?: string;
    location?: string;
    maxPrice?: number;
  }): Promise<void> {
    await this.openFilters();
    
    if (filters.category) {
      await this.categoryFilter.selectOption(filters.category);
    }
    
    if (filters.date) {
      await this.dateFilter.fill(filters.date);
    }
    
    if (filters.location) {
      await this.locationFilter.fill(filters.location);
    }
    
    if (filters.maxPrice) {
      await this.priceFilter.fill(filters.maxPrice.toString());
    }
    
    await this.applyFiltersButton.click();
    await this.filterModal.waitFor({ state: 'hidden' });
    await this.waitForPageLoad();
  }

  async clearFilters(): Promise<void> {
    await this.openFilters();
    await this.clearFiltersButton.click();
    await this.filterModal.waitFor({ state: 'hidden' });
    await this.waitForPageLoad();
  }

  async changeView(view: 'grid' | 'list' | 'calendar' | 'map'): Promise<void> {
    const views = {
      grid: this.gridView,
      list: this.listView,
      calendar: this.calendarView,
      map: this.mapView,
    };
    
    await views[view].click();
    await this.waitForPageLoad();
  }

  async attendEvent(eventId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-attend-${eventId}"]`).click();
    await this.expectToastMessage('Successfully registered for event');
  }

  async saveEvent(eventId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-save-${eventId}"]`).click();
    await this.expectToastMessage('Event saved');
  }

  async shareEvent(eventId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-share-${eventId}"]`).click();
    // Handle share modal
  }

  async loadMoreEvents(): Promise<void> {
    await this.loadMoreButton.scrollIntoViewIfNeeded();
    await this.loadMoreButton.click();
    await this.waitForPageLoad();
  }

  // Validation methods
  async getEventCount(): Promise<number> {
    const events = await this.eventCard.all();
    return events.length;
  }

  async verifyEventCard(eventId: string, expected: {
    title?: string;
    date?: string;
    location?: string;
    price?: string;
    host?: string;
  }): Promise<void> {
    if (expected.title) {
      const title = await this.page.locator(`[data-testid="text-event-title-${eventId}"]`).textContent();
      expect(title).toContain(expected.title);
    }
    
    if (expected.date) {
      const date = await this.page.locator(`[data-testid="text-event-date-${eventId}"]`).textContent();
      expect(date).toContain(expected.date);
    }
    
    if (expected.location) {
      const location = await this.page.locator(`[data-testid="text-event-location-${eventId}"]`).textContent();
      expect(location).toContain(expected.location);
    }
    
    if (expected.price) {
      const price = await this.page.locator(`[data-testid="text-event-price-${eventId}"]`).textContent();
      expect(price).toContain(expected.price);
    }
    
    if (expected.host) {
      const host = await this.page.locator(`[data-testid="text-event-host-${eventId}"]`).textContent();
      expect(host).toContain(expected.host);
    }
  }

  async isEventAttending(eventId: string): Promise<boolean> {
    const button = this.page.locator(`[data-testid="button-attend-${eventId}"]`);
    const text = await button.textContent();
    return text?.toLowerCase().includes('attending') || false;
  }

  async isEventSaved(eventId: string): Promise<boolean> {
    const button = this.page.locator(`[data-testid="button-save-${eventId}"]`);
    const classes = await button.getAttribute('class');
    return classes?.includes('saved') || false;
  }

  async verifyNoEventsMessage(): Promise<void> {
    await this.noEventsMessage.waitFor({ state: 'visible' });
    const text = await this.noEventsMessage.textContent();
    expect(text).toContain('No events found');
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-events-title"]',
      '[data-testid="button-create-event"]',
      '[data-testid="button-filter"]',
      '[data-testid="input-search-events"]',
      '[data-testid="events-list"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'events-page');
  }

  async takeEventCardSnapshot(eventId: string): Promise<void> {
    await this.takeElementSnapshot(`[data-testid="card-event-${eventId}"]`, `event-card-${eventId}`);
  }
}