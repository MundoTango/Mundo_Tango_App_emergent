import { test, expect } from '@playwright/test';
import {
  LoginPage,
  ProfilePage,
  CommunityPage,
  EventsPage,
  MessagesPage,
  AdminDashboardPage,
  HousingMarketplacePage,
  LifeCEODashboardPage,
  BillingPage,
  GroupsPage,
  SearchPage,
  OnboardingPage,
  TimelinePage
} from './pages';

/**
 * Example test suite demonstrating how to use the page objects
 */
test.describe('Page Objects Usage Examples', () => {
  
  test('Complete user authentication flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    
    // Navigate to login
    await loginPage.navigateToLogin();
    await loginPage.verifyPageElements();
    
    // Check accessibility
    await loginPage.checkPageAccessibility();
    
    // Take visual snapshot
    await loginPage.takePageSnapshot('login-initial');
    
    // Perform login
    await loginPage.login('test@example.com', 'Password123!', true);
    await loginPage.verifyLoginSuccess();
    
    // Navigate to profile
    await profilePage.navigateToProfile();
    await profilePage.verifyPageElements();
    
    // Verify profile information
    await profilePage.verifyProfileInfo({
      name: 'Test User',
      username: '@testuser'
    });
    
    // Take profile snapshot
    await profilePage.takePageSnapshot('profile-logged-in');
  });

  test('Create and interact with community post', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const communityPage = new CommunityPage(page);
    
    // Setup - Login first
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to community
    await communityPage.navigateToCommunity();
    await communityPage.verifyPageElements();
    
    // Create a new post
    await communityPage.createPost('Hello Mundo Tango community! 🎶', {
      privacy: 'public'
    });
    
    // Verify post was created
    const postCount = await communityPage.getPostCount();
    expect(postCount).toBeGreaterThan(0);
    
    // Search for the post
    await communityPage.searchCommunity('Hello Mundo');
    
    // Like a post
    await communityPage.likePost('post-123');
    await communityPage.isPostLiked('post-123');
    
    // Take community snapshot
    await communityPage.takePageSnapshot('community-with-posts');
  });

  test('Search and attend an event', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const eventsPage = new EventsPage(page);
    
    // Setup - Login
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to events
    await eventsPage.navigateToEvents();
    await eventsPage.verifyPageElements();
    
    // Search for Tango events
    await eventsPage.searchEvents('Tango workshop');
    
    // Apply filters
    await eventsPage.applyFilters({
      location: 'Buenos Aires',
      category: 'Workshop',
      maxPrice: 50
    });
    
    // Verify events found
    const eventCount = await eventsPage.getEventCount();
    expect(eventCount).toBeGreaterThan(0);
    
    // Attend first event
    await eventsPage.attendEvent('event-1');
    
    // Verify attendance
    const isAttending = await eventsPage.isEventAttending('event-1');
    expect(isAttending).toBeTruthy();
    
    // Take snapshot
    await eventsPage.takePageSnapshot('events-filtered');
  });

  test('Manage LifeCEO goals and tasks', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const lifeceoPage = new LifeCEODashboardPage(page);
    
    // Setup - Login
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to LifeCEO
    await lifeceoPage.navigateToLifeCEO();
    await lifeceoPage.verifyPageElements();
    
    // Add a new goal
    await lifeceoPage.addGoal({
      title: 'Master Tango Basics',
      description: 'Learn fundamental tango steps and techniques',
      deadline: '2024-12-31',
      category: 'Personal Development'
    });
    
    // Add tasks
    await lifeceoPage.addTask({
      title: 'Practice basic steps for 30 minutes',
      priority: 'high',
      dueDate: '2024-01-15'
    });
    
    // Add a habit
    await lifeceoPage.addHabit({
      name: 'Daily Tango Practice',
      frequency: 'daily',
      target: 30
    });
    
    // Check in habit
    await lifeceoPage.checkInHabit('habit-1');
    
    // Use AI assistant
    await lifeceoPage.askAI('How can I improve my tango technique?');
    
    // Take analytics snapshot
    await lifeceoPage.takeAnalyticsSnapshot();
  });

  test('Admin dashboard operations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminDashboardPage(page);
    
    // Setup - Login as admin
    await loginPage.navigateToLogin();
    await loginPage.login('admin@example.com', 'AdminPassword123!');
    
    // Navigate to admin dashboard
    await adminPage.navigateToAdminDashboard();
    await adminPage.verifyAdminAccess();
    await adminPage.verifyPageElements();
    
    // Check stats
    const stats = await adminPage.getStats();
    expect(stats.totalUsers).toBeGreaterThan(0);
    
    // Create announcement
    await adminPage.createAnnouncement(
      'System Maintenance',
      'The platform will undergo maintenance on Sunday 2-4 AM'
    );
    
    // Export data
    await adminPage.exportData('users');
    
    // Verify charts are present
    await adminPage.verifyChartPresence();
    
    // Take dashboard snapshot
    await adminPage.takePageSnapshot('admin-dashboard-overview');
    await adminPage.takeChartsSnapshot();
  });

  test('Complete onboarding flow', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    
    // Navigate to onboarding
    await onboardingPage.navigateToOnboarding();
    await onboardingPage.verifyPageElements();
    
    // Start onboarding
    await onboardingPage.startOnboarding();
    
    // Setup profile
    await onboardingPage.setupProfile({
      displayName: 'New User',
      bio: 'Passionate about Tango and dance',
      location: 'Buenos Aires, Argentina',
      profilePicture: './test-assets/profile.jpg'
    });
    
    // Select interests
    await onboardingPage.selectInterests([
      'tango',
      'milonga',
      'dance',
      'music',
      'culture'
    ]);
    
    // Set preferences
    await onboardingPage.setPreferences({
      notifications: true,
      language: 'en',
      timezone: 'America/Argentina/Buenos_Aires'
    });
    
    // Verify progress
    const progress = await onboardingPage.getProgressPercentage();
    expect(progress).toBe(100);
    
    // Complete onboarding
    await onboardingPage.completeOnboarding();
    
    // Verify completion
    const isComplete = await onboardingPage.isOnboardingComplete();
    expect(isComplete).toBeTruthy();
  });

  test('Housing marketplace search and filter', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const housingPage = new HousingMarketplacePage(page);
    
    // Setup - Login
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to housing marketplace
    await housingPage.navigateToHousingMarketplace();
    await housingPage.verifyPageElements();
    
    // Search for listings
    await housingPage.searchListings('Studio apartment in Palermo');
    
    // Apply filters
    await housingPage.applyFilters({
      location: 'Palermo, Buenos Aires',
      minPrice: 500,
      maxPrice: 1500,
      propertyType: 'apartment',
      bedrooms: '1',
      amenities: ['wifi', 'kitchen', 'laundry']
    });
    
    // Get listing count
    const listingCount = await housingPage.getListingCount();
    expect(listingCount).toBeGreaterThan(0);
    
    // Toggle map view
    await housingPage.toggleMapView();
    const isMapActive = await housingPage.isMapViewActive();
    expect(isMapActive).toBeTruthy();
    
    // Save a listing
    await housingPage.saveListing('listing-1');
    const isSaved = await housingPage.isListingSaved('listing-1');
    expect(isSaved).toBeTruthy();
    
    // Take marketplace snapshot
    await housingPage.takePageSnapshot('housing-filtered-results');
  });

  test('Timeline interactions and stories', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const timelinePage = new TimelinePage(page);
    
    // Setup - Login
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to timeline
    await timelinePage.navigateToTimeline();
    await timelinePage.verifyPageElements();
    
    // Filter timeline
    await timelinePage.filterTimeline('friends');
    
    // Interact with posts
    await timelinePage.interactWithPost('post-1', 'like');
    await timelinePage.interactWithPost('post-2', 'comment');
    
    // Check if post is liked
    const isLiked = await timelinePage.isPostLiked('post-1');
    expect(isLiked).toBeTruthy();
    
    // View story
    await timelinePage.viewStory('user-123');
    
    // Add story
    await timelinePage.addStory();
    
    // Get online users count
    const onlineUsers = await timelinePage.getOnlineUsersCount();
    expect(onlineUsers).toBeGreaterThan(0);
    
    // Scroll to load more
    await timelinePage.scrollToLoadMore();
    
    // Take timeline snapshot
    await timelinePage.takePageSnapshot('timeline-with-interactions');
  });

  test('Group creation and management', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const groupsPage = new GroupsPage(page);
    
    // Setup - Login
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to groups
    await groupsPage.navigateToGroups();
    await groupsPage.verifyPageElements();
    
    // Create a new group
    await groupsPage.createGroup({
      name: 'Buenos Aires Tango Enthusiasts',
      description: 'A group for passionate tango dancers in Buenos Aires',
      category: 'Dance',
      isPrivate: false
    });
    
    // Search for groups
    await groupsPage.searchGroups('Tango');
    
    // Switch to my groups tab
    await groupsPage.switchTab('my');
    
    // Get group count
    const groupCount = await groupsPage.getGroupCount();
    expect(groupCount).toBeGreaterThan(0);
    
    // Join a group
    await groupsPage.joinGroup('group-123');
    const isMember = await groupsPage.isGroupMember('group-123');
    expect(isMember).toBeTruthy();
    
    // Take groups snapshot
    await groupsPage.takePageSnapshot('groups-my-groups');
  });

  test('Global search functionality', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const searchPage = new SearchPage(page);
    
    // Setup - Login
    await loginPage.navigateToLogin();
    await loginPage.login('test@example.com', 'Password123!');
    
    // Navigate to search with query
    await searchPage.navigateToSearch('Tango lessons');
    await searchPage.verifyPageElements();
    
    // Verify search query
    await searchPage.verifySearchQuery('Tango lessons');
    
    // Switch between categories
    await searchPage.switchCategory('events');
    await searchPage.switchCategory('people');
    await searchPage.switchCategory('groups');
    
    // Apply filters
    await searchPage.applyFilters({
      location: 'Buenos Aires',
      sortBy: 'relevance'
    });
    
    // Get result count
    const resultCount = await searchPage.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
    
    // Load more results
    await searchPage.loadMoreResults();
    
    // Click on a result
    await searchPage.clickResult('result-1');
    
    // Take search results snapshot
    await searchPage.takePageSnapshot('search-results-filtered');
  });

  test('Visual regression testing example', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const communityPage = new CommunityPage(page);
    
    // Take snapshots of key pages
    await loginPage.navigateToLogin();
    await loginPage.takePageSnapshot('login-page-visual');
    await loginPage.takeFormSnapshot();
    
    // Login and take authenticated snapshots
    await loginPage.login('test@example.com', 'Password123!');
    
    await profilePage.navigateToProfile();
    await profilePage.takePageSnapshot('profile-page-visual');
    await profilePage.takeHeaderSnapshot();
    
    await communityPage.navigateToCommunity();
    await communityPage.takePageSnapshot('community-page-visual');
    
    // Take element-specific snapshots
    await communityPage.takePostSnapshot('post-1');
  });

  test('Accessibility testing across pages', async ({ page }) => {
    const pagesToTest = [
      { Page: LoginPage, path: '/auth/login', name: 'Login' },
      { Page: ProfilePage, path: '/profile', name: 'Profile' },
      { Page: CommunityPage, path: '/community', name: 'Community' },
      { Page: EventsPage, path: '/events', name: 'Events' },
      { Page: GroupsPage, path: '/groups', name: 'Groups' },
      { Page: SearchPage, path: '/search', name: 'Search' }
    ];
    
    for (const { Page, path, name } of pagesToTest) {
      const pageObject = new Page(page);
      await page.goto(path);
      
      // Run accessibility checks
      await pageObject.checkPageAccessibility();
      
      // Check for broken links
      const brokenLinks = await pageObject.checkForBrokenLinks();
      expect(brokenLinks).toHaveLength(0);
      
      console.log(`✅ ${name} page passed accessibility checks`);
    }
  });
});

