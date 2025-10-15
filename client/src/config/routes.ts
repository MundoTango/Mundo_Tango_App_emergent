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

import { ComponentType, lazy } from 'react';
// Direct imports - all routes (lazy loading disabled)
import Forgotpassword from '@/pages/auth/forgot-password';
import Resetpassword from '@/pages/auth/reset-password';
import Profile from '@/pages/profile';
import UserSettings from '@/pages/UserSettings';
import AccountDelete from '@/pages/AccountDelete';
import Onboarding from '@/pages/onboarding';
import ResumePage from '@/pages/ResumePage';
import PublicResumePage from '@/pages/PublicResumePage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import ProfileSwitcher from '@/pages/ProfileSwitcher';
import EnhancedEvents from '@/pages/EnhancedEvents';
import Eventdetail from '@/pages/event-detail';
import Teacher from '@/pages/teacher';
import Organizer from '@/pages/organizer';
import Housingmarketplace from '@/pages/housing-marketplace';
import HostDashboard from '@/pages/HostDashboard';
import HostOnboarding from '@/pages/HostOnboarding';
import GuestOnboarding from '@/pages/GuestOnboarding';
import Hostbookings from '@/pages/host-bookings';
import Mybookings from '@/pages/my-bookings';
import Listingdetail from '@/pages/listing-detail';
import Hostcalendar from '@/pages/host-calendar';
import RecommendationsBrowsePage from '@/pages/RecommendationsBrowsePage';
import EnhancedFriends from '@/pages/EnhancedFriends';
import FriendshipPage from '@/pages/FriendshipPage';
import Messages from '@/pages/Messages';
import Groups from '@/pages/groups';
import GroupDetailPageMT from '@/pages/GroupDetailPageMT';
import RoleInvitations from '@/pages/RoleInvitations';
import Favorites from '@/pages/Favorites';
import Community from '@/pages/community';
import Communityworldmap from '@/pages/community-world-map';
import CreateCommunity from '@/pages/CreateCommunity';
import Tangocommunities from '@/pages/tango-communities';
import TangoStories from '@/pages/TangoStories';
import LiveStreaming from '@/pages/LiveStreaming';
import Gamification from '@/pages/Gamification';
import Search from '@/pages/search';
import Subscribe from '@/pages/Subscribe';
import Pricing from '@/pages/pricing';
import BillingDashboard from '@/pages/BillingDashboard';
import Checkout from '@/pages/Checkout';
import PaymentMethods from '@/pages/PaymentMethods';
import Invoices from '@/pages/Invoices';
import Subscription from '@/pages/Subscription';
import Dashboard from '@/pages/admin/dashboard';
import Users from '@/pages/admin/users';
import Moderation from '@/pages/admin/moderation';
import Analytics from '@/pages/admin/analytics';
import AdminCenter from '@/pages/AdminCenter';
import PromoCodesAdmin from '@/pages/PromoCodesAdmin';
import SubscriptionAnalytics from '@/pages/SubscriptionAnalytics';
import AgentMetrics from '@/pages/admin/AgentMetrics';
import Projects from '@/pages/admin/projects';
import EpicsList from '@/pages/admin/EpicsList';
import StoriesList from '@/pages/admin/StoriesList';
import EpicDetail from '@/pages/admin/EpicDetail';
import StoryDetail from '@/pages/admin/StoryDetail';
import Sprints from '@/pages/admin/sprints';
import ESAMind from '@/pages/admin/ESAMind';
import MrBlueDashboard from '@/pages/admin/MrBlueDashboard';
import TenantManagement from '@/pages/admin/TenantManagement';
import AgentLearnings from '@/pages/admin/AgentLearnings';
import DeploymentConfig from '@/pages/admin/DeploymentConfig';
import AgentCollaborationVisualizer from '@/pages/admin/AgentCollaborationVisualizer';
import MultiAIDashboard from '@/pages/admin/MultiAIDashboard';
import MultiAIAnalytics from '@/pages/admin/MultiAIAnalytics';
import FinOpsDashboard from '@/pages/FinOpsDashboard';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import AgentFrameworkDashboard from '@/pages/AgentFrameworkDashboard';
import ProjectTracker from '@/pages/ProjectTracker';
import LiveGlobalStatistics from '@/pages/LiveGlobalStatistics';
import HierarchyDashboard from '@/pages/HierarchyDashboard';
import LifeCEOEnhanced from '@/pages/LifeCEOEnhanced';
import LifeCeoPerformance from '@/pages/LifeCeoPerformance';
import MonitoringDashboard from '@/pages/MonitoringDashboard';
import MonitoringTest from '@/pages/MonitoringTest';
import MediaUploadTest from '@/pages/MediaUploadTest';
import Featurenavigation from '@/pages/feature-navigation';
import Databasesecurity from '@/pages/database-security';
import HelpSupport from '@/pages/HelpSupport';
import Codeofconduct from '@/pages/code-of-conduct';
import PrivacyAnalytics from '@/pages/PrivacyAnalytics';
import TravelPlanner from '@/pages/TravelPlanner';
import MobileAppDashboard from '@/pages/MobileAppDashboard';
import Notifications from '@/pages/Notifications';
import ErrorBoundaryPage from '@/pages/ErrorBoundaryPage';
import MemoriesDebug from '@/pages/_debug/MemoriesDebug';
import MemoriesTest from '@/pages/_debug/MemoriesTest';
import PostingDemo from '@/pages/_debug/PostingDemo';
import ModernMemoriesPage from '@/pages/_debug/ModernMemoriesPage';
import AgentLearningDashboard from '@/pages/AgentLearningDashboard';
import AgentIntelligenceNetwork from '@/pages/AgentIntelligenceNetwork';
import AgentDetail from '@/pages/AgentDetail';

