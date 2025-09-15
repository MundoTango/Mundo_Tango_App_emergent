# Page Objects Guide

## Overview

This guide documents all page objects created for the Mundo Tango application's end-to-end testing framework. The page objects follow the Page Object Model (POM) pattern for maintainable and scalable test automation.

## Structure

All page objects are located in `tests/e2e/pages/` and organized by feature areas:

```
tests/e2e/pages/
├── BasePage.ts                 # Base class with common functionality
├── index.ts                     # Central export file
├── auth/                        # Authentication pages
│   ├── LoginPage.ts
│   └── RegisterPage.ts
├── social/                      # Social features
│   ├── ProfilePage.ts
│   ├── CommunityPage.ts
│   ├── TimelinePage.ts
│   └── MessagesPage.ts
├── events/                      # Event management
│   └── EventsPage.ts
├── housing/                     # Housing marketplace
│   └── HousingMarketplacePage.ts
├── lifeceo/                     # LifeCEO dashboard
│   └── LifeCEODashboardPage.ts
├── admin/                       # Admin features
│   └── AdminDashboardPage.ts
├── guest/                       # Guest onboarding
├── guest-onboarding/            # Guest onboarding steps
└── registration/                # User registration flow
```

## Base Page Features

All page objects extend from `BasePage` which provides:

### Core Methods
- `goto(path)` - Navigate to a specific path
- `waitForPageLoad()` - Wait for page to fully load
- `getPageTitle()` - Get current page title
- `getUrl()` - Get current URL

### Element Interactions
- `clickElement(selector)` - Click an element
- `fillInput(selector, value)` - Fill input field
- `selectOption(selector, value)` - Select dropdown option
- `toggleCheckbox(selector, checked)` - Check/uncheck checkbox
- `getTextContent(selector)` - Get element text

### Visual Testing
- `takeVisualSnapshot(name, options)` - Full page visual regression
- `takeElementSnapshot(selector, name, options)` - Element visual regression
- `takeScreenshot(name)` - Standard screenshot

### Accessibility
- `checkAccessibility()` - Run accessibility checks
- `checkForBrokenLinks()` - Check for broken links on page
- `verifyPageStructure(expectedElements)` - Verify page elements exist

### Navigation
- `navigateViaNavbar(linkText)` - Navigate using navbar
- `navigateViaSidebar(linkText)` - Navigate using sidebar
- `search(query)` - Use global search
- `logout()` - Logout from application

## Page Object Categories

### Authentication Pages

#### LoginPage
- **Path**: `/auth/login`
- **Key Methods**:
  - `login(email, password, rememberMe?)` - Complete login flow
  - `loginWithGoogle()` - OAuth Google login
  - `loginWithGithub()` - OAuth GitHub login
  - `verifyLoginSuccess()` - Verify successful login
  - `verifyErrorMessage(message)` - Check error messages

#### RegisterPage
- **Path**: `/auth/register`
- **Key Methods**:
  - `fillRegistrationForm(data)` - Fill registration form
  - `completeRegistration(data)` - Complete full registration
  - `acceptTermsAndConditions()` - Accept T&C
  - `verifyPasswordStrength(strength)` - Check password strength indicator
  - `isRegistrationSuccessful()` - Verify registration success

### Social Pages

#### ProfilePage
- **Path**: `/profile` or `/profile/{username}`
- **Key Methods**:
  - `editProfile(data)` - Edit profile information
  - `followUser()` / `unfollowUser()` - Follow/unfollow actions
  - `uploadAvatar(filePath)` - Upload profile picture
  - `getStats()` - Get profile statistics
  - `navigateToTab(tab)` - Navigate profile tabs

#### CommunityPage
- **Path**: `/community`
- **Key Methods**:
  - `createPost(content, options)` - Create new post
  - `likePost(postId)` - Like a post
  - `commentOnPost(postId, comment)` - Add comment
  - `filterFeed(filter)` - Filter community feed
  - `searchCommunity(query)` - Search posts

#### TimelinePage
- **Path**: `/enhanced-timeline-v2`
- **Key Methods**:
  - `filterTimeline(filter)` - Filter timeline content
  - `interactWithPost(postId, action)` - Like/comment/share
  - `viewStory(userId)` - View user story
  - `addStory()` - Add new story
  - `scrollToLoadMore()` - Load more content

#### MessagesPage
- **Path**: `/messages`
- **Key Methods**:
  - `sendMessage(message)` - Send message
  - `openConversation(userId)` - Open chat
  - `startNewConversation(username)` - Start new chat
  - `getUnreadCount(userId)` - Get unread messages count

### Event Pages

