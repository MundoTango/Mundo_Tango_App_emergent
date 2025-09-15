import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AdminDashboardPage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly adminBadge: Locator;
  private readonly searchBar: Locator;
  private readonly notificationBell: Locator;
  private readonly adminMenu: Locator;

  // Selectors - Stats Cards
  private readonly totalUsersCard: Locator;
  private readonly activeUsersCard: Locator;
  private readonly totalEventsCard: Locator;
  private readonly revenueCard: Locator;
  private readonly growthRateCard: Locator;

  // Selectors - Navigation
  private readonly usersManagementLink: Locator;
  private readonly contentModerationLink: Locator;
  private readonly analyticsLink: Locator;
  private readonly settingsLink: Locator;
  private readonly reportsLink: Locator;
  private readonly systemHealthLink: Locator;

  // Selectors - Charts
  private readonly userGrowthChart: Locator;
  private readonly revenueChart: Locator;
  private readonly activityChart: Locator;
  private readonly performanceChart: Locator;

  // Selectors - Recent Activity
  private readonly recentActivityFeed: Locator;
  private readonly activityItem: Locator;
  private readonly viewAllActivityButton: Locator;

  // Selectors - Quick Actions
  private readonly createAnnouncementButton: Locator;
  private readonly exportDataButton: Locator;
  private readonly systemMaintenanceButton: Locator;
  private readonly viewLogsButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-admin-dashboard-title"]');
    this.adminBadge = page.locator('[data-testid="badge-admin"]');
    this.searchBar = page.locator('[data-testid="input-admin-search"]');
    this.notificationBell = page.locator('[data-testid="button-notifications"]');
    this.adminMenu = page.locator('[data-testid="menu-admin"]');

    // Initialize stats card locators
    this.totalUsersCard = page.locator('[data-testid="card-total-users"]');
    this.activeUsersCard = page.locator('[data-testid="card-active-users"]');
    this.totalEventsCard = page.locator('[data-testid="card-total-events"]');
    this.revenueCard = page.locator('[data-testid="card-revenue"]');
    this.growthRateCard = page.locator('[data-testid="card-growth-rate"]');

    // Initialize navigation locators
    this.usersManagementLink = page.locator('[data-testid="link-users-management"]');
    this.contentModerationLink = page.locator('[data-testid="link-content-moderation"]');
    this.analyticsLink = page.locator('[data-testid="link-analytics"]');
    this.settingsLink = page.locator('[data-testid="link-settings"]');
    this.reportsLink = page.locator('[data-testid="link-reports"]');
    this.systemHealthLink = page.locator('[data-testid="link-system-health"]');

    // Initialize chart locators
    this.userGrowthChart = page.locator('[data-testid="chart-user-growth"]');
    this.revenueChart = page.locator('[data-testid="chart-revenue"]');
    this.activityChart = page.locator('[data-testid="chart-activity"]');
    this.performanceChart = page.locator('[data-testid="chart-performance"]');

    // Initialize recent activity locators
    this.recentActivityFeed = page.locator('[data-testid="feed-recent-activity"]');
    this.activityItem = page.locator('[data-testid^="activity-item-"]');
    this.viewAllActivityButton = page.locator('[data-testid="button-view-all-activity"]');

    // Initialize quick action locators
    this.createAnnouncementButton = page.locator('[data-testid="button-create-announcement"]');
    this.exportDataButton = page.locator('[data-testid="button-export-data"]');
    this.systemMaintenanceButton = page.locator('[data-testid="button-system-maintenance"]');
    this.viewLogsButton = page.locator('[data-testid="button-view-logs"]');
  }

  // Navigation methods
  async navigateToAdminDashboard(): Promise<void> {
    await this.goto('/admin/dashboard');
  }

  async navigateToUsersManagement(): Promise<void> {
    await this.usersManagementLink.click();
    await this.waitForPageLoad();
  }

  async navigateToContentModeration(): Promise<void> {
    await this.contentModerationLink.click();
    await this.waitForPageLoad();
  }

  async navigateToAnalytics(): Promise<void> {
    await this.analyticsLink.click();
    await this.waitForPageLoad();
  }

  async navigateToSystemHealth(): Promise<void> {
    await this.systemHealthLink.click();
    await this.waitForPageLoad();
  }

  // Action methods
  async searchAdmin(query: string): Promise<void> {
    await this.searchBar.fill(query);
    await this.searchBar.press('Enter');
    await this.waitForPageLoad();
  }

  async createAnnouncement(title: string, message: string): Promise<void> {
    await this.createAnnouncementButton.click();
    const modal = this.page.locator('[data-testid="modal-announcement"]');
    await modal.waitFor({ state: 'visible' });
    
    await this.page.locator('[data-testid="input-announcement-title"]').fill(title);
    await this.page.locator('[data-testid="textarea-announcement-message"]').fill(message);
    await this.page.locator('[data-testid="button-send-announcement"]').click();
    
    await this.expectToastMessage('Announcement sent successfully');
  }

  async exportData(type: 'users' | 'events' | 'revenue' | 'all'): Promise<void> {
    await this.exportDataButton.click();
    const modal = this.page.locator('[data-testid="modal-export"]');
    await modal.waitFor({ state: 'visible' });
    
    await this.page.locator(`[data-testid="checkbox-export-${type}"]`).check();
    await this.page.locator('[data-testid="button-confirm-export"]').click();
    
    await this.expectToastMessage('Data export started');
  }

  async toggleMaintenanceMode(enable: boolean): Promise<void> {
    await this.systemMaintenanceButton.click();
    const toggle = this.page.locator('[data-testid="toggle-maintenance-mode"]');
    
    const isEnabled = await toggle.isChecked();
    if (isEnabled !== enable) {
      await toggle.click();
    }
    
    await this.page.locator('[data-testid="button-confirm-maintenance"]').click();
    await this.expectToastMessage(enable ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
  }

  // Validation methods
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    revenue: number;
    growthRate: number;
  }> {
    const totalUsers = await this.totalUsersCard.locator('[data-testid="value-total-users"]').textContent() || '0';
    const activeUsers = await this.activeUsersCard.locator('[data-testid="value-active-users"]').textContent() || '0';
    const totalEvents = await this.totalEventsCard.locator('[data-testid="value-total-events"]').textContent() || '0';
    const revenue = await this.revenueCard.locator('[data-testid="value-revenue"]').textContent() || '0';
    const growthRate = await this.growthRateCard.locator('[data-testid="value-growth-rate"]').textContent() || '0';
    
    return {
      totalUsers: parseInt(totalUsers.replace(/\D/g, '')),
      activeUsers: parseInt(activeUsers.replace(/\D/g, '')),
      totalEvents: parseInt(totalEvents.replace(/\D/g, '')),
      revenue: parseFloat(revenue.replace(/[^0-9.]/g, '')),
      growthRate: parseFloat(growthRate.replace(/[^0-9.]/g, '')),
    };
  }

  async verifyChartPresence(): Promise<void> {
    await expect(this.userGrowthChart).toBeVisible();
    await expect(this.revenueChart).toBeVisible();
    await expect(this.activityChart).toBeVisible();
    await expect(this.performanceChart).toBeVisible();
  }

  async getRecentActivityCount(): Promise<number> {
    const activities = await this.activityItem.all();
    return activities.length;
  }

  async verifyAdminAccess(): Promise<void> {
    await expect(this.adminBadge).toBeVisible();
    const badge = await this.adminBadge.textContent();
    expect(badge).toContain('Admin');
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-admin-dashboard-title"]',
      '[data-testid="card-total-users"]',
      '[data-testid="card-active-users"]',
      '[data-testid="chart-user-growth"]',
      '[data-testid="feed-recent-activity"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'admin-dashboard');
  }

  async takeChartsSnapshot(): Promise<void> {
    await this.takeElementSnapshot('[data-testid="charts-container"]', 'admin-charts');
  }
}