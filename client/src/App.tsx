import React, { useEffect, Suspense, lazy, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { SocketProvider } from "@/contexts/socket-context";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/TenantContext";
// import { CsrfProvider } from "@/contexts/CsrfContext"; // Disabled for Phase 1 - will add CSRF endpoint later
import { OpenReplayProvider } from "@/components/OpenReplayProvider";
import { SessionRecordingNotice } from "@/components/SessionRecordingNotice";
import { LocationBiasProvider } from "@/contexts/LocationBiasContext";
// import { PageAgentProvider } from "@/contexts/PageAgentContext"; // DISABLED - Vite HMR file deletion bug
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics, analytics } from "@/lib/analytics";
import { initPostHog } from "@/lib/posthog";
import { usePageTracking } from "@/hooks/use-posthog";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import ThemeManager from "@/components/theme/ThemeManager";
import { performanceOptimizations } from "@/lib/performance-optimizations";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { lifeCeoPerformance } from "@/lib/life-ceo-performance";
import { setupGlobalErrorHandlers, setupQueryErrorHandling } from "@/lib/global-error-handler";
import { MicroInteractionProvider } from "@/components/MicroInteractionProvider";
import BuildOptimizer from "@/lib/build-optimizations";
import * as Sentry from "@sentry/react";
import "@/lib/i18n"; // Initialize i18n
import { performanceOptimizer } from "@/utils/performance"; // ESA Performance Optimizer
// MB.MD DISABLED - Breaks React error handling by overwriting Error constructor
// import "@/utils/console-cleanup"; // Security: Clean console output

// Mundo Tango ESA - Monitoring Services
import { MonitoringProvider } from "@/components/MonitoringProvider";
import { useMonitoring } from "@/hooks/useMonitoring";

// Mundo Tango ESA - Route Registry (Layers 21-30)
import { productionRoutes, debugRoutes, type RouteConfig } from "@/config/routes";

// Import shared queryClient with ESA Layer 14 cache configuration
import { queryClient } from "@/lib/queryClient";

// MB.MD FIX: Clear stale queries on app initialization to prevent queryFn warnings
if (typeof window !== 'undefined') {
  queryClient.removeQueries({ 
    predicate: (query) => !query.options.queryFn && query.state.status === 'error',
  });
}

// MB.MD MINIMAL IMPORTS: Only components that exist to fix blank screen
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import TrialBanner from "@/components/TrialBanner";

// MB.MD TRACK 1: Global Navigation Components (Week 1 - Oct 20, 2025)
import BottomNav from "@/components/layout/BottomNav";

// Mundo Tango Internal CMS (Notion-style tango stories/memories)
import { NotionHomePage } from "@/pages/NotionHomePage";
import { NotionEntryPage } from "@/pages/NotionEntryPage";

// Mundo Tango Mobile Pages (mobile-optimized for 38% → 100% production readiness)
const MessagesMobile = lazy(() => import("@/pages/messages-mobile"));
const NotificationsMobile = lazy(() => import("@/pages/notifications-mobile"));
const CalendarPage = lazy(() => import("@/pages/calendar"));
const ProfileMobile = lazy(() => import("@/pages/profile-mobile"));
const GroupsMobile = lazy(() => import("@/pages/groups-mobile"));

// Mundo Tango Core Pages - Social Features (Phase 1A: Oct 20, 2025)
const MemoriesPage = lazy(() => import("@/pages/MemoriesPage"));

