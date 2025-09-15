import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TimelinePage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly createPostButton: Locator;
  private readonly timelineFilter: Locator;
  private readonly refreshButton: Locator;

  // Selectors - Timeline Feed
  private readonly timelineContainer: Locator;
  private readonly timelinePost: Locator;
  private readonly loadingSpinner: Locator;
  private readonly emptyStateMessage: Locator;
  private readonly newPostsIndicator: Locator;

  // Selectors - Post Elements
  private readonly postAuthor: Locator;
  private readonly postContent: Locator;
  private readonly postTimestamp: Locator;
  private readonly postMedia: Locator;
  private readonly postLikeButton: Locator;
  private readonly postCommentButton: Locator;
  private readonly postShareButton: Locator;
  private readonly postMoreOptions: Locator;

  // Selectors - Stories Section
  private readonly storiesContainer: Locator;
  private readonly storyItem: Locator;
  private readonly addStoryButton: Locator;

  // Selectors - Sidebar
  private readonly onlineUsers: Locator;
  private readonly suggestedConnections: Locator;
  private readonly trendingTopics: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-timeline-title"]');
    this.createPostButton = page.locator('[data-testid="button-create-post"]');
    this.timelineFilter = page.locator('[data-testid="select-timeline-filter"]');
    this.refreshButton = page.locator('[data-testid="button-refresh"]');

    // Initialize timeline feed locators
    this.timelineContainer = page.locator('[data-testid="timeline-container"]');
    this.timelinePost = page.locator('[data-testid^="timeline-post-"]');
    this.loadingSpinner = page.locator('[data-testid="loading-timeline"]');
    this.emptyStateMessage = page.locator('[data-testid="text-empty-timeline"]');
    this.newPostsIndicator = page.locator('[data-testid="new-posts-indicator"]');

    // Initialize post element locators
    this.postAuthor = page.locator('[data-testid^="text-post-author-"]');
    this.postContent = page.locator('[data-testid^="text-post-content-"]');
    this.postTimestamp = page.locator('[data-testid^="text-post-timestamp-"]');
    this.postMedia = page.locator('[data-testid^="media-post-"]');
    this.postLikeButton = page.locator('[data-testid^="button-like-post-"]');
    this.postCommentButton = page.locator('[data-testid^="button-comment-post-"]');
    this.postShareButton = page.locator('[data-testid^="button-share-post-"]');
    this.postMoreOptions = page.locator('[data-testid^="button-more-post-"]');

    // Initialize stories section locators
    this.storiesContainer = page.locator('[data-testid="stories-container"]');
    this.storyItem = page.locator('[data-testid^="story-item-"]');
    this.addStoryButton = page.locator('[data-testid="button-add-story"]');

    // Initialize sidebar locators
    this.onlineUsers = page.locator('[data-testid="online-users-list"]');
    this.suggestedConnections = page.locator('[data-testid="suggested-connections"]');
    this.trendingTopics = page.locator('[data-testid="trending-topics"]');
  }

  // Navigation methods
  async navigateToTimeline(): Promise<void> {
    await this.goto('/enhanced-timeline-v2');
  }

  async refreshTimeline(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForPageLoad();
  }

  // Action methods
  async filterTimeline(filter: 'all' | 'following' | 'friends' | 'groups'): Promise<void> {
    await this.timelineFilter.selectOption(filter);
    await this.waitForPageLoad();
  }

  async loadNewPosts(): Promise<void> {
    if (await this.newPostsIndicator.isVisible()) {
      await this.newPostsIndicator.click();
      await this.waitForPageLoad();
    }
  }

  async interactWithPost(postId: string, action: 'like' | 'comment' | 'share'): Promise<void> {
    const actions = {
      like: this.page.locator(`[data-testid="button-like-post-${postId}"]`),
      comment: this.page.locator(`[data-testid="button-comment-post-${postId}"]`),
      share: this.page.locator(`[data-testid="button-share-post-${postId}"]`),
    };
    
    await actions[action].click();
  }

  async viewStory(userId: string): Promise<void> {
    await this.page.locator(`[data-testid="story-item-${userId}"]`).click();
    // Handle story viewer modal
  }

  async addStory(): Promise<void> {
    await this.addStoryButton.click();
    // Handle story creation flow
  }

  async scrollToLoadMore(): Promise<void> {
    await this.scrollToBottom();
    await this.waitForPageLoad();
  }

  // Validation methods
  async getPostCount(): Promise<number> {
    const posts = await this.timelinePost.all();
    return posts.length;
  }

  async verifyPost(postId: string, expected: {
    author?: string;
    content?: string;
    hasMedia?: boolean;
  }): Promise<void> {
    if (expected.author) {
      const author = await this.page.locator(`[data-testid="text-post-author-${postId}"]`).textContent();
      expect(author).toContain(expected.author);
    }
    
    if (expected.content) {
      const content = await this.page.locator(`[data-testid="text-post-content-${postId}"]`).textContent();
      expect(content).toContain(expected.content);
    }
    
    if (expected.hasMedia !== undefined) {
      const hasMedia = await this.page.locator(`[data-testid="media-post-${postId}"]`).isVisible();
      expect(hasMedia).toBe(expected.hasMedia);
    }
  }

  async isPostLiked(postId: string): Promise<boolean> {
    const likeButton = this.page.locator(`[data-testid="button-like-post-${postId}"]`);
    const classes = await likeButton.getAttribute('class');
    return classes?.includes('liked') || false;
  }

  async getOnlineUsersCount(): Promise<number> {
    const users = await this.onlineUsers.locator('[data-testid^="online-user-"]').all();
    return users.length;
  }

  async verifyEmptyState(): Promise<void> {
    await this.emptyStateMessage.waitFor({ state: 'visible' });
    const text = await this.emptyStateMessage.textContent();
    expect(text).toContain('No posts to show');
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-timeline-title"]',
      '[data-testid="button-create-post"]',
      '[data-testid="timeline-container"]',
      '[data-testid="stories-container"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'timeline-page');
  }

  async takePostSnapshot(postId: string): Promise<void> {
    await this.takeElementSnapshot(`[data-testid="timeline-post-${postId}"]`, `timeline-post-${postId}`);
  }
}