#### EventsPage
- **Path**: `/events`
- **Key Methods**:
  - `searchEvents(query)` - Search events
  - `applyFilters(filters)` - Apply event filters
  - `attendEvent(eventId)` - Register for event
  - `changeView(view)` - Switch view (grid/list/calendar/map)
  - `navigateToEventDetail(eventId)` - View event details

### Housing Pages

#### HousingMarketplacePage
- **Path**: `/housing-marketplace`
- **Key Methods**:
  - `searchListings(query)` - Search housing listings
  - `applyFilters(filters)` - Filter listings
  - `toggleMapView()` - Switch to map view
  - `saveListing(listingId)` - Save listing
  - `contactHost(listingId)` - Contact property host

### LifeCEO Pages

#### LifeCEODashboardPage
- **Path**: `/lifeceo`
- **Key Methods**:
  - `addGoal(goal)` - Add new goal
  - `addTask(task)` - Add new task
  - `addHabit(habit)` - Add new habit
  - `askAI(question)` - Use AI assistant
  - `checkInHabit(habitId)` - Check in habit
  - `updateGoalProgress(goalId, progress)` - Update goal

### Admin Pages

#### AdminDashboardPage
- **Path**: `/admin/dashboard`
- **Key Methods**:
  - `createAnnouncement(title, message)` - Send announcement
  - `exportData(type)` - Export data
  - `toggleMaintenanceMode(enable)` - Enable/disable maintenance
  - `getStats()` - Get admin statistics
  - `navigateToUsersManagement()` - Go to user management

## Using Page Objects in Tests

### Basic Usage Example

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, ProfilePage } from '../pages';

test('User can login and view profile', async ({ page }) => {
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);
  
  // Navigate and login
  await loginPage.navigateToLogin();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.verifyLoginSuccess();
  
  // Navigate to profile
  await profilePage.navigateToProfile();
  await profilePage.verifyPageElements();
  
  // Check accessibility
  await profilePage.checkPageAccessibility();
  
  // Take visual snapshot
  await profilePage.takePageSnapshot('profile-after-login');
});
```

### Advanced Usage with Multiple Pages

```typescript
import { test } from '@playwright/test';
import { 
  LoginPage, 
  CommunityPage, 
  EventsPage 
} from '../pages';

test('Complete user journey', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const communityPage = new CommunityPage(page);
  const eventsPage = new EventsPage(page);
  
  // Login
  await loginPage.navigateToLogin();
  await loginPage.login('user@example.com', 'password');
  
  // Create a community post
  await communityPage.navigateToCommunity();
  await communityPage.createPost('Hello World!', {
    privacy: 'public'
  });
  
  // Search for events
  await eventsPage.navigateToEvents();
  await eventsPage.searchEvents('Tango');
  await eventsPage.applyFilters({
    location: 'Buenos Aires',
    category: 'Dance'
  });
  
  // Verify event found and attend
  const eventCount = await eventsPage.getEventCount();
  expect(eventCount).toBeGreaterThan(0);
  await eventsPage.attendEvent('event-123');
});
```

## Best Practices

1. **Always use data-testid attributes** for selectors to ensure stability
2. **Extend BasePage** for all new page objects to inherit common functionality
3. **Group related methods** (navigation, actions, validations) within each page object
4. **Use meaningful method names** that describe the action being performed
5. **Include visual regression methods** for critical UI components
6. **Add accessibility checks** to ensure compliance
7. **Document complex methods** with JSDoc comments
8. **Keep page objects focused** on a single page or component
9. **Use the index file** for clean imports in tests
10. **Update this documentation** when adding new page objects

## Adding New Page Objects

When creating a new page object:

1. Create the file in the appropriate category folder
2. Extend from BasePage
3. Define all selectors as private readonly Locator properties
4. Implement navigation, action, and validation methods
5. Add accessibility and visual regression methods
6. Export from the index.ts file
7. Document in this guide

## Visual Regression Testing

Each page object includes visual regression capabilities:

```typescript
// Full page snapshot
await page.takePageSnapshot('unique-name');

// Element snapshot
await page.takeElementSnapshot('[data-testid="header"]', 'header-snapshot');

// With options
await page.takeVisualSnapshot('page-name', {
  fullPage: true,
  maxDiffPixels: 100,
  threshold: 0.2
});
```

## Accessibility Testing

Every page object includes accessibility checking:

```typescript
// Check entire page accessibility
await page.checkPageAccessibility();

// Check for broken links
const brokenLinks = await page.checkForBrokenLinks();
expect(brokenLinks).toHaveLength(0);

// Verify page structure
await page.verifyPageStructure([
  '[data-testid="header"]',
  '[data-testid="main-content"]',
  '[data-testid="footer"]'
]);
```

## Maintenance

- Review and update selectors when UI changes
- Keep methods simple and focused
- Remove deprecated methods promptly
- Run visual regression tests regularly
- Update documentation with changes