/**
 * MT Platform - Complete Customer Journey Map
 * Used by run-full-audit.ts to audit pages in journey order
 */

export interface JourneyConfig {
  id: string;
  name: string;
  description: string;
  userRole: 'anonymous' | 'standard' | 'premium' | 'admin' | 'super_admin';
  pages: string[];
  requiredAuth?: boolean;
  requiredRole?: string;
}

// Complete journey-based page organization
export const CUSTOMER_JOURNEYS: JourneyConfig[] = [
  {
    id: 'journey-1',
    name: 'Anonymous Visitor → Registration',
    description: 'Public access to user registration flow',
    userRole: 'anonymous',
    pages: [
      '/',                    // Landing page
      '/login',               // Login
      '/register',            // Registration
      '/verify-email',        // Email verification
      '/welcome-setup',       // Welcome/onboarding
      '/forgot-password',     // Password reset
      '/reset-password'       // Password reset confirmation
    ],
    requiredAuth: false
  },
  {
    id: 'journey-2',
    name: 'Standard User - Core Platform',
    description: 'All standard user features and pages',
    userRole: 'standard',
    pages: [
      // Primary Entry
      '/memories',                    // Main feed (START HERE)
      
      // Profile Pages
      '/profile',                     // Own profile
      '/profile/edit',                // Edit profile
      '/profile/:userId',             // View other profiles
      
      // Events
      '/events',                      // Browse events
      '/events/create',               // Create event
      '/events/:eventId',             // Event details
      '/events/my-events',            // User's events
      
      // Community
      '/community',                   // Browse communities
      '/community/:communityId',      // Community details
      '/community/create',            // Create community
      '/community/:communityId/feed', // Community feed
      
      // Housing
      '/housing',                     // Browse housing
      '/housing/create',              // Create listing
      '/housing/:listingId',          // Listing details
      '/housing/my-listings',         // User's listings
      
      // Messages
      '/messages',                    // Inbox
      '/messages/:conversationId',    // Conversation
      
      // Social
      '/friends',                     // Friends list
      '/friends/requests',            // Friend requests
      '/friends/suggestions',         // Friend suggestions
      
      // Notifications
      '/notifications',               // All notifications
      
      // Search
      '/search',                      // Global search
      '/search/users',                // Search users
      '/search/events',               // Search events
      '/search/communities',          // Search communities
      
      // Settings
      '/settings',                    // Account settings
      '/settings/privacy',            // Privacy settings
      '/settings/notifications',      // Notification preferences
      '/settings/language',           // Language & i18n
      '/settings/theme',              // Dark mode toggle
      '/settings/subscription'        // Subscription management
    ],
    requiredAuth: true,
    requiredRole: 'user'
  },
  {
    id: 'journey-3',
    name: 'Premium/Life CEO User',
    description: 'Premium subscription features',
    userRole: 'premium',
    pages: [
      '/subscribe',                   // Subscription plans
      '/subscribe/payment',           // Payment flow
      '/subscribe/manage',            // Manage subscription
      
      '/life-ceo',                    // Life CEO dashboard
      '/life-ceo/health',             // Health & Wellness agent
      '/life-ceo/finance',            // Finance Manager agent
      '/life-ceo/career',             // Career Coach agent
      '/life-ceo/relationships',      // Relationship Advisor agent
      '/life-ceo/tasks',              // Task management
      '/life-ceo/goals',              // Goal tracking
      
      '/analytics',                   // Personal analytics
      '/analytics/engagement',        // Engagement metrics
      '/analytics/reports'            // Custom reports
    ],
    requiredAuth: true,
    requiredRole: 'premium'
  },
  {
    id: 'journey-4',
    name: 'Admin Access',
    description: 'Admin panel and management tools',
    userRole: 'admin',
    pages: [
      // Admin Dashboard
      '/admin',                       // Admin dashboard
      
      // User Management
      '/admin/users',                 // User list
      '/admin/users/:userId',         // User details
      '/admin/users/permissions',     // Permissions management
      '/admin/users/roles',           // Role management
      
      // Moderation
      '/admin/moderation',            // Moderation dashboard
      '/admin/moderation/reports',    // Reports queue
      '/admin/moderation/flagged',    // Flagged content
      '/admin/moderation/history',    // Moderation history
      
      // Analytics
      '/admin/analytics',             // Platform analytics
      '/admin/analytics/users',       // User analytics
      '/admin/analytics/revenue',     // Revenue dashboard
      '/admin/analytics/traffic',     // Traffic analysis
      
      // Project Tracker
      '/admin/projects',              // Projects dashboard
      '/admin/projects/dashboard',    // Dashboard view
      '/admin/projects/kanban',       // Kanban view
      '/admin/projects/list',         // List view
      '/admin/projects/sprint',       // Sprint view
      '/admin/projects/epics',        // Epic management
      '/admin/projects/stories',      // Story management
      '/admin/projects/tasks',        // Task management
      '/admin/projects/comments',     // Comments system
      '/admin/projects/github',       // GitHub integration
      
      // ESA Framework
      '/admin/esa-mind',              // ESA Mind dashboard
      '/admin/agent-metrics',         // Agent performance
      
      // Content Management
      '/admin/content',               // Content management
      '/admin/content/featured',      // Featured content
      '/admin/content/moderation',    // Content moderation
      
      // Settings
      '/admin/settings',              // Platform settings
      '/admin/settings/features',     // Feature flags
      '/admin/settings/api',          // API management
      '/admin/settings/integrations'  // Integrations
    ],
    requiredAuth: true,
    requiredRole: 'admin'
  },
  {
    id: 'journey-5',
    name: 'Super Admin (Developer Tools)',
    description: 'Super admin access with developer tools',
    userRole: 'super_admin',
    pages: [
      // Developer Tools
      '/admin/developer',             // Developer dashboard
      '/admin/developer/api',         // API documentation
      '/admin/developer/webhooks',    // Webhooks management
      '/admin/developer/database',    // Database management
      '/admin/developer/diagnostics', // System diagnostics
      
      // Global Tools (accessible on ALL pages)
      // Note: ESA MindMap and AI Intelligence Network are floating components
      // They appear globally but are tested on key pages:
      '/admin/test-esa-mindmap',      // ESA MindMap testing page
      '/admin/test-ai-network'        // AI Intelligence Network testing page
    ],
    requiredAuth: true,
    requiredRole: 'super_admin'
  }
];

