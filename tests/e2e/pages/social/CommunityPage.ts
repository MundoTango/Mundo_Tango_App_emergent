import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CommunityPage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly createPostButton: Locator;
  private readonly filterDropdown: Locator;
  private readonly searchBar: Locator;
  private readonly sortDropdown: Locator;

  // Selectors - Feed
  private readonly feedContainer: Locator;
  private readonly postCard: Locator;
  private readonly loadingIndicator: Locator;
  private readonly endOfFeedMessage: Locator;

  // Selectors - Post Actions
  private readonly likeButton: Locator;
  private readonly commentButton: Locator;
  private readonly shareButton: Locator;
  private readonly bookmarkButton: Locator;
  private readonly moreOptionsButton: Locator;

  // Selectors - Sidebar
  private readonly trendingSection: Locator;
  private readonly suggestedUsers: Locator;
  private readonly communityStats: Locator;
  private readonly upcomingEvents: Locator;

  // Selectors - Create Post Modal
  private readonly createPostModal: Locator;
  private readonly postTextarea: Locator;
  private readonly mediaUploadButton: Locator;
  private readonly emojiButton: Locator;
  private readonly privacySelector: Locator;
  private readonly publishButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-community-title"]');
    this.createPostButton = page.locator('[data-testid="button-create-post"]');
    this.filterDropdown = page.locator('[data-testid="dropdown-filter"]');
    this.searchBar = page.locator('[data-testid="input-search-community"]');
    this.sortDropdown = page.locator('[data-testid="dropdown-sort"]');

    // Initialize feed locators
    this.feedContainer = page.locator('[data-testid="feed-container"]');
    this.postCard = page.locator('[data-testid^="card-post-"]');
    this.loadingIndicator = page.locator('[data-testid="loading-feed"]');
    this.endOfFeedMessage = page.locator('[data-testid="text-end-of-feed"]');

    // Initialize post action locators
    this.likeButton = page.locator('[data-testid^="button-like-"]');
    this.commentButton = page.locator('[data-testid^="button-comment-"]');
    this.shareButton = page.locator('[data-testid^="button-share-"]');
    this.bookmarkButton = page.locator('[data-testid^="button-bookmark-"]');
    this.moreOptionsButton = page.locator('[data-testid^="button-more-"]');

    // Initialize sidebar locators
    this.trendingSection = page.locator('[data-testid="section-trending"]');
    this.suggestedUsers = page.locator('[data-testid="section-suggested-users"]');
    this.communityStats = page.locator('[data-testid="section-community-stats"]');
    this.upcomingEvents = page.locator('[data-testid="section-upcoming-events"]');

    // Initialize create post modal locators
    this.createPostModal = page.locator('[data-testid="modal-create-post"]');
    this.postTextarea = page.locator('[data-testid="textarea-post-content"]');
    this.mediaUploadButton = page.locator('[data-testid="button-upload-media"]');
    this.emojiButton = page.locator('[data-testid="button-emoji"]');
    this.privacySelector = page.locator('[data-testid="select-privacy"]');
    this.publishButton = page.locator('[data-testid="button-publish-post"]');
    this.cancelButton = page.locator('[data-testid="button-cancel-post"]');
  }

  // Navigation methods
  async navigateToCommunity(): Promise<void> {
    await this.goto('/community');
  }

  async navigateToPost(postId: string): Promise<void> {
    await this.page.locator(`[data-testid="card-post-${postId}"]`).click();
    await this.waitForPageLoad();
  }

  async navigateToUserProfile(userId: string): Promise<void> {
    await this.page.locator(`[data-testid="link-user-${userId}"]`).click();
    await this.waitForPageLoad();
  }

  // Action methods
  async createPost(content: string, options?: {
    media?: string[];
    privacy?: 'public' | 'friends' | 'private';
  }): Promise<void> {
    await this.createPostButton.click();
    await this.createPostModal.waitFor({ state: 'visible' });
    
    await this.postTextarea.fill(content);
    
    if (options?.media) {
      for (const file of options.media) {
        await this.mediaUploadButton.setInputFiles(file);
      }
    }
    
    if (options?.privacy) {
      await this.privacySelector.selectOption(options.privacy);
    }
    
    await this.publishButton.click();
    await this.createPostModal.waitFor({ state: 'hidden' });
    await this.expectToastMessage('Post created successfully');
  }

  async likePost(postId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-like-${postId}"]`).click();
  }

  async commentOnPost(postId: string, comment: string): Promise<void> {
    await this.page.locator(`[data-testid="button-comment-${postId}"]`).click();
    const commentInput = this.page.locator(`[data-testid="input-comment-${postId}"]`);
    await commentInput.fill(comment);
    await commentInput.press('Enter');
  }

  async sharePost(postId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-share-${postId}"]`).click();
    // Handle share modal
  }

  async bookmarkPost(postId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-bookmark-${postId}"]`).click();
  }

  async filterFeed(filter: 'all' | 'following' | 'popular' | 'recent'): Promise<void> {
    await this.filterDropdown.selectOption(filter);
    await this.waitForPageLoad();
  }

  async sortFeed(sort: 'newest' | 'oldest' | 'most-liked' | 'most-commented'): Promise<void> {
    await this.sortDropdown.selectOption(sort);
    await this.waitForPageLoad();
  }

  async searchCommunity(query: string): Promise<void> {
    await this.searchBar.fill(query);
    await this.searchBar.press('Enter');
    await this.waitForPageLoad();
  }

  async loadMorePosts(): Promise<void> {
    await this.scrollToBottom();
    await this.waitForPageLoad();
  }

  async followSuggestedUser(userId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-follow-${userId}"]`).click();
    await this.expectToastMessage('User followed successfully');
  }

  // Validation methods
  async getPostCount(): Promise<number> {
    const posts = await this.postCard.all();
    return posts.length;
  }

  async verifyPost(postId: string, expected: {
    author?: string;
    content?: string;
    likes?: number;
    comments?: number;
  }): Promise<void> {
    const post = this.page.locator(`[data-testid="card-post-${postId}"]`);
    
    if (expected.author) {
      const author = await post.locator('[data-testid="text-post-author"]').textContent();
      expect(author).toContain(expected.author);
    }
    
    if (expected.content) {
      const content = await post.locator('[data-testid="text-post-content"]').textContent();
      expect(content).toContain(expected.content);
    }
    
    if (expected.likes !== undefined) {
      const likes = await post.locator('[data-testid="text-like-count"]').textContent();
      expect(parseInt(likes || '0')).toBe(expected.likes);
    }
    
    if (expected.comments !== undefined) {
      const comments = await post.locator('[data-testid="text-comment-count"]').textContent();
      expect(parseInt(comments || '0')).toBe(expected.comments);
    }
  }

  async isPostLiked(postId: string): Promise<boolean> {
    const likeButton = this.page.locator(`[data-testid="button-like-${postId}"]`);
    const classes = await likeButton.getAttribute('class');
    return classes?.includes('liked') || false;
  }

  async isPostBookmarked(postId: string): Promise<boolean> {
    const bookmarkButton = this.page.locator(`[data-testid="button-bookmark-${postId}"]`);
    const classes = await bookmarkButton.getAttribute('class');
    return classes?.includes('bookmarked') || false;
  }

  async verifyCommunityStats(expected: {
    totalMembers?: number;
    activePosts?: number;
    onlineNow?: number;
  }): Promise<void> {
    if (expected.totalMembers !== undefined) {
      const members = await this.page.locator('[data-testid="text-total-members"]').textContent();
      expect(parseInt(members || '0')).toBe(expected.totalMembers);
    }
    
    if (expected.activePosts !== undefined) {
      const posts = await this.page.locator('[data-testid="text-active-posts"]').textContent();
      expect(parseInt(posts || '0')).toBe(expected.activePosts);
    }
    
    if (expected.onlineNow !== undefined) {
      const online = await this.page.locator('[data-testid="text-online-now"]').textContent();
      expect(parseInt(online || '0')).toBe(expected.onlineNow);
    }
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-community-title"]',
      '[data-testid="button-create-post"]',
      '[data-testid="feed-container"]',
      '[data-testid="section-trending"]',
      '[data-testid="section-suggested-users"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'community-page');
  }

  async takePostSnapshot(postId: string): Promise<void> {
    await this.takeElementSnapshot(`[data-testid="card-post-${postId}"]`, `post-${postId}`);
  }
}