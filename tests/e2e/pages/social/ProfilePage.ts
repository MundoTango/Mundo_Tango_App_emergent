import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  // Selectors - Header section
  private readonly profileHeader: Locator;
  private readonly profileAvatar: Locator;
  private readonly profileName: Locator;
  private readonly profileUsername: Locator;
  private readonly profileBio: Locator;
  private readonly profileLocation: Locator;
  private readonly profileJoinDate: Locator;
  private readonly editProfileButton: Locator;
  private readonly followButton: Locator;
  private readonly messageButton: Locator;
  private readonly moreOptionsButton: Locator;

  // Selectors - Stats section
  private readonly followersCount: Locator;
  private readonly followingCount: Locator;
  private readonly postsCount: Locator;
  private readonly eventsCount: Locator;

  // Selectors - Content tabs
  private readonly postsTab: Locator;
  private readonly memoriesTab: Locator;
  private readonly eventsTab: Locator;
  private readonly groupsTab: Locator;
  private readonly aboutTab: Locator;

  // Selectors - Content areas
  private readonly postsList: Locator;
  private readonly memoriesList: Locator;
  private readonly eventsList: Locator;
  private readonly groupsList: Locator;
  private readonly aboutSection: Locator;

  // Selectors - Edit modal
  private readonly editModal: Locator;
  private readonly editNameInput: Locator;
  private readonly editBioTextarea: Locator;
  private readonly editLocationInput: Locator;
  private readonly editWebsiteInput: Locator;
  private readonly editAvatarUpload: Locator;
  private readonly editCoverUpload: Locator;
  private readonly saveChangesButton: Locator;
  private readonly cancelEditButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.profileHeader = page.locator('[data-testid="profile-header"]');
    this.profileAvatar = page.locator('[data-testid="img-avatar"]');
    this.profileName = page.locator('[data-testid="text-profile-name"]');
    this.profileUsername = page.locator('[data-testid="text-profile-username"]');
    this.profileBio = page.locator('[data-testid="text-profile-bio"]');
    this.profileLocation = page.locator('[data-testid="text-profile-location"]');
    this.profileJoinDate = page.locator('[data-testid="text-profile-join-date"]');
    this.editProfileButton = page.locator('[data-testid="button-edit-profile"]');
    this.followButton = page.locator('[data-testid="button-follow"]');
    this.messageButton = page.locator('[data-testid="button-message"]');
    this.moreOptionsButton = page.locator('[data-testid="button-more-options"]');

    // Initialize stats locators
    this.followersCount = page.locator('[data-testid="text-followers-count"]');
    this.followingCount = page.locator('[data-testid="text-following-count"]');
    this.postsCount = page.locator('[data-testid="text-posts-count"]');
    this.eventsCount = page.locator('[data-testid="text-events-count"]');

    // Initialize tab locators
    this.postsTab = page.locator('[data-testid="tab-posts"]');
    this.memoriesTab = page.locator('[data-testid="tab-memories"]');
    this.eventsTab = page.locator('[data-testid="tab-events"]');
    this.groupsTab = page.locator('[data-testid="tab-groups"]');
    this.aboutTab = page.locator('[data-testid="tab-about"]');

    // Initialize content area locators
    this.postsList = page.locator('[data-testid="posts-list"]');
    this.memoriesList = page.locator('[data-testid="memories-list"]');
    this.eventsList = page.locator('[data-testid="events-list"]');
    this.groupsList = page.locator('[data-testid="groups-list"]');
    this.aboutSection = page.locator('[data-testid="about-section"]');

    // Initialize edit modal locators
    this.editModal = page.locator('[data-testid="modal-edit-profile"]');
    this.editNameInput = page.locator('[data-testid="input-edit-name"]');
    this.editBioTextarea = page.locator('[data-testid="textarea-edit-bio"]');
    this.editLocationInput = page.locator('[data-testid="input-edit-location"]');
    this.editWebsiteInput = page.locator('[data-testid="input-edit-website"]');
    this.editAvatarUpload = page.locator('[data-testid="input-avatar-upload"]');
    this.editCoverUpload = page.locator('[data-testid="input-cover-upload"]');
    this.saveChangesButton = page.locator('[data-testid="button-save-changes"]');
    this.cancelEditButton = page.locator('[data-testid="button-cancel-edit"]');
  }

  // Navigation methods
  async navigateToProfile(username?: string): Promise<void> {
    const path = username ? `/profile/${username}` : '/profile';
    await this.goto(path);
  }

  async navigateToTab(tab: 'posts' | 'memories' | 'events' | 'groups' | 'about'): Promise<void> {
    const tabs = {
      posts: this.postsTab,
      memories: this.memoriesTab,
      events: this.eventsTab,
      groups: this.groupsTab,
      about: this.aboutTab,
    };
    
    await tabs[tab].click();
    await this.waitForPageLoad();
  }

  // Action methods
  async openEditProfile(): Promise<void> {
    await this.editProfileButton.click();
    await this.editModal.waitFor({ state: 'visible' });
  }

  async editProfile(data: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
  }): Promise<void> {
    await this.openEditProfile();
    
    if (data.name) {
      await this.editNameInput.clear();
      await this.editNameInput.fill(data.name);
    }
    
    if (data.bio) {
      await this.editBioTextarea.clear();
      await this.editBioTextarea.fill(data.bio);
    }
    
    if (data.location) {
      await this.editLocationInput.clear();
      await this.editLocationInput.fill(data.location);
    }
    
    if (data.website) {
      await this.editWebsiteInput.clear();
      await this.editWebsiteInput.fill(data.website);
    }
    
    await this.saveChangesButton.click();
    await this.editModal.waitFor({ state: 'hidden' });
  }

  async uploadAvatar(filePath: string): Promise<void> {
    await this.editAvatarUpload.setInputFiles(filePath);
  }

  async uploadCover(filePath: string): Promise<void> {
    await this.editCoverUpload.setInputFiles(filePath);
  }

  async followUser(): Promise<void> {
    await this.followButton.click();
    await this.expectToastMessage('User followed successfully');
  }

  async unfollowUser(): Promise<void> {
    await this.followButton.click();
    await this.expectToastMessage('User unfollowed successfully');
  }

  async sendMessage(): Promise<void> {
    await this.messageButton.click();
    await this.waitForPageLoad();
  }

  // Validation methods
  async verifyProfileInfo(expected: {
    name?: string;
    username?: string;
    bio?: string;
    location?: string;
  }): Promise<void> {
    if (expected.name) {
      const name = await this.profileName.textContent();
      expect(name).toContain(expected.name);
    }
    
    if (expected.username) {
      const username = await this.profileUsername.textContent();
      expect(username).toContain(expected.username);
    }
    
    if (expected.bio) {
      const bio = await this.profileBio.textContent();
      expect(bio).toContain(expected.bio);
    }
    
    if (expected.location) {
      const location = await this.profileLocation.textContent();
      expect(location).toContain(expected.location);
    }
  }

  async getStats(): Promise<{
    followers: number;
    following: number;
    posts: number;
    events: number;
  }> {
    const followers = await this.followersCount.textContent() || '0';
    const following = await this.followingCount.textContent() || '0';
    const posts = await this.postsCount.textContent() || '0';
    const events = await this.eventsCount.textContent() || '0';
    
    return {
      followers: parseInt(followers.replace(/\D/g, '')),
      following: parseInt(following.replace(/\D/g, '')),
      posts: parseInt(posts.replace(/\D/g, '')),
      events: parseInt(events.replace(/\D/g, '')),
    };
  }

  async isFollowing(): Promise<boolean> {
    const buttonText = await this.followButton.textContent();
    return buttonText?.toLowerCase().includes('unfollow') || false;
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="profile-header"]',
      '[data-testid="img-avatar"]',
      '[data-testid="text-profile-name"]',
      '[data-testid="text-profile-username"]',
      '[data-testid="tab-posts"]',
      '[data-testid="tab-memories"]',
      '[data-testid="tab-events"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'profile-page');
  }

  async takeHeaderSnapshot(): Promise<void> {
    await this.takeElementSnapshot('[data-testid="profile-header"]', 'profile-header');
  }
}