// Journey transition tests
export const JOURNEY_TRANSITIONS = [
  {
    id: 'anonymous-to-user',
    name: 'Anonymous → Standard User',
    flow: ['/', '/login', '/register', '/verify-email', '/memories'],
    description: 'User registration and first login'
  },
  {
    id: 'user-to-premium',
    name: 'Standard User → Premium User',
    flow: ['/memories', '/subscribe', '/subscribe/payment', '/life-ceo'],
    description: 'Upgrade to premium subscription'
  },
  {
    id: 'user-to-admin',
    name: 'Standard User → Admin Access',
    flow: ['/memories', '/admin', '/admin/users', '/admin/projects'],
    description: 'Admin user accessing admin panel'
  },
  {
    id: 'cross-feature-nav',
    name: 'Cross-Feature Navigation',
    flow: ['/memories', '/events', '/community', '/housing', '/profile'],
    description: 'Navigate across different platform features'
  }
];

// Page categories for prioritization
export const PAGE_PRIORITIES = {
  critical: [
    '/', '/login', '/register', '/memories', '/admin', '/admin/projects'
  ],
  high: [
    '/events', '/community', '/housing', '/messages', '/profile',
    '/admin/users', '/admin/moderation', '/admin/esa-mind'
  ],
  medium: [
    '/friends', '/notifications', '/search', '/settings',
    '/admin/analytics', '/admin/content'
  ],
  low: [
    '/subscribe', '/life-ceo', '/analytics', '/admin/developer'
  ]
};

// Get total page count
export function getTotalPageCount(): number {
  return CUSTOMER_JOURNEYS.reduce((total, journey) => total + journey.pages.length, 0);
}

// Get pages by priority
export function getPagesByPriority(priority: keyof typeof PAGE_PRIORITIES): string[] {
  return PAGE_PRIORITIES[priority];
}

// Get all pages in journey order
export function getAllPagesInJourneyOrder(): string[] {
  return CUSTOMER_JOURNEYS.flatMap(journey => journey.pages);
}

// Get journey by page
export function getJourneyByPage(page: string): JourneyConfig | undefined {
  return CUSTOMER_JOURNEYS.find(journey => journey.pages.includes(page));
}
