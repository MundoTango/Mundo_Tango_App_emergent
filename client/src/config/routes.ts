/**
 * ESA LIFE CEO 61x21 AGENTS FRAMEWORK
 * Route Registry - Type-Safe Route Management System
 * 
 * Purpose: Centralized route configuration with TypeScript enforcement
 * Prevents debug/test components from being accidentally used in production
 * 
 * Documentation: docs/build-coordination/route-protection-sprint.md
 * Framework Layer: 21-30 (Type System & Route Registry)
 */

import { lazy, ComponentType } from 'react';
// GroupDetailPageMT now lazy-loaded below for code splitting (ESA Layer 1 - Performance)

/**
 * Route mode classification
 * - production: Routes accessible in production builds
 * - debug: Development/debugging routes (blocked in production)
 * - archive: Deprecated routes kept for reference
 */
export type RouteMode = 'production' | 'debug' | 'archive';

/**
 * Route configuration interface
 * Defines metadata for each route in the application
 */
export interface RouteConfig {
  /** URL path pattern (e.g., '/memories', '/user/:id') */
  path: string;
  
  /** Lazy-loaded component for this route */
  component: ComponentType<any>;
  
  /** Route classification (production/debug/archive) */
  mode: RouteMode;
  
  /** Optional loading message shown during component load */
  loadingMessage?: string;
  
  /** Optional documentation link for this route */
  documentationLink?: string;
  
  /** Optional description of route purpose */
  description?: string;
}

/**
 * Type guard to check if a route is production-ready
 * @param config - Route configuration to check
 * @returns true if route is production mode, false otherwise
 */
export function isProductionRoute(config: RouteConfig): boolean {
  return config.mode === 'production';
}

/**
 * Type guard to filter production routes
 * @param routes - Array of route configurations
 * @returns Only production routes
 */
export function getProductionRoutes(routes: RouteConfig[]): RouteConfig[] {
  return routes.filter(isProductionRoute);
}

/**
 * PRODUCTION ROUTES
 * All routes accessible in production builds
 * Organized by functional area per ESA Framework
 */
