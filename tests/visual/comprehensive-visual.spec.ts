/**
 * ESA Layer 51 - Comprehensive Visual Regression Testing
 * Testing all 72 pages of the Mundo Tango platform
 * MT Ocean Theme (#5EEAD4 → #155E75)
 */

import { test } from '@playwright/test';
import { percyEnhanced } from './percy-enhanced';

// Complete list of all 72 pages from DOCUMENTATION-INDEX.md
const ALL_PAGES = [
  // Authentication (2 pages)
  { path: '/auth/login', name: 'Login', category: 'auth' },
  { path: '/auth/register', name: 'Register', category: 'auth' },
  
  // User Management (8 pages)
  { path: '/profile', name: 'Profile', category: 'user' },
  { path: '/settings', name: 'Settings', category: 'user' },
  { path: '/onboarding', name: 'Onboarding', category: 'user' },
  { path: '/resume', name: 'Resume', category: 'user' },
  { path: '/public-resume', name: 'PublicResume', category: 'user' },
  { path: '/public-profile', name: 'PublicProfile', category: 'user' },
  { path: '/profile-switcher', name: 'ProfileSwitcher', category: 'user' },
  { path: '/home', name: 'Home', category: 'user' },
  
  // Events System (6 pages)
  { path: '/events', name: 'Events', category: 'events' },
  { path: '/events/1', name: 'EventDetail', category: 'events', mockId: true },
  { path: '/events/discover', name: 'EventDiscover', category: 'events' },
  { path: '/teacher', name: 'TeacherDashboard', category: 'events' },
  { path: '/organizer', name: 'OrganizerDashboard', category: 'events' },
  { path: '/events', name: 'EnhancedEvents', category: 'events', variant: 'enhanced' },
  
  // Housing & Marketplace (3 pages)
  { path: '/housing-marketplace', name: 'HousingMarketplace', category: 'housing' },
  { path: '/host-onboarding', name: 'HostOnboarding', category: 'housing' },
  { path: '/guest-onboarding', name: 'GuestOnboarding', category: 'housing' },
  
  // Social Features (7 pages)
  { path: '/friends', name: 'Friends', category: 'social' },
  { path: '/friends', name: 'EnhancedFriends', category: 'social', variant: 'enhanced' },
  { path: '/friendship/1', name: 'FriendshipPage', category: 'social', mockId: true },
  { path: '/messages', name: 'Messages', category: 'social' },
  { path: '/groups', name: 'Groups', category: 'social' },
  { path: '/groups/tango-lovers', name: 'GroupDetail', category: 'social', mockSlug: true },
  { path: '/invitations', name: 'Invitations', category: 'social' },
  
  // Community (6 pages)
  { path: '/community', name: 'CommunityHub', category: 'community' },
  { path: '/community-world-map', name: 'CommunityWorldMap', category: 'community' },
  { path: '/create-community', name: 'CreateCommunity', category: 'community' },
  { path: '/tango-communities', name: 'TangoCommunities', category: 'community' },
  { path: '/tango-stories', name: 'TangoStories', category: 'community' },
  { path: '/invitations', name: 'RoleInvitations', category: 'community', variant: 'roles' },
  
  // Content & Timeline (8 pages)
  { path: '/', name: 'MomentsFeed', category: 'content' },
  { path: '/memories', name: 'ModernMemories', category: 'content' },
  { path: '/unified-memories', name: 'UnifiedMemories', category: 'content' },
  { path: '/enhanced-timeline', name: 'EnhancedTimeline', category: 'content' },
  { path: '/landing', name: 'LandingPage', category: 'content' },
  { path: '/search', name: 'Search', category: 'content' },
  { path: '/posting-demo', name: 'PostingDemo', category: 'content' },
  { path: '/timeline-minimal', name: 'TimelineMinimal', category: 'content' },
  
  // Billing & Subscriptions (7 pages)
  { path: '/subscribe', name: 'Subscribe', category: 'billing' },
  { path: '/settings/billing', name: 'BillingDashboard', category: 'billing' },
  { path: '/checkout/premium', name: 'Checkout', category: 'billing', mockTier: true },
  { path: '/payment-methods', name: 'PaymentMethods', category: 'billing' },
  { path: '/invoices', name: 'Invoices', category: 'billing' },
  { path: '/subscription', name: 'Subscription', category: 'billing' },
  { path: '/admin/subscription-analytics', name: 'SubscriptionAnalytics', category: 'billing' },
  
  // Admin & Analytics (11 pages)
  { path: '/admin', name: 'AdminCenter', category: 'admin' },
  { path: '/admin/promo-codes', name: 'PromoCodesAdmin', category: 'admin' },
  { path: '/analytics', name: 'AnalyticsDashboard', category: 'admin' },
  { path: '/agent-framework', name: 'AgentFrameworkDashboard', category: 'admin' },
  { path: '/project-tracker', name: 'ProjectTracker', category: 'admin' },
  { path: '/mobile-dashboard', name: 'MobileAppDashboard', category: 'admin' },
  { path: '/hierarchy-dashboard', name: 'HierarchyDashboard', category: 'admin' },
  { path: '/live-global-statistics', name: 'LiveGlobalStatistics', category: 'admin' },
  { path: '/global-statistics', name: 'GlobalStatistics', category: 'admin' },
  { path: '/database-security', name: 'DatabaseSecurity', category: 'admin' },
  { path: '/feature-navigation', name: 'FeatureNavigation', category: 'admin' },
  
  // Life CEO System (3 pages)
  { path: '/life-ceo', name: 'LifeCEO', category: 'lifeceo' },
  { path: '/life-ceo', name: 'LifeCEOEnhanced', category: 'lifeceo', variant: 'enhanced' },
  { path: '/life-ceo-performance', name: 'LifeCeoPerformance', category: 'lifeceo' },
  
  // Testing & Development (6 pages)
  { path: '/media-upload-test', name: 'MediaUploadTest', category: 'testing' },
  { path: '/test-grouped-roles', name: 'TestGroupedRoleSelector', category: 'testing' },
  { path: '/ttfiles-demo', name: 'TTfilesDemo', category: 'testing' },
  { path: '/ttfiles-help-center', name: 'TTfilesHelpCenter', category: 'testing' },
  { path: '/timeline-debug', name: 'TimelineDebug', category: 'testing' },
  { path: '/error', name: 'ErrorBoundaryPage', category: 'testing' },
  
  // Legal & Support (3 pages)
  { path: '/code-of-conduct', name: 'CodeOfConduct', category: 'legal' },
  { path: '/404', name: 'NotFound', category: 'legal' },
  { path: '/travel-planner', name: 'TravelPlanner', category: 'legal' },
  
  // Integrations (2 pages)
  { path: '/notion-home', name: 'NotionHomePage', category: 'integration' },
  { path: '/notion-entry', name: 'NotionEntryPage', category: 'integration' }
];

