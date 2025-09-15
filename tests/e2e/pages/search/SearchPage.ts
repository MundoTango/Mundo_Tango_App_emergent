import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SearchPage extends BasePage {
  // Selectors - Search Bar
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly clearButton: Locator;
  private readonly searchFilters: Locator;

  // Selectors - Search Categories
  private readonly allTab: Locator;
  private readonly peopleTab: Locator;
  private readonly eventsTab: Locator;
  private readonly groupsTab: Locator;
  private readonly postsTab: Locator;

  // Selectors - Results
  private readonly resultsContainer: Locator;
  private readonly resultItem: Locator;
  private readonly noResultsMessage: Locator;
  private readonly resultCount: Locator;
  private readonly loadMoreButton: Locator;

  // Selectors - Filters
  private readonly dateFilter: Locator;
  private readonly locationFilter: Locator;
  private readonly sortByDropdown: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize search bar locators
    this.searchInput = page.locator('[data-testid="input-main-search"]');
    this.searchButton = page.locator('[data-testid="button-search"]');
    this.clearButton = page.locator('[data-testid="button-clear-search"]');
    this.searchFilters = page.locator('[data-testid="search-filters"]');

    // Initialize category tab locators
    this.allTab = page.locator('[data-testid="tab-all"]');
    this.peopleTab = page.locator('[data-testid="tab-people"]');
    this.eventsTab = page.locator('[data-testid="tab-events"]');
    this.groupsTab = page.locator('[data-testid="tab-groups"]');
    this.postsTab = page.locator('[data-testid="tab-posts"]');

    // Initialize results locators
    this.resultsContainer = page.locator('[data-testid="search-results"]');
    this.resultItem = page.locator('[data-testid^="result-item-"]');
    this.noResultsMessage = page.locator('[data-testid="text-no-results"]');
    this.resultCount = page.locator('[data-testid="text-result-count"]');
    this.loadMoreButton = page.locator('[data-testid="button-load-more-results"]');

    // Initialize filter locators
    this.dateFilter = page.locator('[data-testid="filter-date"]');
    this.locationFilter = page.locator('[data-testid="filter-location"]');
    this.sortByDropdown = page.locator('[data-testid="select-sort-by"]');
  }

  // Navigation methods
  async navigateToSearch(query?: string): Promise<void> {
    const path = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
    await this.goto(path);
  }

  async switchCategory(category: 'all' | 'people' | 'events' | 'groups' | 'posts'): Promise<void> {
    const tabs = {
      all: this.allTab,
      people: this.peopleTab,
      events: this.eventsTab,
      groups: this.groupsTab,
      posts: this.postsTab,
    };
    
    await tabs[category].click();
    await this.waitForPageLoad();
  }

  // Action methods
  async performSearch(query: string): Promise<void> {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async clearSearch(): Promise<void> {
    await this.clearButton.click();
    await this.waitForPageLoad();
  }

  async applyFilters(filters: {
    date?: string;
    location?: string;
    sortBy?: 'relevance' | 'recent' | 'popular';
  }): Promise<void> {
    if (filters.date) {
      await this.dateFilter.fill(filters.date);
    }
    
    if (filters.location) {
      await this.locationFilter.fill(filters.location);
    }
    
    if (filters.sortBy) {
      await this.sortByDropdown.selectOption(filters.sortBy);
    }
    
    await this.waitForPageLoad();
  }

  async loadMoreResults(): Promise<void> {
    await this.loadMoreButton.scrollIntoViewIfNeeded();
    await this.loadMoreButton.click();
    await this.waitForPageLoad();
  }

  async clickResult(resultId: string): Promise<void> {
    await this.page.locator(`[data-testid="result-item-${resultId}"]`).click();
    await this.waitForPageLoad();
  }

  // Validation methods
  async getResultCount(): Promise<number> {
    const countText = await this.resultCount.textContent() || '0';
    return parseInt(countText.replace(/\D/g, ''));
  }

  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  async verifySearchQuery(expectedQuery: string): Promise<void> {
    const currentQuery = await this.searchInput.inputValue();
    expect(currentQuery).toBe(expectedQuery);
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="input-main-search"]',
      '[data-testid="button-search"]',
      '[data-testid="search-results"]',
      '[data-testid="tab-all"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'search-page');
  }
}