export const productionRoutes: RouteConfig[] = [
  // ========== Authentication Routes ==========
  {
    path: '/login',
    component: lazy(() => import('@/pages/auth/login')),
    mode: 'production',
    loadingMessage: 'Loading login...',
    description: 'User login page'
  },
  {
    path: '/register',
    component: lazy(() => import('@/pages/auth/register')),
    mode: 'production',
    loadingMessage: 'Loading registration...',
    description: 'New user registration'
  },
  {
    path: '/forgot-password',
    component: lazy(() => import('@/pages/auth/forgot-password')),
    mode: 'production',
    loadingMessage: 'Loading password reset...',
    description: 'Password reset request'
  },

  // ========== User Management Routes ==========
  {
    path: '/profile/:username?',
    component: lazy(() => import('@/pages/profile')),
    mode: 'production',
    loadingMessage: 'Loading profile...',
    description: 'User profile page'
  },
  {
    path: '/settings',
    component: lazy(() => import('@/pages/UserSettings')),
    mode: 'production',
    loadingMessage: 'Loading settings...',
    description: 'User settings and preferences'
  },
  {
    path: '/account/delete',
    component: lazy(() => import('@/pages/AccountDelete')),
    mode: 'production',
    loadingMessage: 'Loading...',
    description: 'Account deletion'
  },
  {
    path: '/onboarding',
    component: lazy(() => import('@/pages/onboarding')),
    mode: 'production',
    loadingMessage: 'Loading onboarding...',
    description: 'User onboarding flow'
  },
  {
    path: '/resume',
    component: lazy(() => import('@/pages/ResumePage')),
    mode: 'production',
    loadingMessage: 'Loading resume...',
    description: 'User resume/CV page'
  },
  {
    path: '/resume/:username',
    component: lazy(() => import('@/pages/PublicResumePage')),
    mode: 'production',
    loadingMessage: 'Loading resume...',
    description: 'Public resume view'
  },
  {
    path: '/@:username',
    component: lazy(() => import('@/pages/PublicProfilePage')),
    mode: 'production',
    loadingMessage: 'Loading profile...',
    description: 'Public profile page'
  },
  {
    path: '/profile-switcher',
    component: lazy(() => import('@/pages/ProfileSwitcher')),
    mode: 'production',
    loadingMessage: 'Loading...',
    description: 'Profile switcher interface'
  },
  {
    path: '/home',
    component: lazy(() => import('@/pages/home')),
    mode: 'production',
    loadingMessage: 'Loading home...',
    description: 'User home dashboard'
  },

  // ========== Events System Routes ==========
  {
    path: '/events',
    component: lazy(() => import('@/pages/EnhancedEvents')),
    mode: 'production',
    loadingMessage: 'Loading events...',
    description: 'Events discovery and listing'
  },
  {
    path: '/events/:id',
    component: lazy(() => import('@/pages/event-detail')),
    mode: 'production',
    loadingMessage: 'Loading event details...',
    description: 'Event detail page'
  },
  {
    path: '/teacher',
    component: lazy(() => import('@/pages/teacher')),
    mode: 'production',
    loadingMessage: 'Loading teacher dashboard...',
    description: 'Teacher dashboard'
  },
  {
    path: '/organizer',
    component: lazy(() => import('@/pages/organizer')),
    mode: 'production',
    loadingMessage: 'Loading organizer dashboard...',
    description: 'Event organizer dashboard'
  },

  // ========== Housing & Marketplace Routes ==========
  {
    path: '/housing-marketplace',
    component: lazy(() => import('@/pages/housing-marketplace')),
    mode: 'production',
    loadingMessage: 'Loading housing marketplace...',
    description: 'Housing marketplace'
  },
  {
    path: '/host-dashboard',
    component: lazy(() => import('@/pages/HostDashboard')),
    mode: 'production',
    loadingMessage: 'Loading host dashboard...',
    description: 'Host properties dashboard'
  },
  {
    path: '/host-onboarding',
    component: lazy(() => import('@/pages/HostOnboarding')),
    mode: 'production',
    loadingMessage: 'Loading host setup...',
    description: 'Host onboarding flow'
  },
  {
    path: '/guest-onboarding',
    component: lazy(() => import('@/pages/GuestOnboarding')),
    mode: 'production',
    loadingMessage: 'Loading guest setup...',
    description: 'Guest onboarding flow'
  },
  {
    path: '/host-bookings',
    component: lazy(() => import('@/pages/host-bookings')),
    mode: 'production',
    loadingMessage: 'Loading host dashboard...',
    description: 'Host bookings management'
  },
  {
    path: '/my-bookings',
    component: lazy(() => import('@/pages/my-bookings')),
    mode: 'production',
    loadingMessage: 'Loading your bookings...',
    description: 'User bookings view'
  },
  {
    path: '/listing/:id',
    component: lazy(() => import('@/pages/listing-detail')),
    mode: 'production',
    loadingMessage: 'Loading listing...',
    description: 'Housing listing detail'
  },
  {
    path: '/host-calendar',
    component: lazy(() => import('@/pages/host-calendar')),
    mode: 'production',
    loadingMessage: 'Loading booking calendar...',
    description: 'Host calendar management'
  },
  {
    path: '/recommendations',
    component: lazy(() => import('@/pages/RecommendationsBrowsePage')),
    mode: 'production',
    loadingMessage: 'Loading recommendations...',
    description: 'Browse recommendations marketplace - Journey R2'
  },

  // ========== Social Features Routes ==========
  {
    path: '/friends',
    component: lazy(() => import('@/pages/EnhancedFriends')),
    mode: 'production',
    loadingMessage: 'Loading friends...',
    description: 'Friends management'
  },
  {
    path: '/friendship/:friendId',
    component: lazy(() => import('@/pages/FriendshipPage')),
    mode: 'production',
    loadingMessage: 'Loading friendship details...',
    description: 'Friendship detail page'
  },
  {
    path: '/messages',
    component: lazy(() => import('@/pages/Messages')),
    mode: 'production',
    loadingMessage: 'Loading messages...',
    description: 'Messaging interface'
  },
  {
    path: '/groups',
    component: lazy(() => import('@/pages/groups')),
    mode: 'production',
    loadingMessage: 'Loading groups...',
    description: 'Groups discovery'
  },
  {
    path: '/groups/:slug',
    component: lazy(() => import('@/pages/GroupDetailPageMT')),
    mode: 'production',
    loadingMessage: 'Loading group...',
    description: 'Group detail page'
  },
  {
    path: '/invitations',
    component: lazy(() => import('@/pages/RoleInvitations')),
    mode: 'production',
    loadingMessage: 'Loading invitations...',
    description: 'Role invitations'
  },
  {
    path: '/favorites',
    component: lazy(() => import('@/pages/Favorites')),
    mode: 'production',
    loadingMessage: 'Loading favorites...',
    description: 'Saved posts and favorites'
  },

  // ========== Community Routes ==========
  {
    path: '/community',
    component: lazy(() => import('@/pages/community')),
    mode: 'production',
    loadingMessage: 'Loading community...',
    description: 'Community hub'
  },
  {
    path: '/community-world-map',
    component: lazy(() => import('@/pages/community-world-map')),
    mode: 'production',
    loadingMessage: 'Loading world map...',
    description: 'Global community map'
  },
  {
    path: '/create-community',
    component: lazy(() => import('@/pages/CreateCommunity')),
    mode: 'production',
    loadingMessage: 'Loading community creator...',
    description: 'Community creation'
  },
  {
    path: '/tango-communities',
    component: lazy(() => import('@/pages/tango-communities')),
    mode: 'production',
    loadingMessage: 'Loading communities...',
    description: 'Tango communities'
  },
  {
    path: '/tango-stories',
    component: lazy(() => import('@/pages/TangoStories')),
    mode: 'production',
    loadingMessage: 'Loading stories...',
    description: 'Tango stories'
  },
  {
    path: '/live-streaming',
    component: lazy(() => import('@/pages/LiveStreaming')),
    mode: 'production',
    loadingMessage: 'Loading streaming...',
    description: 'Live streaming platform'
  },
  {
    path: '/gamification',
    component: lazy(() => import('@/pages/Gamification')),
    mode: 'production',
    loadingMessage: 'Loading gamification...',
    description: 'Gamification features'
  },

  // ========== Content & Timeline Routes ==========
  {
    path: '/memories',
    component: lazy(() => import('@/pages/ESAMemoryFeed')),
    mode: 'production',
    loadingMessage: 'Loading memories...',
    description: 'Unified memory feed',
    documentationLink: 'docs/pages/content/MemoryFeedUnified.md'
  },
  {
    path: '/search',
    component: lazy(() => import('@/pages/search')),
    mode: 'production',
    loadingMessage: 'Loading search...',
    description: 'Global search'
  },

  // ========== Billing & Subscriptions Routes ==========
  {
    path: '/subscribe',
    component: lazy(() => import('@/pages/Subscribe')),
    mode: 'production',
    loadingMessage: 'Loading subscription plans...',
    description: 'Subscription plans'
  },
  {
    path: '/pricing',
    component: lazy(() => import('@/pages/pricing')),
    mode: 'production',
    loadingMessage: 'Loading pricing...',
    description: 'Pricing information (Agent #72)'
  },
  {
    path: '/settings/billing',
    component: lazy(() => import('@/pages/BillingDashboard')),
    mode: 'production',
    loadingMessage: 'Loading billing...',
    description: 'Billing dashboard'
  },
  {
    path: '/checkout/:tier',
    component: lazy(() => import('@/pages/Checkout')),
    mode: 'production',
    loadingMessage: 'Loading checkout...',
    description: 'Checkout flow'
  },
  {
    path: '/payment-methods',
    component: lazy(() => import('@/pages/PaymentMethods')),
    mode: 'production',
    loadingMessage: 'Loading payment methods...',
    description: 'Payment methods management'
  },
  {
    path: '/invoices',
    component: lazy(() => import('@/pages/Invoices')),
    mode: 'production',
    loadingMessage: 'Loading invoices...',
    description: 'Invoice history'
  },
  {
    path: '/subscription',
    component: lazy(() => import('@/pages/Subscription')),
    mode: 'production',
    loadingMessage: 'Loading subscription...',
    description: 'Subscription management'
  },

  // ========== Admin & Analytics Routes ==========
  {
    path: '/admin',
    component: lazy(() => import('@/pages/admin/dashboard')),
    mode: 'production',
    loadingMessage: 'Loading admin dashboard...',
    description: 'Admin dashboard'
  },
  {
    path: '/admin/users',
    component: lazy(() => import('@/pages/admin/users')),
    mode: 'production',
    loadingMessage: 'Loading user management...',
    description: 'User management'
  },
  {
    path: '/admin/moderation',
    component: lazy(() => import('@/pages/admin/moderation')),
    mode: 'production',
    loadingMessage: 'Loading moderation queue...',
    description: 'Content moderation'
  },
  {
    path: '/admin/analytics',
    component: lazy(() => import('@/pages/admin/analytics')),
    mode: 'production',
    loadingMessage: 'Loading analytics...',
    description: 'Admin analytics'
  },
  {
    path: '/admin-legacy',
    component: lazy(() => import('@/pages/AdminCenter')),
    mode: 'production',
    loadingMessage: 'Loading admin center...',
    description: 'Legacy admin center'
  },
  {
    path: '/admin/promo-codes',
    component: lazy(() => import('@/pages/PromoCodesAdmin')),
    mode: 'production',
    loadingMessage: 'Loading promo codes...',
    description: 'Promo code management (Agent #75)'
  },
  {
    path: '/admin/subscription-analytics',
    component: lazy(() => import('@/pages/SubscriptionAnalytics')),
    mode: 'production',
    loadingMessage: 'Loading analytics...',
    description: 'Subscription analytics (Agent #72)'
  },
  {
    path: '/admin/agent-metrics',
    component: lazy(() => import('@/pages/admin/AgentMetrics')),
    mode: 'production',
    loadingMessage: 'Loading agent monitoring dashboard...',
    description: 'ESA 61x21 Multi-Agent System monitoring and analytics'
  },
  {
    path: '/admin/projects',
    component: lazy(() => import('@/pages/admin/projects')),
    mode: 'production',
    loadingMessage: 'Loading project tracker...',
    description: 'ESA Agent #65 Self-Hosted Project Tracker (Epics/Stories/Tasks)'
  },
  {
    path: '/admin/projects/epics',
    component: lazy(() => import('@/pages/admin/EpicsList')),
    mode: 'production',
    loadingMessage: 'Loading epics list...',
    description: 'ESA Agent #65 + #17: Epics List - Sortable table with filtering'
  },
  {
    path: '/admin/projects/stories',
    component: lazy(() => import('@/pages/admin/StoriesList')),
    mode: 'production',
    loadingMessage: 'Loading stories list...',
    description: 'ESA Agent #65 + #17: Stories List - Task management with agent filtering'
  },
  {
    path: '/admin/projects/epic/:id',
    component: lazy(() => import('@/pages/admin/EpicDetail')),
    mode: 'production',
    loadingMessage: 'Loading epic details...',
    description: 'ESA Agent #65 Epic Detail - Story breakdown & progress'
  },
  {
    path: '/admin/projects/story/:id',
    component: lazy(() => import('@/pages/admin/StoryDetail')),
    mode: 'production',
    loadingMessage: 'Loading story details...',
    description: 'ESA Agent #65 Story Detail - Agent assignment & code links'
  },
  {
    path: '/admin/sprints',
    component: lazy(() => import('@/pages/admin/sprints')),
    mode: 'production',
    loadingMessage: 'Loading sprint management...',
    description: 'ESA Agent #63 Sprint Planning & Velocity Tracking'
  },
  {
    path: '/admin/esa-mind',
    component: lazy(() => import('@/pages/admin/ESAMind')),
    mode: 'production',
    loadingMessage: 'Loading ESA Mind...',
    description: 'Context-aware ESA Framework (105 Agents, 61 Layers) intelligence and metrics dashboard'
  },
  {
    path: '/analytics',
    component: lazy(() => import('@/pages/AnalyticsDashboard')),
    mode: 'production',
    loadingMessage: 'Loading analytics...',
    description: 'Analytics dashboard'
  },
  {
    path: '/agent-framework',
    component: lazy(() => import('@/pages/AgentFrameworkDashboard')),
    mode: 'production',
    loadingMessage: 'Loading Agent Framework Dashboard...',
    description: 'Agent framework monitoring'
  },
  {
    path: '/project-tracker',
    component: lazy(() => import('@/pages/ProjectTracker')),
    mode: 'production',
    loadingMessage: 'Loading project tracker...',
    description: 'Project tracking'
  },
  {
    path: '/stats',
    component: lazy(() => import('@/pages/LiveGlobalStatistics')),
    mode: 'production',
    loadingMessage: 'Loading statistics...',
    description: 'Live statistics'
  },
  {
    path: '/hierarchy',
    component: lazy(() => import('@/pages/HierarchyDashboard')),
    mode: 'production',
    loadingMessage: 'Loading hierarchy...',
    description: 'Organizational hierarchy'
  },

  // ========== Mr Blue / LifeCEO Routes (Agent #73) ==========
  {
    path: '/mr-blue',
    component: lazy(() => import('@/pages/LifeCEOEnhanced')),
    mode: 'production',
    loadingMessage: 'Loading Mr Blue...',
    description: 'Mr Blue AI companion dashboard (Agent #73)'
  },
  {
    path: '/mr-blue-performance',
    component: lazy(() => import('@/pages/LifeCeoPerformance')),
    mode: 'production',
    loadingMessage: 'Loading Mr Blue Performance...',
    description: 'Mr Blue performance monitoring'
  },
  // Legacy routes for backwards compatibility
  {
    path: '/life-ceo',
    component: lazy(() => import('@/pages/LifeCEOEnhanced')),
    mode: 'production',
    loadingMessage: 'Loading Mr Blue...',
    description: 'Mr Blue dashboard (legacy route)'
  },
  {
    path: '/life-ceo-performance',
    component: lazy(() => import('@/pages/LifeCeoPerformance')),
    mode: 'production',
    loadingMessage: 'Loading Mr Blue Performance...',
    description: 'Mr Blue performance (legacy route)'
  },
  {
    path: '/lifeceo',
    component: lazy(() => import('@/pages/LifeCEOEnhanced')),
    mode: 'production',
    loadingMessage: 'Loading Mr Blue...',
    description: 'Mr Blue (legacy alias)'
  },


  // ========== Testing & Development Routes ==========
  {
    path: '/monitoring',
    component: lazy(() => import('@/pages/MonitoringDashboard')),
    mode: 'production',
    loadingMessage: 'Loading monitoring dashboard...',
    description: 'System monitoring'
  },
  {
    path: '/monitoring-test',
    component: lazy(() => import('@/pages/MonitoringTest')),
    mode: 'production',
    loadingMessage: 'Loading monitoring test...',
    description: 'Monitoring test page'
  },
  {
    path: '/media-upload-test',
    component: lazy(() => import('@/pages/MediaUploadTest')),
    mode: 'production',
    loadingMessage: 'Loading media upload test...',
    description: 'Media upload testing'
  },
  {
    path: '/test-grouped-roles',
    component: lazy(() => import('@/components/test/TestGroupedRoleSelector')),
    mode: 'production',
    loadingMessage: 'Loading test...',
    description: 'Role selector test'
  },
  {
    path: '/feature-navigation',
    component: lazy(() => import('@/pages/feature-navigation')),
    mode: 'production',
    loadingMessage: 'Loading feature navigation...',
    description: 'Feature discovery with interactive tour (Agent #74)'
  },
  {
    path: '/database-security',
    component: lazy(() => import('@/pages/database-security')),
    mode: 'production',
    loadingMessage: 'Loading database security...',
    description: 'Database security dashboard'
  },

  // ========== Legal & Compliance Routes ==========
  {
    path: '/help',
    component: lazy(() => import('@/pages/HelpSupport')),
    mode: 'production',
    loadingMessage: 'Loading help...',
    description: 'Help and support center'
  },
  {
    path: '/code-of-conduct',
    component: lazy(() => import('@/pages/code-of-conduct')),
    mode: 'production',
    loadingMessage: 'Loading terms...',
    description: 'Code of conduct'
  },
  {
    path: '/terms',
    component: lazy(() => import('@/pages/code-of-conduct')),
    mode: 'production',
    loadingMessage: 'Loading terms...',
    description: 'Terms of service'
  },
  {
    path: '/privacy',
    component: lazy(() => import('@/pages/PrivacyAnalytics')),
    mode: 'production',
    loadingMessage: 'Loading privacy settings...',
    description: 'Privacy settings and analytics'
  },
  {
    path: '/privacy-policy',
    component: lazy(() => import('@/pages/code-of-conduct')),
    mode: 'production',
    loadingMessage: 'Loading privacy policy...',
    description: 'Privacy policy'
  },

  // ========== Additional Platform Routes ==========
  {
    path: '/travel-planner',
    component: lazy(() => import('@/pages/TravelPlanner')),
    mode: 'production',
    loadingMessage: 'Loading travel planner...',
    description: 'Travel planning'
  },
  {
    path: '/mobile-dashboard',
    component: lazy(() => import('@/pages/MobileAppDashboard')),
    mode: 'production',
    loadingMessage: 'Loading mobile dashboard...',
    description: 'Mobile app dashboard'
  },
  {
    path: '/notifications',
    component: lazy(() => import('@/pages/Notifications')),
    mode: 'production',
    loadingMessage: 'Loading notifications...',
    description: 'User notifications center'
  },
  {
    path: '/error',
    component: lazy(() => import('@/pages/ErrorBoundaryPage')),
    mode: 'production',
    loadingMessage: 'Loading...',
    description: 'Error boundary page'
  },
];

