import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class GroupsPage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly createGroupButton: Locator;
  private readonly searchGroupsInput: Locator;
  private readonly filterButton: Locator;

  // Selectors - Groups List
  private readonly groupsList: Locator;
  private readonly groupCard: Locator;
  private readonly groupName: Locator;
  private readonly groupDescription: Locator;
  private readonly groupMembers: Locator;
  private readonly joinGroupButton: Locator;
  private readonly leaveGroupButton: Locator;

  // Selectors - Group Categories
  private readonly categoryFilter: Locator;
  private readonly publicGroupsTab: Locator;
  private readonly privateGroupsTab: Locator;
  private readonly myGroupsTab: Locator;

  // Selectors - Create Group Modal
  private readonly createGroupModal: Locator;
  private readonly groupNameInput: Locator;
  private readonly groupDescriptionInput: Locator;
  private readonly groupCategorySelect: Locator;
  private readonly groupPrivacyToggle: Locator;
  private readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-groups-title"]');
    this.createGroupButton = page.locator('[data-testid="button-create-group"]');
    this.searchGroupsInput = page.locator('[data-testid="input-search-groups"]');
    this.filterButton = page.locator('[data-testid="button-filter-groups"]');

    // Initialize groups list locators
    this.groupsList = page.locator('[data-testid="groups-list"]');
    this.groupCard = page.locator('[data-testid^="card-group-"]');
    this.groupName = page.locator('[data-testid^="text-group-name-"]');
    this.groupDescription = page.locator('[data-testid^="text-group-description-"]');
    this.groupMembers = page.locator('[data-testid^="text-group-members-"]');
    this.joinGroupButton = page.locator('[data-testid^="button-join-group-"]');
    this.leaveGroupButton = page.locator('[data-testid^="button-leave-group-"]');

    // Initialize category locators
    this.categoryFilter = page.locator('[data-testid="select-category-filter"]');
    this.publicGroupsTab = page.locator('[data-testid="tab-public-groups"]');
    this.privateGroupsTab = page.locator('[data-testid="tab-private-groups"]');
    this.myGroupsTab = page.locator('[data-testid="tab-my-groups"]');

    // Initialize create group modal locators
    this.createGroupModal = page.locator('[data-testid="modal-create-group"]');
    this.groupNameInput = page.locator('[data-testid="input-group-name"]');
    this.groupDescriptionInput = page.locator('[data-testid="textarea-group-description"]');
    this.groupCategorySelect = page.locator('[data-testid="select-group-category"]');
    this.groupPrivacyToggle = page.locator('[data-testid="toggle-group-privacy"]');
    this.createButton = page.locator('[data-testid="button-confirm-create-group"]');
  }

  // Navigation methods
  async navigateToGroups(): Promise<void> {
    await this.goto('/groups');
  }

  async navigateToGroupDetail(groupId: string): Promise<void> {
    await this.page.locator(`[data-testid="card-group-${groupId}"]`).click();
    await this.waitForPageLoad();
  }

  async switchTab(tab: 'public' | 'private' | 'my'): Promise<void> {
    const tabs = {
      public: this.publicGroupsTab,
      private: this.privateGroupsTab,
      my: this.myGroupsTab,
    };
    
    await tabs[tab].click();
    await this.waitForPageLoad();
  }

  // Action methods
  async createGroup(data: {
    name: string;
    description: string;
    category?: string;
    isPrivate?: boolean;
  }): Promise<void> {
    await this.createGroupButton.click();
    await this.createGroupModal.waitFor({ state: 'visible' });
    
    await this.groupNameInput.fill(data.name);
    await this.groupDescriptionInput.fill(data.description);
    
    if (data.category) {
      await this.groupCategorySelect.selectOption(data.category);
    }
    
    if (data.isPrivate) {
      await this.groupPrivacyToggle.click();
    }
    
    await this.createButton.click();
    await this.expectToastMessage('Group created successfully');
  }

  async joinGroup(groupId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-join-group-${groupId}"]`).click();
    await this.expectToastMessage('Joined group successfully');
  }

  async leaveGroup(groupId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-leave-group-${groupId}"]`).click();
    await this.expectToastMessage('Left group successfully');
  }

  async searchGroups(query: string): Promise<void> {
    await this.searchGroupsInput.fill(query);
    await this.searchGroupsInput.press('Enter');
    await this.waitForPageLoad();
  }

  // Validation methods
  async getGroupCount(): Promise<number> {
    const groups = await this.groupCard.all();
    return groups.length;
  }

  async isGroupMember(groupId: string): Promise<boolean> {
    const leaveButton = this.page.locator(`[data-testid="button-leave-group-${groupId}"]`);
    return await leaveButton.isVisible();
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-groups-title"]',
      '[data-testid="button-create-group"]',
      '[data-testid="groups-list"]',
      '[data-testid="tab-public-groups"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'groups-page');
  }
}