/**
 * Performance testing example
 */
test.describe('Performance Testing with Page Objects', () => {
  test('Measure page load times', async ({ page }) => {
    const metrics = [];
    
    // Measure login page load
    const loginPage = new LoginPage(page);
    const loginStart = Date.now();
    await loginPage.navigateToLogin();
    const loginLoadTime = Date.now() - loginStart;
    metrics.push({ page: 'Login', loadTime: loginLoadTime });
    
    // Login
    await loginPage.login('test@example.com', 'Password123!');
    
    // Measure other pages
    const pages = [
      { Page: ProfilePage, method: 'navigateToProfile', name: 'Profile' },
      { Page: CommunityPage, method: 'navigateToCommunity', name: 'Community' },
      { Page: EventsPage, method: 'navigateToEvents', name: 'Events' },
      { Page: TimelinePage, method: 'navigateToTimeline', name: 'Timeline' }
    ];
    
    for (const { Page, method, name } of pages) {
      const pageObject = new Page(page);
      const start = Date.now();
      await pageObject[method]();
      const loadTime = Date.now() - start;
      metrics.push({ page: name, loadTime });
    }
    
    // Assert all pages load within acceptable time
    for (const metric of metrics) {
      console.log(`${metric.page}: ${metric.loadTime}ms`);
      expect(metric.loadTime).toBeLessThan(3000); // 3 seconds max
    }
  });
});