/**
 * DEBUG ROUTES
 * Development and testing routes - NEVER included in production builds
 * Located in client/src/pages/_debug/
 */
export const debugRoutes: RouteConfig[] = [
  {
    path: '/memories-debug',
    component: lazy(() => import('@/pages/_debug/MemoriesDebug')),
    mode: 'debug',
    loadingMessage: 'Loading debug...',
    description: 'Memory feed debug interface'
  },
  {
    path: '/memories-test',
    component: lazy(() => import('@/pages/_debug/MemoriesTest')),
    mode: 'debug',
    loadingMessage: 'Loading test...',
    description: 'Memory feed test page'
  },
  {
    path: '/posting-demo',
    component: lazy(() => import('@/pages/_debug/PostingDemo')),
    mode: 'debug',
    loadingMessage: 'Loading posting demo...',
    description: 'Post creation demo'
  },
  {
    path: '/modern-memories-debug',
    component: lazy(() => import('@/pages/_debug/ModernMemoriesPage')),
    mode: 'debug',
    loadingMessage: 'Loading modern memories...',
    description: 'Modern memories debug (Pierre Dubois interface)'
  },
  {
    path: '/agent-learning',
    component: lazy(() => import('@/pages/AgentLearningDashboard')),
    mode: 'debug',
    loadingMessage: 'Loading AGI dashboard...',
    description: 'Real-time agent learning dashboard - ESA Layers 11, 18, 48'
  },
];

/**
 * Get all routes (production + debug in development)
 * Used by App.tsx to generate route configuration
 */
export function getAllRoutes(): RouteConfig[] {
  const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  return isDevelopment 
    ? [...productionRoutes, ...debugRoutes]
    : productionRoutes;
}