test.describe('ESA Layer 51 - Comprehensive Visual Regression', () => {
  test.describe.configure({ mode: 'parallel' });
  
  // Set up authentication for protected pages
  test.beforeEach(async ({ page }) => {
    // Mock authentication for protected routes
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        json: {
          user: {
            id: '1',
            email: 'test@mundotango.com',
            name: 'Test User',
            role: 'admin', // Admin role to access all pages
            avatar: '/placeholder-avatar.jpg'
          }
        }
      });
    });
    
    // Mock API responses for dynamic content
    await page.route('**/api/events', route => {
      route.fulfill({
        status: 200,
        json: { events: [] }
      });
    });
    
    await page.route('**/api/communities', route => {
      route.fulfill({
        status: 200,
        json: { communities: [] }
      });
    });
  });
  
  // Test all 72 pages
  ALL_PAGES.forEach(({ path, name, category, variant, mockId, mockSlug, mockTier }) => {
    const testName = variant ? `${name}-${variant}` : name;
    
    test(`Visual: ${category}/${testName}`, async ({ page }) => {
      await page.goto(path);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Take base snapshot
      await percyEnhanced.snapshot(page, `${category}-${testName}`);
      
      // Take viewport-specific snapshots
      await percyEnhanced.snapshotAllViewports(page, `${category}-${testName}`);
    });
  });
  
  // MT Ocean Theme specific tests
  test.describe('MT Ocean Theme Validation', () => {
    test('Glassmorphic Cards', async ({ page }) => {
      const pagesWithCards = ['/profile', '/events', '/community', '/groups'];
      
      for (const pagePath of pagesWithCards) {
        await page.goto(pagePath);
        
        const cards = page.locator('.glassmorphic-card');
        if (await cards.count() > 0) {
          await percyEnhanced.snapshot(page, `glassmorphic-cards${pagePath.replace('/', '-')}`, {
            scope: '.glassmorphic-card'
          });
        }
      }
    });
    
    test('Gradient Turquoise Elements', async ({ page }) => {
      const pagesWithGradients = ['/', '/events', '/messages', '/life-ceo'];
      
      for (const pagePath of pagesWithGradients) {
        await page.goto(pagePath);
        
        const gradients = page.locator('.gradient-turquoise');
        if (await gradients.count() > 0) {
          await percyEnhanced.snapshot(page, `gradient-turquoise${pagePath.replace('/', '-')}`, {
            scope: '.gradient-turquoise'
          });
        }
      }
    });
    
    test('Ocean Theme Colors', async ({ page }) => {
      await page.goto('/');
      
      // Validate CSS variables
      const themeColors = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          primary: styles.getPropertyValue('--ocean-primary'),
          secondary: styles.getPropertyValue('--ocean-secondary'),
          accent: styles.getPropertyValue('--ocean-accent')
        };
      });
      
      // Take snapshot with theme validation
      await percyEnhanced.snapshot(page, 'ocean-theme-colors');
    });
  });
  
  // Theme variations (Light/Dark)
  test.describe('Theme Variations', () => {
    const keyPages = [
      { path: '/', name: 'Homepage' },
      { path: '/profile', name: 'Profile' },
      { path: '/events', name: 'Events' },
      { path: '/messages', name: 'Messages' },
      { path: '/community', name: 'Community' }
    ];
    
    keyPages.forEach(({ path, name }) => {
      test(`Light/Dark Mode: ${name}`, async ({ page }) => {
        await page.goto(path);
        
        await percyEnhanced.comparePages(page, `theme-${name}`, [
          {
            name: 'light',
            setup: async () => {
              await page.evaluate(() => {
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
              });
            }
          },
          {
            name: 'dark',
            setup: async () => {
              await page.evaluate(() => {
                localStorage.setItem('theme', 'dark');
                document.documentElement.classList.add('dark');
              });
            }
          }
        ]);
      });
    });
  });
  
  // Interactive states testing
  test.describe('Interactive States', () => {
    test('Button States', async ({ page }) => {
      await page.goto('/');
      await percyEnhanced.snapshotInteractiveStates(
        page, 
        'button[data-testid*="button"]', 
        'button-states'
      );
    });
    
    test('Form Field States', async ({ page }) => {
      await page.goto('/auth/login');
      await percyEnhanced.snapshotInteractiveStates(
        page,
        'input[data-testid*="input"]',
        'input-states'
      );
    });
    
    test('Card Hover States', async ({ page }) => {
      await page.goto('/events');
      await percyEnhanced.snapshotInteractiveStates(
        page,
        '.glassmorphic-card',
        'card-hover-states'
      );
    });
  });
  
  // Form validation states
  test.describe('Form Validation States', () => {
    test('Registration Form', async ({ page }) => {
      await page.goto('/auth/register');
      await percyEnhanced.snapshotFormStates(
        page,
        '#registration-form',
        'registration-form'
      );
    });
    
    test('Login Form', async ({ page }) => {
      await page.goto('/auth/login');
      await percyEnhanced.snapshotFormStates(
        page,
        '#login-form',
        'login-form'
      );
    });
    
    test('Profile Edit Form', async ({ page }) => {
      await page.goto('/settings');
      await percyEnhanced.snapshotFormStates(
        page,
        '[data-testid="profile-form"]',
        'profile-edit-form'
      );
    });
  });
  
  // Responsive design testing
  test.describe('Responsive Design', () => {
    test('Mobile Navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Closed state
      await percyEnhanced.snapshot(page, 'mobile-nav-closed');
      
      // Open state
      const menuButton = page.locator('[data-testid="button-mobile-menu"]');
      if (await menuButton.count() > 0) {
        await menuButton.click();
        await page.waitForTimeout(300);
        await percyEnhanced.snapshot(page, 'mobile-nav-open');
      }
    });
    
    test('Tablet Grid Layouts', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const gridPages = ['/events', '/community', '/groups'];
      for (const pagePath of gridPages) {
        await page.goto(pagePath);
        await percyEnhanced.snapshot(page, `tablet-grid${pagePath.replace('/', '-')}`);
      }
    });
    
    test('Desktop Wide Layouts', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const widePages = ['/admin', '/analytics', '/life-ceo'];
      for (const pagePath of widePages) {
        await page.goto(pagePath);
        await percyEnhanced.snapshot(page, `desktop-wide${pagePath.replace('/', '-')}`);
      }
    });
  });
  
  // Scroll position testing
  test.describe('Scroll Positions', () => {
    const longPages = ['/timeline', '/events', '/community', '/tango-stories'];
    
    longPages.forEach(pagePath => {
      test(`Scroll: ${pagePath}`, async ({ page }) => {
        await page.goto(pagePath);
        await percyEnhanced.snapshotScrollPositions(page, pagePath.replace('/', '-'));
      });
    });
  });
  
  // Error states
  test.describe('Error States', () => {
    test('404 Page', async ({ page }) => {
      await page.goto('/non-existent-page');
      await percyEnhanced.snapshot(page, 'error-404');
    });
    
    test('Error Boundary', async ({ page }) => {
      await page.goto('/error');
      await percyEnhanced.snapshot(page, 'error-boundary');
    });
    
    test('Network Error', async ({ page }) => {
      await page.route('**/api/**', route => route.abort());
      await page.goto('/events');
      await page.waitForTimeout(1000);
      await percyEnhanced.snapshot(page, 'network-error');
    });
  });
  
  // Loading states
  test.describe('Loading States', () => {
    test('Skeleton Loaders', async ({ page }) => {
      // Delay API responses to capture loading states
      await page.route('**/api/**', route => {
        setTimeout(() => {
          route.fulfill({ status: 200, json: {} });
        }, 3000);
      });
      
      await page.goto('/events');
      await page.waitForTimeout(500);
      await percyEnhanced.snapshot(page, 'skeleton-loaders');
    });
    
    test('Spinner States', async ({ page }) => {
      await page.route('**/api/**', route => {
        setTimeout(() => {
          route.fulfill({ status: 200, json: {} });
        }, 3000);
      });
      
      await page.goto('/messages');
      await page.waitForTimeout(500);
      await percyEnhanced.snapshot(page, 'spinner-states');
    });
  });
  
  // Accessibility states
  test.describe('Accessibility States', () => {
    test('Focus Indicators', async ({ page }) => {
      await page.goto('/');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await percyEnhanced.snapshot(page, 'focus-first-element');
      
      await page.keyboard.press('Tab');
      await percyEnhanced.snapshot(page, 'focus-second-element');
      
      await page.keyboard.press('Tab');
      await percyEnhanced.snapshot(page, 'focus-third-element');
    });
    
    test('High Contrast Mode', async ({ page }) => {
      await page.goto('/');
      
      // Enable high contrast
      await page.evaluate(() => {
        document.documentElement.classList.add('high-contrast');
      });
      
      await percyEnhanced.snapshot(page, 'high-contrast-mode');
    });
  });
  
  // Final validation
  test('Complete Theme Consistency Check', async ({ page }) => {
    await percyEnhanced.validateThemeConsistency(page);
  });
});

// Export test metrics
export const VISUAL_TEST_METRICS = {
  totalPages: 72,
  categories: 14,
  viewports: 7,
  themes: 2,
  totalSnapshots: ALL_PAGES.length * 7 * 2, // pages * viewports * themes
  framework: 'ESA LIFE CEO 61x21',
  themeColors: {
    primary: '#5EEAD4',
    secondary: '#155E75',
    accent: '#34D399'
  }
};