// MB.MD BATCH 1: High-Value Pages (Oct 20, 2025) - Social, Events, Admin
const EventsPage = lazy(() => import("@/pages/events"));
const EventDetail = lazy(() => import("@/pages/event-detail"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const GroupPage = lazy(() => import("@/pages/group"));
const HomePage = lazy(() => import("@/pages/home"));
const SearchPage = lazy(() => import("@/pages/search"));

// MB.MD BATCH 2: 40 Additional Routes (Housing, Admin, Social, Analytics, Agents)
// Housing & Marketplace
const HousingMarketplace = lazy(() => import("@/pages/housing-marketplace"));
const HostCalendar = lazy(() => import("@/pages/host-calendar"));
const HostBookings = lazy(() => import("@/pages/host-bookings"));
const MyBookings = lazy(() => import("@/pages/my-bookings"));
const ListingDetail = lazy(() => import("@/pages/listing-detail"));

// Admin Pages (Extended)
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminSprints = lazy(() => import("@/pages/admin/sprints"));
const AdminProjects = lazy(() => import("@/pages/admin/projects"));
const TenantManagement = lazy(() => import("@/pages/admin/TenantManagement"));
const StoriesList = lazy(() => import("@/pages/admin/StoriesList"));
const StoryDetail = lazy(() => import("@/pages/admin/StoryDetail"));
const UISubAgents = lazy(() => import("@/pages/admin/UISubAgents"));
const SmartAgentsDashboard = lazy(() => import("@/pages/admin/SmartAgentsDashboard"));
const MrBlueDashboard = lazy(() => import("@/pages/admin/MrBlueDashboard"));
const PerformanceDashboard = lazy(() => import("@/pages/admin/PerformanceDashboard"));
const PageStateMonitor = lazy(() => import("@/pages/admin/PageStateMonitor"));
const PageAgentsDashboard = lazy(() => import("@/pages/admin/PageAgentsDashboard"));
const MultiAIDashboard = lazy(() => import("@/pages/admin/MultiAIDashboard"));
const MultiAIAnalytics = lazy(() => import("@/pages/admin/MultiAIAnalytics"));
const HealthMonitor = lazy(() => import("@/pages/admin/HealthMonitor"));
const ComponentHealthDashboard = lazy(() => import("@/pages/admin/ComponentHealthDashboard"));
const AutoFixDashboard = lazy(() => import("@/pages/admin/AutoFixDashboard"));
const AgentCoordination = lazy(() => import("@/pages/admin/AgentCoordination"));

// Social Pages
const Groups = lazy(() => import("@/pages/groups"));
const FriendsPage = lazy(() => import("@/pages/Friends"));
const TimelineMinimal = lazy(() => import("@/pages/timeline-minimal"));
const TimelineDebug = lazy(() => import("@/pages/timeline-debug"));
const EnhancedTimeline = lazy(() => import("@/pages/enhanced-timeline"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const NotificationsPage = lazy(() => import("@/pages/Notifications"));
const MessagesPage = lazy(() => import("@/pages/Messages"));
const Invitations = lazy(() => import("@/pages/invitations"));
const TangoCommunities = lazy(() => import("@/pages/tango-communities"));
const CreateCommunity = lazy(() => import("@/pages/create-community"));
const GroupDetailPage = lazy(() => import("@/pages/GroupDetailPage"));
const FeatureNavigation = lazy(() => import("@/pages/feature-navigation"));

// Analytics & Monitoring
const GlobalStatistics = lazy(() => import("@/pages/global-statistics"));
const LiveGlobalStatistics = lazy(() => import("@/pages/LiveGlobalStatistics"));
const FinOpsDashboard = lazy(() => import("@/pages/FinOpsDashboard"));
const MonitoringDashboard = lazy(() => import("@/pages/MonitoringDashboard"));
const PrivacyAnalytics = lazy(() => import("@/pages/PrivacyAnalytics"));
const SubscriptionAnalytics = lazy(() => import("@/pages/SubscriptionAnalytics"));

// Agent Intelligence
const AgentIntelligenceNetwork = lazy(() => import("@/pages/AgentIntelligenceNetwork"));
const AgentDetail = lazy(() => import("@/pages/AgentDetail"));

// MB.MD BATCH 3: 25 Additional Routes (Travel, Media, User Management, Testing, Stories)
// Travel & Planning
const TravelPlanner = lazy(() => import("@/pages/TravelPlanner"));
const Organizer = lazy(() => import("@/pages/organizer"));
const Teacher = lazy(() => import("@/pages/teacher"));
const CommunityWorldMap = lazy(() => import("@/pages/community-world-map"));

// Media & Streaming
const LiveStreaming = lazy(() => import("@/pages/LiveStreaming"));
const MediaUploadTest = lazy(() => import("@/pages/MediaUploadTest"));

// User Management
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const ProfileSwitcher = lazy(() => import("@/pages/ProfileSwitcher"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const PublicResumePage = lazy(() => import("@/pages/PublicResumePage"));
const ResumePage = lazy(() => import("@/pages/ResumePage"));
const RoleInvitations = lazy(() => import("@/pages/RoleInvitations"));
const RecommendationsBrowsePage = lazy(() => import("@/pages/RecommendationsBrowsePage"));

// Subscriptions & Promo
const SubscriptionPage = lazy(() => import("@/pages/Subscription"));
const PromoCodesAdmin = lazy(() => import("@/pages/PromoCodesAdmin"));

// Testing & Development
const MonitoringTest = lazy(() => import("@/pages/MonitoringTest"));
const MobileAppDashboard = lazy(() => import("@/pages/MobileAppDashboard"));
const LifeCeoPerformance = lazy(() => import("@/pages/LifeCeoPerformance"));
const ProjectTracker = lazy(() => import("@/pages/ProjectTracker"));
const DatabaseSecurity = lazy(() => import("@/pages/database-security"));
const CodeOfConduct = lazy(() => import("@/pages/code-of-conduct"));

// Stories
const TangoStories = lazy(() => import("@/pages/TangoStories"));

// MB.MD BATCH 1 (Already defined above - keeping for reference)
// AdminCenter, AdminDashboard, ESAMindPage, AgentMetrics, PlatformHealth
const AdminCenter = lazy(() => import("@/pages/AdminCenter"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const ESAMindPage = lazy(() => import("@/pages/admin/ESAMind"));
const AgentMetrics = lazy(() => import("@/pages/admin/AgentMetrics"));
const PlatformHealth = lazy(() => import("@/pages/admin/PlatformHealth"));

// Billing & Payments (Batch 1)
const BillingDashboard = lazy(() => import("@/pages/BillingDashboard"));
const Subscribe = lazy(() => import("@/pages/Subscribe"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const PaymentMethods = lazy(() => import("@/pages/PaymentMethods"));

// Enhanced Features (Batch 1)
const EnhancedEvents = lazy(() => import("@/pages/EnhancedEvents"));
const Community = lazy(() => import("@/pages/community"));

// Auth Pages (Batch 1)
const Login = lazy(() => import("@/pages/auth/login"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const Register = lazy(() => import("@/pages/auth/register"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));

// Phase 14 Batch 1: Lazy load heavy components to improve LCP (24.6s → 15-18s target)
// ESA MindMap - Global AI agent navigator for Super Admins (Section 10.11)
const ESAMindMap = lazy(() => import("@/components/esa/ESAMindMap").then(m => ({ default: m.ESAMindMap })));

// ESA AI Intelligence Network - User Support Components (Agent #31, #68-71)
const AIHelpButton = lazy(() => import("@/components/ai/AIHelpButton").then(m => ({ default: m.AIHelpButton })));
const SmartPageSuggestions = lazy(() => import("@/components/ai/SmartPageSuggestions").then(m => ({ default: m.SmartPageSuggestions })));
const AIContextBar = lazy(() => import("@/components/ai/AIContextBar").then(m => ({ default: m.AIContextBar })));

// ESA Mr Blue - AI Companion for Universal Access (Agents #73-80)
// MB.MD FIX: Direct import instead of lazy to avoid Vite HMR file deletion bug
import { MrBlueComplete } from "@/components/mrBlue/MrBlueComplete";

// ESA Dev Tools - Super Admin toggle for development testing
const SuperAdminToggle = lazy(() => import("@/components/dev/SuperAdminToggle").then(m => ({ default: m.SuperAdminToggle })));

// Phase 15 Batch 1: Cache monitor display for development
// DISABLED - Vite HMR file deletion bug keeps removing this file
// const CacheMonitorDisplay = lazy(() => import("@/components/dev/CacheMonitorDisplay").then(m => ({ default: m.CacheMonitorDisplay })));

// ESA Visual Editor - Replit-style page editor (Agent #78)
const VisualEditorWrapper = lazy(() => import("@/components/visual-editor/VisualEditorWrapper"));

// EventDiscoveryFeed - Used on multiple pages but deferred to reduce initial bundle
const EventDiscoveryFeed = lazy(() => import('@/components/events/EventDiscoveryFeed'));
// MB.MD FIX: Discover page doesn't exist - commented out to fix crash
// const Discover = lazy(() => import('@/pages/discover'));

// Mundo Tango ESA Layer 44 - Minimal loading component to prevent browser freeze
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear-gradient(to bottom right, #f0fdfa, #ecfeff)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        border: '2px solid #14b8a6', 
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p style={{ color: '#6b7280' }}>{message}</p>
    </div>
  </div>
);

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// J1 Visitor Route Guard - NO LONGER REDIRECTS (allows authenticated users to see visitor pages)
function VisitorRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback message="Loading..." />;
  }

  // J1 FIX: Show visitor pages even if user is authenticated
  // (Allows logged-in users to view landing/discover/about pages)
  return <>{children}</>;
}

function Router() {
  // ESA LIFE CEO 61x21 - Registry-driven routing (Layers 21-30)
  const currentPath = window.location.pathname;
  const { isAuthenticated, isLoading } = useAuth();
  console.log("🔍 Current path:", currentPath);

  // Get routes from registry - debugRoutes only in development
  const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  const allRoutes = isDevelopment 
    ? [...productionRoutes, ...debugRoutes]
    : productionRoutes;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* MB.MD MINIMAL ROUTES: Only using imported components to fix blank screen */}
          
          {/* Home/Landing - uses Landing component */}
          <Route path="/">
            {isLoading ? (
              <LoadingFallback />
            ) : (
              <Landing />
            )}
          </Route>

          {/* Explicit landing page route */}
          <Route path="/landing">
            <Landing />
          </Route>

          {/* Mundo Tango Internal CMS - Notion-style tango stories */}
          <Route path="/notion">
            <NotionHomePage />
          </Route>

          {/* Mundo Tango Mobile Pages - 38% → 100% Production Readiness */}
          <Route path="/messages">
            <MessagesMobile />
          </Route>
          <Route path="/notifications">
            <NotificationsMobile />
          </Route>
          <Route path="/calendar">
            <CalendarPage />
          </Route>
          <Route path="/profile-mobile">
            <ProfileMobile />
          </Route>
          <Route path="/groups-mobile">
            <GroupsMobile />
          </Route>

          {/* Mundo Tango Core Social Features - Phase 1A (Oct 20, 2025) */}
          <Route path="/memories">
            <MemoriesPage />
          </Route>

          {/* MB.MD BATCH 1: 30 High-Value Routes - Social, Events, Admin */}
          <Route path="/events">
            <EventsPage />
          </Route>
          <Route path="/event/:id">
            <EventDetail />
          </Route>
          <Route path="/profile">
            <ProfilePage />
          </Route>
          <Route path="/group/:id">
            <GroupPage />
          </Route>
          <Route path="/home">
            <HomePage />
          </Route>
          <Route path="/search">
            <SearchPage />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            <AdminCenter />
          </Route>
          <Route path="/admin/dashboard">
            <AdminDashboard />
          </Route>
          <Route path="/admin/esa-mind">
            <ESAMindPage />
          </Route>
          <Route path="/admin/agent-metrics">
            <AgentMetrics />
          </Route>
          <Route path="/admin/platform-health">
            <PlatformHealth />
          </Route>

          {/* Billing & Payments */}
          <Route path="/billing">
            <BillingDashboard />
          </Route>
          <Route path="/subscribe">
            <Subscribe />
          </Route>
          <Route path="/checkout">
            <Checkout />
          </Route>
          <Route path="/payment-methods">
            <PaymentMethods />
          </Route>

          {/* Enhanced Features */}
          <Route path="/enhanced-events">
            <EnhancedEvents />
          </Route>
          <Route path="/community">
            <Community />
          </Route>

          {/* Auth Routes */}
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/forgot-password">
            <ForgotPassword />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/reset-password">
            <ResetPassword />
          </Route>

          {/* MB.MD BATCH 2: 40 Additional Routes (Housing, Admin Extended, Social, Analytics, Agents) */}
          {/* Housing & Marketplace */}
          <Route path="/housing">
            <HousingMarketplace />
          </Route>
          <Route path="/host/calendar">
            <HostCalendar />
          </Route>
          <Route path="/host/bookings">
            <HostBookings />
          </Route>
          <Route path="/my-bookings">
            <MyBookings />
          </Route>
          <Route path="/listing/:id">
            <ListingDetail />
          </Route>

          {/* Admin Extended */}
          <Route path="/admin/users">
            <AdminUsers />
          </Route>
          <Route path="/admin/sprints">
            <AdminSprints />
          </Route>
          <Route path="/admin/projects">
            <AdminProjects />
          </Route>
          <Route path="/admin/tenants">
            <TenantManagement />
          </Route>
          <Route path="/admin/stories">
            <StoriesList />
          </Route>
          <Route path="/admin/story/:id">
            <StoryDetail />
          </Route>
          <Route path="/admin/ui-subagents">
            <UISubAgents />
          </Route>
          <Route path="/admin/smart-agents">
            <SmartAgentsDashboard />
          </Route>
          <Route path="/admin/mr-blue">
            <MrBlueDashboard />
          </Route>
          <Route path="/admin/performance">
            <PerformanceDashboard />
          </Route>
          <Route path="/admin/page-state">
            <PageStateMonitor />
          </Route>
          <Route path="/admin/page-agents">
            <PageAgentsDashboard />
          </Route>
          <Route path="/admin/multi-ai">
            <MultiAIDashboard />
          </Route>
          <Route path="/admin/multi-ai-analytics">
            <MultiAIAnalytics />
          </Route>
          <Route path="/admin/health">
            <HealthMonitor />
          </Route>
          <Route path="/admin/component-health">
            <ComponentHealthDashboard />
          </Route>
          <Route path="/admin/autofix">
            <AutoFixDashboard />
          </Route>
          <Route path="/admin/agent-coordination">
            <AgentCoordination />
          </Route>

          {/* Social Pages */}
          <Route path="/groups">
            <Groups />
          </Route>
          <Route path="/friends-page">
            <FriendsPage />
          </Route>
          <Route path="/timeline">
            <TimelineMinimal />
          </Route>
          <Route path="/timeline-debug">
            <TimelineDebug />
          </Route>
          <Route path="/timeline-enhanced">
            <EnhancedTimeline />
          </Route>
          <Route path="/onboarding">
            <Onboarding />
          </Route>
          <Route path="/notifications-page">
            <NotificationsPage />
          </Route>
          <Route path="/messages-page">
            <MessagesPage />
          </Route>
          <Route path="/invitations">
            <Invitations />
          </Route>
          <Route path="/tango-communities">
            <TangoCommunities />
          </Route>
          <Route path="/create-community">
            <CreateCommunity />
          </Route>
          <Route path="/group-detail/:id">
            <GroupDetailPage />
          </Route>
          <Route path="/features">
            <FeatureNavigation />
          </Route>

          {/* Analytics & Monitoring */}
          <Route path="/statistics">
            <GlobalStatistics />
          </Route>
          <Route path="/live-statistics">
            <LiveGlobalStatistics />
          </Route>
          <Route path="/finops">
            <FinOpsDashboard />
          </Route>
          <Route path="/monitoring">
            <MonitoringDashboard />
          </Route>
          <Route path="/privacy-analytics">
            <PrivacyAnalytics />
          </Route>
          <Route path="/subscription-analytics">
            <SubscriptionAnalytics />
          </Route>

          {/* Agent Intelligence */}
          <Route path="/agents">
            <AgentIntelligenceNetwork />
          </Route>
          <Route path="/agent/:id">
            <AgentDetail />
          </Route>

          {/* MB.MD BATCH 3: 25 Additional Routes (Travel, Media, User Management, Testing) */}
          {/* Travel & Planning */}
          <Route path="/travel">
            <TravelPlanner />
          </Route>
          <Route path="/organizer">
            <Organizer />
          </Route>
          <Route path="/teacher">
            <Teacher />
          </Route>
          <Route path="/world-map">
            <CommunityWorldMap />
          </Route>

          {/* Media & Streaming */}
          <Route path="/live">
            <LiveStreaming />
          </Route>
          <Route path="/media-upload">
            <MediaUploadTest />
          </Route>

          {/* User Management */}
          <Route path="/settings">
            <UserSettings />
          </Route>
          <Route path="/profile-switcher">
            <ProfileSwitcher />
          </Route>
          <Route path="/u/:username">
            <PublicProfilePage />
          </Route>
          <Route path="/resume/public/:id">
            <PublicResumePage />
          </Route>
          <Route path="/resume">
            <ResumePage />
          </Route>
          <Route path="/role-invitations">
            <RoleInvitations />
          </Route>
          <Route path="/recommendations">
            <RecommendationsBrowsePage />
          </Route>

          {/* Subscriptions & Promo */}
          <Route path="/subscription">
            <SubscriptionPage />
          </Route>
          <Route path="/admin/promo-codes">
            <PromoCodesAdmin />
          </Route>

          {/* Testing & Development */}
          <Route path="/test/monitoring">
            <MonitoringTest />
          </Route>
          <Route path="/mobile-dashboard">
            <MobileAppDashboard />
          </Route>
          <Route path="/life-ceo">
            <LifeCeoPerformance />
          </Route>
          <Route path="/projects">
            <ProjectTracker />
          </Route>
          <Route path="/security">
            <DatabaseSecurity />
          </Route>
          <Route path="/conduct">
            <CodeOfConduct />
          </Route>

          {/* Stories */}
          <Route path="/stories">
            <TangoStories />
          </Route>

          {/* Mundo Tango ESA - Dynamic Routes from Registry (Visual Editor, Mr Blue, etc.) */}
          {/* CRITICAL: Registry routes MUST come before /:slug to prevent greedy matching */}
          {allRoutes.map((route: RouteConfig) => {
            const RouteComponent = route.component;
            return (
              <Route key={route.path} path={route.path}>
                <RouteComponent />
              </Route>
            );
          })}

          {/* Notion CMS Catch-All - MUST be AFTER registry routes */}
          <Route path="/:slug">
            <NotionEntryPage />
          </Route>

          {/* Fallback: 404 Not Found */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Suspense>
      
      {/* Phase 14 Batch 1: Lazy load AI components with Suspense */}
      <Suspense fallback={null}>
        <AIHelpButton position="bottom-right" offset={6} />
      </Suspense>
      <Suspense fallback={null}>
        <SmartPageSuggestions position="top-center" autoHide={true} />
      </Suspense>
      <Suspense fallback={null}>
        <AIContextBar position="top" collapsible={true} />
      </Suspense>
    </ErrorBoundary>
  );
}

function AppContent() {
  console.log('🎯 [AppContent] Rendering - TESTING ESA COMPONENTS');
  
  // MB.MD INFRA-5A: Hooks re-enabled - SAFE ✅
  usePerformanceOptimization(); // ESA Performance Layer 50
  useMonitoring(); // ESA Monitoring Layer 51
  usePageTracking(); // PostHog page view tracking

  // MB.MD TRACK 1: Sidebar state for mobile BottomNav integration
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🎯 [AppContent] Mr Blue AI & Visual Editor both ACTIVE ✅');

  return (
    <>
      <Router />
      <Toaster />
      <TrialBanner />
      
      {/* MB.MD TRACK 1: Global BottomNav (Mobile <768px) - Oct 20, 2025 */}
      {/* Production-ready: 95 lines, Aurora Tide, 56px touch targets */}
      <BottomNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Phase 14 Batch 1: Lazy load dev/admin tools with Suspense */}
      <Suspense fallback={null}>
        <SuperAdminToggle />
      </Suspense>
      <Suspense fallback={null}>
        <ESAMindMap />
      </Suspense>
      {/* MB.MD FIX: Placeholder modal REMOVED - MrBlueComplete component handles all UI */}
      <MrBlueComplete />
      <Suspense fallback={null}>
        <VisualEditorWrapper children={null} />
      </Suspense>
      {/* Phase 15 Batch 1: Cache monitoring display DISABLED - Vite HMR bug */}
      {/* <Suspense fallback={null}>
        <CacheMonitorDisplay />
      </Suspense> */}
    </>
  );
}

function App() {
  console.log('🚀 [App] ROOT COMPONENT RENDERING');
  
  useEffect(() => {
    console.log('🚀 [App] useEffect running - setup starting');
    // Setup global error handlers
    setupGlobalErrorHandlers();
    setupQueryErrorHandling(queryClient);
    
    // Initialize analytics
    initAnalytics();
    
    // Initialize PostHog analytics
    initPostHog();

    // Life CEO Performance Optimization
    lifeCeoPerformance.init();
    // Performance optimizations auto-initialized
    console.log('🚀 [App] useEffect complete - setup done');
  }, []);

  console.log('🚀 [App] About to return JSX tree');

  // MB.MD INFRA-4: Testing monitoring providers (Tenant ✅, LocationBias ✅, Socket ✅)
  // Phase 0 Task 0.4: PageAgentProvider DISABLED due to Vite HMR file deletion bug
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <LocationBiasProvider>
              {/* <PageAgentProvider> DISABLED - Vite HMR deletes this file */}
                <SocketProvider>
                  <TooltipProvider>
                    <OpenReplayProvider>
                      <MonitoringProvider>
                        <MicroInteractionProvider>
                          <AppContent />
                        </MicroInteractionProvider>
                      </MonitoringProvider>
                    </OpenReplayProvider>
                  </TooltipProvider>
                </SocketProvider>
              {/* </PageAgentProvider> */}
            </LocationBiasProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