// Direct imports (critical pages only)
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import Home from '@/pages/home';
import ESAMemoryFeed from '@/pages/ESAMemoryFeed';

// Lazy imports (non-critical pages)


// Direct imports (lazy loading temporarily disabled due to Vite/React bundling issues)

// GroupDetailPageMT now directly imported for stability

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
    component: Login,
    mode: 'production',
    loadingMessage: 'Loading login...',
    description: 'User login page'
  },
  {
    path: '/register',
    component: Register,
    mode: 'production',
    loadingMessage: 'Loading registration...',
    description: 'New user registration'
  },
  {
    path: '/forgot-password',
    component: Forgotpassword,
    mode: 'production',
    loadingMessage: 'Loading password reset...',
    description: 'Password reset request'
  },
  {
    path: '/reset-password',
    component: Resetpassword,
    mode: 'production',
    loadingMessage: 'Loading password reset confirmation...',
    description: 'Password reset confirmation page'
  },

  // ========== User Management Routes ==========
  {
    path: '/profile/:username?',
    component: Profile,
    mode: 'production',
    loadingMessage: 'Loading profile...',
    description: 'User profile page'
  },
  {
    path: '/settings',
    component: UserSettings,
    mode: 'production',
    loadingMessage: 'Loading settings...',
    description: 'User settings and preferences'
  },
  {
    path: '/account/delete',
    component: AccountDelete,
    mode: 'production',
    loadingMessage: 'Loading...',
    description: 'Account deletion'
  },
  {
    path: '/onboarding',
    component: Onboarding,
    mode: 'production',
    loadingMessage: 'Loading onboarding...',
    description: 'User onboarding flow'
  },
  {
    path: '/resume',
    component: ResumePage,
    mode: 'production',
    loadingMessage: 'Loading resume...',
    description: 'User resume/CV page'
  },
  {
    path: '/resume/:username',
    component: PublicResumePage,
    mode: 'production',
    loadingMessage: 'Loading resume...',
    description: 'Public resume view'
  },
  {
    path: '/@:username',
    component: PublicProfilePage,
    mode: 'production',
    loadingMessage: 'Loading profile...',
    description: 'Public profile page'
  },
  {
    path: '/profile-switcher',
    component: ProfileSwitcher,
    mode: 'production',
    loadingMessage: 'Loading...',
    description: 'Profile switcher interface'
  },
  {
    path: '/home',
    component: Home,
    mode: 'production',
    loadingMessage: 'Loading home...',
    description: 'User home dashboard'
  },

  // ========== Events System Routes ==========
  {
    path: '/events',
    component: EnhancedEvents,
    mode: 'production',
    loadingMessage: 'Loading events...',
    description: 'Events discovery and listing'
  },
  {
    path: '/events/:id',
    component: Eventdetail,
    mode: 'production',
    loadingMessage: 'Loading event details...',
    description: 'Event detail page'
  },
  {
    path: '/teacher',
    component: Teacher,
    mode: 'production',
    loadingMessage: 'Loading teacher dashboard...',
    description: 'Teacher dashboard'
  },
  {
    path: '/organizer',
    component: Organizer,
    mode: 'production',
    loadingMessage: 'Loading organizer dashboard...',
    description: 'Event organizer dashboard'
  },

  // ========== Housing & Marketplace Routes ==========
  {
    path: '/housing-marketplace',
    component: Housingmarketplace,
    mode: 'production',
    loadingMessage: 'Loading housing marketplace...',
    description: 'Housing marketplace'
  },
  {
    path: '/host-dashboard',
    component: HostDashboard,
    mode: 'production',
    loadingMessage: 'Loading host dashboard...',
    description: 'Host properties dashboard'
  },
  {
    path: '/host-onboarding',
    component: HostOnboarding,
    mode: 'production',
    loadingMessage: 'Loading host setup...',
    description: 'Host onboarding flow'
  },
  {
    path: '/guest-onboarding',
    component: GuestOnboarding,
    mode: 'production',
    loadingMessage: 'Loading guest setup...',
    description: 'Guest onboarding flow'
  },
  {
    path: '/host-bookings',
    component: Hostbookings,
    mode: 'production',
    loadingMessage: 'Loading host dashboard...',
    description: 'Host bookings management'
  },
  {
    path: '/my-bookings',
    component: Mybookings,
    mode: 'production',
    loadingMessage: 'Loading your bookings...',
    description: 'User bookings view'
  },
  {
    path: '/listing/:id',
    component: Listingdetail,
    mode: 'production',
    loadingMessage: 'Loading listing...',
    description: 'Housing listing detail'
  },
  {
    path: '/host-calendar',
    component: Hostcalendar,
    mode: 'production',
    loadingMessage: 'Loading booking calendar...',
    description: 'Host calendar management'
  },
  {
    path: '/recommendations',
    component: RecommendationsBrowsePage,
    mode: 'production',
    loadingMessage: 'Loading recommendations...',
    description: 'Browse recommendations marketplace - Journey R2'
  },

  // ========== Social Features Routes ==========
  {
    path: '/friends',
    component: EnhancedFriends,
    mode: 'production',
    loadingMessage: 'Loading friends...',
    description: 'Friends management'
  },
  {
    path: '/friendship/:friendId',
    component: FriendshipPage,
    mode: 'production',
    loadingMessage: 'Loading friendship details...',
    description: 'Friendship detail page'
  },
  {
    path: '/messages',
    component: Messages,
    mode: 'production',
    loadingMessage: 'Loading messages...',
    description: 'Messaging interface'
  },
  {
    path: '/groups',
    component: Groups,
    mode: 'production',
    loadingMessage: 'Loading groups...',
    description: 'Groups discovery'
  },
  {
    path: '/groups/:slug',
    component: GroupDetailPageMT,
    mode: 'production',
    loadingMessage: 'Loading group...',
    description: 'Group detail page'
  },
  {
    path: '/invitations',
    component: RoleInvitations,
    mode: 'production',
    loadingMessage: 'Loading invitations...',
    description: 'Role invitations'
  },
  {
    path: '/favorites',
    component: Favorites,
    mode: 'production',
    loadingMessage: 'Loading favorites...',
    description: 'Saved posts and favorites'
  },

  // ========== Community Routes ==========
  {
    path: '/community',
    component: Community,
    mode: 'production',
    loadingMessage: 'Loading community...',
    description: 'Community hub'
  },
  {
    path: '/community-world-map',
    component: Communityworldmap,
    mode: 'production',
    loadingMessage: 'Loading world map...',
    description: 'Global community map'
  },
  {
    path: '/create-community',
    component: CreateCommunity,
    mode: 'production',
    loadingMessage: 'Loading community creator...',
    description: 'Community creation'
  },
  {
    path: '/tango-communities',
    component: Tangocommunities,
    mode: 'production',
    loadingMessage: 'Loading communities...',
    description: 'Tango communities'
  },
  {
    path: '/tango-stories',
    component: TangoStories,
    mode: 'production',
    loadingMessage: 'Loading stories...',
    description: 'Tango stories'
  },
  {
    path: '/live-streaming',
    component: LiveStreaming,
    mode: 'production',
    loadingMessage: 'Loading streaming...',
    description: 'Live streaming platform'
  },
  {
    path: '/gamification',
    component: Gamification,
    mode: 'production',
    loadingMessage: 'Loading gamification...',
    description: 'Gamification features'
  },

  // ========== Content & Timeline Routes ==========
  {
    path: '/memories',
    component: ESAMemoryFeed,
    mode: 'production',
    loadingMessage: 'Loading memories...',
    description: 'Unified memory feed',
    documentationLink: 'docs/pages/content/MemoryFeedUnified.md'
  },
  {
    path: '/search',
    component: Search,
    mode: 'production',
    loadingMessage: 'Loading search...',
    description: 'Global search'
  },

  // ========== Billing & Subscriptions Routes ==========
  {
    path: '/subscribe',
    component: Subscribe,
    mode: 'production',
    loadingMessage: 'Loading subscription plans...',
    description: 'Subscription plans'
  },
  {
    path: '/pricing',
    component: Pricing,
    mode: 'production',
    loadingMessage: 'Loading pricing...',
    description: 'Pricing information (Agent #72)'
  },
  {
    path: '/settings/billing',
    component: BillingDashboard,
    mode: 'production',
    loadingMessage: 'Loading billing...',
    description: 'Billing dashboard'
  },
  {
    path: '/checkout/:tier',
    component: Checkout,
    mode: 'production',
    loadingMessage: 'Loading checkout...',
    description: 'Checkout flow'
  },
  {
    path: '/payment-methods',
    component: PaymentMethods,
    mode: 'production',
    loadingMessage: 'Loading payment methods...',
    description: 'Payment methods management'
  },
  {
    path: '/invoices',
    component: Invoices,
    mode: 'production',
    loadingMessage: 'Loading invoices...',
    description: 'Invoice history'
  },
  {
    path: '/subscription',
    component: Subscription,
    mode: 'production',
    loadingMessage: 'Loading subscription...',
    description: 'Subscription management'
  },

  // ========== Admin & Analytics Routes ==========
  {
    path: '/admin',
    component: Dashboard,
    mode: 'production',
    loadingMessage: 'Loading admin dashboard...',
    description: 'Admin dashboard'
  },
  {
    path: '/admin/dashboard',
    component: Dashboard,
    mode: 'production',
    loadingMessage: 'Loading admin dashboard...',
    description: 'Admin dashboard (alias)'
  },
  {
    path: '/admin/users',
    component: Users,
    mode: 'production',
    loadingMessage: 'Loading user management...',
    description: 'User management'
  },
  {
    path: '/admin/moderation',
    component: Moderation,
    mode: 'production',
    loadingMessage: 'Loading moderation queue...',
    description: 'Content moderation'
  },
  {
    path: '/admin/analytics',
    component: Analytics,
    mode: 'production',
    loadingMessage: 'Loading analytics...',
    description: 'Admin analytics'
  },
  {
    path: '/admin-legacy',
    component: AdminCenter,
    mode: 'production',
    loadingMessage: 'Loading admin center...',
    description: 'Legacy admin center'
  },
  {
    path: '/admin/promo-codes',
    component: PromoCodesAdmin,
    mode: 'production',
    loadingMessage: 'Loading promo codes...',
    description: 'Promo code management (Agent #75)'
  },
  {
    path: '/admin/subscription-analytics',
    component: SubscriptionAnalytics,
    mode: 'production',
    loadingMessage: 'Loading analytics...',
    description: 'Subscription analytics (Agent #72)'
  },
  {
    path: '/admin/agent-metrics',
    component: AgentMetrics,
    mode: 'production',
    loadingMessage: 'Loading agent monitoring dashboard...',
    description: 'ESA 61x21 Multi-Agent System monitoring and analytics'
  },
  {
    path: '/admin/projects',
    component: Projects,
    mode: 'production',
    loadingMessage: 'Loading project tracker...',
    description: 'ESA Agent #65 Self-Hosted Project Tracker (Epics/Stories/Tasks)'
  },
  {
    path: '/admin/projects/epics',
    component: EpicsList,
    mode: 'production',
    loadingMessage: 'Loading epics list...',
    description: 'ESA Agent #65 + #17: Epics List - Sortable table with filtering'
  },
  {
    path: '/admin/projects/stories',
    component: StoriesList,
    mode: 'production',
    loadingMessage: 'Loading stories list...',
    description: 'ESA Agent #65 + #17: Stories List - Task management with agent filtering'
  },
  {
    path: '/admin/projects/epic/:id',
    component: EpicDetail,
    mode: 'production',
    loadingMessage: 'Loading epic details...',
    description: 'ESA Agent #65 Epic Detail - Story breakdown & progress'
  },
  {
    path: '/admin/projects/story/:id',
    component: StoryDetail,
    mode: 'production',
    loadingMessage: 'Loading story details...',
    description: 'ESA Agent #65 Story Detail - Agent assignment & code links'
  },
  {
    path: '/admin/sprints',
    component: Sprints,
    mode: 'production',
    loadingMessage: 'Loading sprint management...',
    description: 'ESA Agent #63 Sprint Planning & Velocity Tracking'
  },
  {
    path: '/admin/esa-mind',
    component: ESAMind,
    mode: 'production',
    loadingMessage: 'Loading ESA Mind...',
    description: 'Context-aware ESA Framework (105 Agents, 61 Layers) intelligence and metrics dashboard'
  },
  {
    path: '/admin/multi-ai',
    component: MultiAIDashboard,
    mode: 'production',
    loadingMessage: 'Loading Multi-AI Dashboard...',
    description: 'Multi-AI Orchestration Dashboard (Agents #115-117) - Model selection, routing & ensemble synthesis'
  },
  {
    path: '/admin/multi-ai/analytics',
    component: MultiAIAnalytics,
    mode: 'production',
    loadingMessage: 'Loading Multi-AI Analytics...',
    description: 'Multi-AI Performance Analytics - Cost savings, model usage & quality metrics'
  },
  {
    path: '/finops',
    component: FinOpsDashboard,
    mode: 'production',
    loadingMessage: 'Loading FinOps Dashboard...',
    description: 'MB.MD Phase 5: AI Cost Monitoring & Financial Operations Dashboard'
  },
  {
    path: '/admin/mr-blue',
    component: MrBlueDashboard,
    mode: 'production',
    loadingMessage: 'Loading Mr Blue Dashboard...',
    description: 'Mr Blue AI Companion Dashboard - All 8 Agents (Super Admin Only)'
  },
  {
    path: '/admin/tenants',
    component: TenantManagement,
    mode: 'production',
    loadingMessage: 'Loading Tenant Management...',
    description: 'Multi-Tenant Community Management - White-Label Configuration (Super Admin Only)'
  },
  {
    path: '/admin/agent-learnings',
    component: AgentLearnings,
    mode: 'production',
    loadingMessage: 'Loading Agent Learnings...',
    description: 'Agent Learning Dashboard - Captured Patterns and Collaborative Intelligence (Super Admin Only)'
  },
  {
    path: '/admin/deployment',
    component: DeploymentConfig,
    mode: 'production',
    loadingMessage: 'Loading Deployment Config...',
    description: 'Deployment Configuration - Production Settings and Quality Gates (Super Admin Only)'
  },
  {
    path: '/admin/agent-collaboration',
    component: AgentCollaborationVisualizer,
    mode: 'production',
    loadingMessage: 'Loading Agent Network...',
    description: 'Agent Collaboration Visualizer - Real-time Knowledge Sharing Network (Super Admin Only)'
  },
  {
    path: '/analytics',
    component: AnalyticsDashboard,
    mode: 'production',
    loadingMessage: 'Loading analytics...',
    description: 'Analytics dashboard'
  },
  {
    path: '/agent-framework',
    component: AgentFrameworkDashboard,
    mode: 'production',
    loadingMessage: 'Loading Agent Framework Dashboard...',
    description: 'Agent framework monitoring'
  },
  {
    path: '/project-tracker',
    component: ProjectTracker,
    mode: 'production',
    loadingMessage: 'Loading project tracker...',
    description: 'Project tracking'
  },
  {
    path: '/stats',
    component: LiveGlobalStatistics,
    mode: 'production',
    loadingMessage: 'Loading statistics...',
    description: 'Live statistics'
  },
  {
    path: '/hierarchy',
    component: HierarchyDashboard,
    mode: 'production',
    loadingMessage: 'Loading hierarchy...',
    description: 'Organizational hierarchy'
  },

  // ========== Mr Blue / LifeCEO Routes (Agent #73) ==========
  {
    path: '/mr-blue',
    component: LifeCEOEnhanced,
    mode: 'production',
    loadingMessage: 'Loading Mr Blue...',
    description: 'Mr Blue AI companion dashboard (Agent #73)'
  },
  {
    path: '/mr-blue-performance',
    component: LifeCeoPerformance,
    mode: 'production',
    loadingMessage: 'Loading Mr Blue Performance...',
    description: 'Mr Blue performance monitoring'
  },
  // Legacy routes for backwards compatibility
  {
    path: '/life-ceo',
    component: LifeCEOEnhanced,
    mode: 'production',
    loadingMessage: 'Loading Mr Blue...',
    description: 'Mr Blue dashboard (legacy route)'
  },
  {
    path: '/life-ceo-performance',
    component: LifeCeoPerformance,
    mode: 'production',
    loadingMessage: 'Loading Mr Blue Performance...',
    description: 'Mr Blue performance (legacy route)'
  },
  {
    path: '/lifeceo',
    component: LifeCEOEnhanced,
    mode: 'production',
    loadingMessage: 'Loading Mr Blue...',
    description: 'Mr Blue (legacy alias)'
  },


  // ========== Testing & Development Routes ==========
  {
    path: '/monitoring',
    component: MonitoringDashboard,
    mode: 'production',
    loadingMessage: 'Loading monitoring dashboard...',
    description: 'System monitoring'
  },
  {
    path: '/monitoring-test',
    component: MonitoringTest,
    mode: 'production',
    loadingMessage: 'Loading monitoring test...',
    description: 'Monitoring test page'
  },
  {
    path: '/media-upload-test',
    component: MediaUploadTest,
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
    component: Featurenavigation,
    mode: 'production',
    loadingMessage: 'Loading feature navigation...',
    description: 'Feature discovery with interactive tour (Agent #74)'
  },
  {
    path: '/database-security',
    component: Databasesecurity,
    mode: 'production',
    loadingMessage: 'Loading database security...',
    description: 'Database security dashboard'
  },

  // ========== Legal & Compliance Routes ==========
  {
    path: '/help',
    component: HelpSupport,
    mode: 'production',
    loadingMessage: 'Loading help...',
    description: 'Help and support center'
  },
  {
    path: '/code-of-conduct',
    component: Codeofconduct,
    mode: 'production',
    loadingMessage: 'Loading terms...',
    description: 'Code of conduct'
  },
  {
    path: '/terms',
    component: Codeofconduct,
    mode: 'production',
    loadingMessage: 'Loading terms...',
    description: 'Terms of service'
  },
  {
    path: '/privacy',
    component: PrivacyAnalytics,
    mode: 'production',
    loadingMessage: 'Loading privacy settings...',
    description: 'Privacy settings and analytics'
  },
  {
    path: '/privacy-policy',
    component: Codeofconduct,
    mode: 'production',
    loadingMessage: 'Loading privacy policy...',
    description: 'Privacy policy'
  },

  // ========== Additional Platform Routes ==========
  {
    path: '/travel-planner',
    component: TravelPlanner,
    mode: 'production',
    loadingMessage: 'Loading travel planner...',
    description: 'Travel planning'
  },
  {
    path: '/mobile-dashboard',
    component: MobileAppDashboard,
    mode: 'production',
    loadingMessage: 'Loading mobile dashboard...',
    description: 'Mobile app dashboard'
  },
  {
    path: '/notifications',
    component: Notifications,
    mode: 'production',
    loadingMessage: 'Loading notifications...',
    description: 'User notifications center'
  },
  {
    path: '/error',
    component: ErrorBoundaryPage,
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
    component: MemoriesDebug,
    mode: 'debug',
    loadingMessage: 'Loading debug...',
    description: 'Memory feed debug interface'
  },
  {
    path: '/memories-test',
    component: MemoriesTest,
    mode: 'debug',
    loadingMessage: 'Loading test...',
    description: 'Memory feed test page'
  },
  {
    path: '/posting-demo',
    component: PostingDemo,
    mode: 'debug',
    loadingMessage: 'Loading posting demo...',
    description: 'Post creation demo'
  },
  {
    path: '/modern-memories-debug',
    component: ModernMemoriesPage,
    mode: 'debug',
    loadingMessage: 'Loading modern memories...',
    description: 'Modern memories debug (Pierre Dubois interface)'
  },
  {
    path: '/agent-learning',
    component: AgentLearningDashboard,
    mode: 'debug',
    loadingMessage: 'Loading AGI dashboard...',
    description: 'Real-time agent learning dashboard - ESA Layers 11, 18, 48'
  },
  {
    path: '/agent-intelligence',
    component: AgentIntelligenceNetwork,
    mode: 'debug',
    loadingMessage: 'Loading Agent Intelligence Network...',
    description: 'Phase 6: Agent Intelligence Network - Self-Learning & Collaborative Agents (150+ Agents)'
  },
  {
    path: '/agent-intelligence/:agentId',
    component: AgentDetail,
    mode: 'debug',
    loadingMessage: 'Loading Agent Details...',
    description: 'Phase 7: Individual Agent Detail Page with 5-Tab Layout (Overview/Tests/Learnings/Fixes/Metrics)'
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
