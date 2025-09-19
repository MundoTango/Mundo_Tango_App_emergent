import React, { useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/socket-context";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/TenantContext";
import { CsrfProvider } from "@/contexts/CsrfContext";
import { OpenReplayProvider } from "@/components/OpenReplayProvider";
import { SessionRecordingNotice } from "@/components/SessionRecordingNotice";
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics, analytics } from "@/lib/analytics";
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
import "@/utils/console-cleanup"; // Security: Clean console output
// ESA Life CEO 61x21 - Monitoring Services
import { MonitoringProvider } from "@/components/MonitoringProvider";
import { useMonitoring } from "@/hooks/useMonitoring";

// Create queryClient inside App component to avoid initialization issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        if (!res.ok) {
          const text = (await res.text()) || res.statusText;
          throw new Error(`${res.status}: ${text}`);
        }

        return await res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Critical components that load immediately - minimal initial bundle
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import TrialBanner from "@/components/TrialBanner";

// ESA Fix: Import Moments directly to avoid dynamic import issues
import Moments from "@/pages/moments";

// Import EventDiscoveryFeed directly since it's used frequently
import EventDiscoveryFeed from '@/components/events/EventDiscoveryFeed';

// ========== Authentication Pages (2) ==========
const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));

// ========== User Management Pages (8) ==========
const Profile = lazy(() => import("@/pages/profile"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const ResumePage = lazy(() => import("@/pages/ResumePage"));
const PublicResumePage = lazy(() => import("@/pages/PublicResumePage"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const ProfileSwitcher = lazy(() => import("@/pages/ProfileSwitcher"));
const Home = lazy(() => import("@/pages/home"));

// ========== Events System Pages (6) ==========
const Events = lazy(() => import("@/pages/Events"));
const EnhancedEvents = lazy(() => import("@/pages/EnhancedEvents"));
const EventDetail = lazy(() => import("@/pages/event-detail"));
const TeacherDashboard = lazy(() => import("@/pages/teacher"));
const OrganizerDashboard = lazy(() => import("@/pages/organizer"));

// ========== Housing & Marketplace Pages (3) ==========
const HousingMarketplace = lazy(() => import("@/pages/housing-marketplace"));
const HostOnboarding = lazy(() => import("@/pages/HostOnboarding"));
const GuestOnboarding = lazy(() => import("@/pages/GuestOnboarding"));

// ========== Social Features Pages (7) ==========
const Friends = lazy(() => import("@/pages/Friends"));
const EnhancedFriends = lazy(() => import("@/pages/EnhancedFriends"));
const FriendshipPage = lazy(() => import("@/pages/FriendshipPage"));
const Messages = lazy(() => import("@/pages/Messages"));
const Groups = lazy(() => import("@/pages/groups"));
const GroupDetailPage = lazy(() => import("@/pages/GroupDetailPageMT"));
const RoleInvitations = lazy(() => import("@/pages/RoleInvitations"));

// ========== Community Pages (8) ==========
const Community = lazy(() => import("@/pages/community"));
const CommunityWorldMap = lazy(() => import("@/pages/community-world-map"));
const CreateCommunity = lazy(() => import("@/pages/CreateCommunity"));
const TangoCommunities = lazy(() => import("@/pages/tango-communities"));
const TangoStories = lazy(() => import("@/pages/TangoStories"));
const LiveStreaming = lazy(() => import("@/pages/LiveStreaming")); // Phase 20: Live Streaming
const Gamification = lazy(() => import("@/pages/Gamification")); // Phase 20: Gamification

// ========== Content & Timeline Pages (8) ==========
const ModernMemoriesPage = lazy(() => import("@/pages/ModernMemoriesPage"));
const UnifiedMemories = lazy(() => import("@/pages/UnifiedMemories"));
const EnhancedTimelineV2 = lazy(() => import("@/pages/enhanced-timeline-v2"));
const Search = lazy(() => import("@/pages/search"));
const PostingDemo = lazy(() => import("@/pages/PostingDemo"));
const TimelineMinimal = lazy(() => import("@/pages/timeline-minimal"));

// ========== Billing & Subscriptions Pages (7) ==========
const Subscribe = lazy(() => import("@/pages/Subscribe"));
const BillingDashboard = lazy(() => import("@/pages/BillingDashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentMethods = lazy(() => import("./pages/PaymentMethods"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Subscription = lazy(() => import("./pages/Subscription"));
const SubscriptionAnalytics = lazy(() => import("./pages/SubscriptionAnalytics"));

// ========== Admin & Analytics Pages (11) ==========
const AdminCenter = lazy(() => import("@/pages/AdminCenter"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminModeration = lazy(() => import("@/pages/admin/moderation"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const PromoCodesAdmin = lazy(() => import("./pages/PromoCodesAdmin"));
const AnalyticsDashboard = lazy(() => import("@/pages/AnalyticsDashboard"));
const AgentFrameworkDashboard = lazy(() => import("@/pages/AgentFrameworkDashboard"));
const ProjectTracker = lazy(() => import("@/pages/ProjectTracker"));
const LiveGlobalStatistics = lazy(() => import("@/pages/LiveGlobalStatistics"));
const HierarchyDashboard = lazy(() => import("@/pages/HierarchyDashboard"));

// ========== LifeCEO Pages (3) ==========
const LifeCEOEnhanced = lazy(() => import("@/pages/LifeCEOEnhanced"));
const LifeCeoPerformance = lazy(() => import("@/pages/LifeCeoPerformance"));

// ========== Testing & Development Pages (6) ==========
const MediaUploadTest = lazy(() => import("@/pages/MediaUploadTest"));
const MonitoringDashboard = lazy(() => import("@/pages/MonitoringDashboard"));
const MonitoringTest = lazy(() => import("@/pages/MonitoringTest"));
const TestGroupedRoleSelector = lazy(() => import("@/components/test/TestGroupedRoleSelector"));
const TTfilesDemo = lazy(() => import("@/pages/TTfilesDemo"));
const FeatureNavigation = lazy(() => import("@/pages/feature-navigation"));
const DatabaseSecurity = lazy(() => import("@/pages/database-security"));

// ========== Legal & Compliance Pages (4) ==========
const CodeOfConduct = lazy(() => import("@/pages/code-of-conduct"));
const PrivacyAnalytics = lazy(() => import("@/pages/PrivacyAnalytics"));

// ========== Additional Platform Pages (5) ==========
const TravelPlanner = lazy(() => import("@/pages/TravelPlanner"));
const MobileAppDashboard = lazy(() => import("@/pages/MobileAppDashboard"));
const ErrorBoundaryPage = lazy(() => import("@/pages/ErrorBoundaryPage"));
// TODO: Fix Notion pages - they need default exports
// const NotionHomePage = lazy(() => import("@/pages/NotionHomePage"));
// const NotionEntryPage = lazy(() => import("@/pages/NotionEntryPage"));

// Life CEO 44x21s Layer 44 - Minimal loading component to prevent browser freeze
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

function Router() {
  // ESA Fix: Simplified router without auth hooks to prevent hook errors
  const currentPath = window.location.pathname;
  console.log("🔍 Current path:", currentPath);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Homepage - Direct to Memories feed */}
          <Route path="/">
            <Moments />
          </Route>

          {/* ========== Authentication Routes (2) ========== */}
          <Route path="/login">
            <Suspense fallback={<LoadingFallback message="Loading login..." />}>
              <Login />
            </Suspense>
          </Route>
          
          <Route path="/auth/login">
            <Suspense fallback={<LoadingFallback message="Loading login..." />}>
              <Login />
            </Suspense>
          </Route>

          <Route path="/register">
            <Suspense fallback={<LoadingFallback message="Loading registration..." />}>
              <Register />
            </Suspense>
          </Route>
          
          <Route path="/auth/register">
            <Suspense fallback={<LoadingFallback message="Loading registration..." />}>
              <Register />
            </Suspense>
          </Route>

          {/* ========== User Management Routes (8) ========== */}
          <Route path="/home">
            <Suspense fallback={<LoadingFallback message="Loading home..." />}>
              <Home />
            </Suspense>
          </Route>

          <Route path="/profile">
            <Suspense fallback={<LoadingFallback message="Loading profile..." />}>
              <Profile />
            </Suspense>
          </Route>

          <Route path="/settings">
            <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
              <UserSettings />
            </Suspense>
          </Route>

          <Route path="/onboarding">
            <Suspense fallback={<LoadingFallback message="Loading onboarding..." />}>
              <Onboarding />
            </Suspense>
          </Route>

          <Route path="/resume">
            <Suspense fallback={<LoadingFallback message="Loading resume..." />}>
              <ResumePage />
            </Suspense>
          </Route>

          <Route path="/public-resume/:userId?">
            <Suspense fallback={<LoadingFallback message="Loading public resume..." />}>
              <PublicResumePage />
            </Suspense>
          </Route>

          <Route path="/public-profile/:userId?">
            <Suspense fallback={<LoadingFallback message="Loading public profile..." />}>
              <PublicProfilePage />
            </Suspense>
          </Route>

          <Route path="/profile-switcher">
            <Suspense fallback={<LoadingFallback message="Loading profile switcher..." />}>
              <ProfileSwitcher />
            </Suspense>
          </Route>

          {/* ========== Events System Routes (6) ========== */}
          <Route path="/events">
            <Suspense fallback={<LoadingFallback message="Loading events..." />}>
              <EnhancedEvents />
            </Suspense>
          </Route>

          <Route path="/events/discover">
            <Suspense fallback={<LoadingFallback message="Loading event discovery..." />}>
              <EventDiscoveryFeed />
            </Suspense>
          </Route>

          <Route path="/events/:id">
            <Suspense fallback={<LoadingFallback message="Loading event details..." />}>
              <EventDetail />
            </Suspense>
          </Route>

          <Route path="/teacher">
            <Suspense fallback={<LoadingFallback message="Loading teacher dashboard..." />}>
              <TeacherDashboard />
            </Suspense>
          </Route>

          <Route path="/organizer">
            <Suspense fallback={<LoadingFallback message="Loading organizer dashboard..." />}>
              <OrganizerDashboard />
            </Suspense>
          </Route>

          {/* ========== Housing & Marketplace Routes (3) ========== */}
          <Route path="/housing-marketplace">
            <Suspense fallback={<LoadingFallback message="Loading housing marketplace..." />}>
              <HousingMarketplace />
            </Suspense>
          </Route>

          <Route path="/host-onboarding">
            <Suspense fallback={<LoadingFallback message="Loading host onboarding..." />}>
              <HostOnboarding />
            </Suspense>
          </Route>

          <Route path="/guest-onboarding">
            <Suspense fallback={<LoadingFallback message="Loading guest onboarding..." />}>
              <GuestOnboarding />
            </Suspense>
          </Route>

          {/* ========== Social Features Routes (7) ========== */}
          <Route path="/friends">
            <Suspense fallback={<LoadingFallback message="Loading friends..." />}>
              <EnhancedFriends />
            </Suspense>
          </Route>

          <Route path="/friendship/:friendId">
            <Suspense fallback={<LoadingFallback message="Loading friendship details..." />}>
              <FriendshipPage />
            </Suspense>
          </Route>

          <Route path="/messages">
            <Suspense fallback={<LoadingFallback message="Loading messages..." />}>
              <Messages />
            </Suspense>
          </Route>

          <Route path="/groups">
            <Suspense fallback={<LoadingFallback message="Loading groups..." />}>
              <Groups />
            </Suspense>
          </Route>

          <Route path="/groups/:slug">
            <Suspense fallback={<LoadingFallback message="Loading group..." />}>
              <GroupDetailPage />
            </Suspense>
          </Route>

          <Route path="/invitations">
            <Suspense fallback={<LoadingFallback message="Loading invitations..." />}>
              <RoleInvitations />
            </Suspense>
          </Route>

          {/* ========== Community Routes (6) ========== */}
          <Route path="/community">
            <Suspense fallback={<LoadingFallback message="Loading community..." />}>
              <Community />
            </Suspense>
          </Route>

          <Route path="/community-world-map">
            <Suspense fallback={<LoadingFallback message="Loading world map..." />}>
              <CommunityWorldMap />
            </Suspense>
          </Route>

          <Route path="/create-community">
            <Suspense fallback={<LoadingFallback message="Loading community creator..." />}>
              <CreateCommunity />
            </Suspense>
          </Route>

          <Route path="/tango-communities">
            <Suspense fallback={<LoadingFallback message="Loading communities..." />}>
              <TangoCommunities />
            </Suspense>
          </Route>

          <Route path="/tango-stories">
            <Suspense fallback={<LoadingFallback message="Loading stories..." />}>
              <TangoStories />
            </Suspense>
          </Route>

          <Route path="/live-streaming">
            <Suspense fallback={<LoadingFallback message="Loading streaming..." />}>
              <LiveStreaming />
            </Suspense>
          </Route>

          <Route path="/gamification">
            <Suspense fallback={<LoadingFallback message="Loading gamification..." />}>
              <Gamification />
            </Suspense>
          </Route>

          {/* ========== Content & Timeline Routes (8) ========== */}
          <Route path="/moments">
            <Suspense fallback={<LoadingFallback message="Loading moments..." />}>
              <Moments />
            </Suspense>
          </Route>

          <Route path="/memories">
            <Suspense fallback={<LoadingFallback message="Loading memories..." />}>
              <ModernMemoriesPage />
            </Suspense>
          </Route>

          <Route path="/unified-memories">
            <Suspense fallback={<LoadingFallback message="Loading unified memories..." />}>
              <UnifiedMemories />
            </Suspense>
          </Route>

          <Route path="/enhanced-timeline">
            <Suspense fallback={<LoadingFallback message="Loading timeline..." />}>
              <EnhancedTimelineV2 />
            </Suspense>
          </Route>

          <Route path="/search">
            <Suspense fallback={<LoadingFallback message="Loading search..." />}>
              <Search />
            </Suspense>
          </Route>

          <Route path="/posting-demo">
            <Suspense fallback={<LoadingFallback message="Loading posting demo..." />}>
              <PostingDemo />
            </Suspense>
          </Route>

          <Route path="/timeline-minimal">
            <Suspense fallback={<LoadingFallback message="Loading minimal timeline..." />}>
              <TimelineMinimal />
            </Suspense>
          </Route>

          <Route path="/landing">
            <Landing />
          </Route>

          {/* ========== Billing & Subscriptions Routes (7) ========== */}
          <Route path="/subscribe">
            <Suspense fallback={<LoadingFallback message="Loading subscription plans..." />}>
              <Subscribe />
            </Suspense>
          </Route>

          <Route path="/settings/billing">
            <Suspense fallback={<LoadingFallback message="Loading billing..." />}>
              <BillingDashboard />
            </Suspense>
          </Route>

          <Route path="/checkout/:tier">
            <Suspense fallback={<LoadingFallback message="Loading checkout..." />}>
              <Checkout />
            </Suspense>
          </Route>

          <Route path="/payment-methods">
            <Suspense fallback={<LoadingFallback message="Loading payment methods..." />}>
              <PaymentMethods />
            </Suspense>
          </Route>

          <Route path="/invoices">
            <Suspense fallback={<LoadingFallback message="Loading invoices..." />}>
              <Invoices />
            </Suspense>
          </Route>

          <Route path="/subscription">
            <Suspense fallback={<LoadingFallback message="Loading subscription..." />}>
              <Subscription />
            </Suspense>
          </Route>

          {/* ========== Admin & Analytics Routes (11) ========== */}
          <Route path="/admin">
            <Suspense fallback={<LoadingFallback message="Loading admin dashboard..." />}>
              <AdminDashboard />
            </Suspense>
          </Route>
          
          <Route path="/admin/users">
            <Suspense fallback={<LoadingFallback message="Loading user management..." />}>
              <AdminUsers />
            </Suspense>
          </Route>
          
          <Route path="/admin/moderation">
            <Suspense fallback={<LoadingFallback message="Loading moderation queue..." />}>
              <AdminModeration />
            </Suspense>
          </Route>
          
          <Route path="/admin/analytics">
            <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
              <AdminAnalytics />
            </Suspense>
          </Route>
          
          <Route path="/admin-legacy">
            <Suspense fallback={<LoadingFallback message="Loading admin center..." />}>
              <AdminCenter />
            </Suspense>
          </Route>

          <Route path="/admin/promo-codes">
            <Suspense fallback={<LoadingFallback message="Loading promo codes..." />}>
              <PromoCodesAdmin />
            </Suspense>
          </Route>

          <Route path="/admin/subscription-analytics">
            <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
              <SubscriptionAnalytics />
            </Suspense>
          </Route>

          <Route path="/analytics">
            <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
              <AnalyticsDashboard />
            </Suspense>
          </Route>

          <Route path="/agent-framework">
            <Suspense fallback={<LoadingFallback message="Loading Agent Framework Dashboard..." />}>
              <AgentFrameworkDashboard />
            </Suspense>
          </Route>

          <Route path="/project-tracker">
            <Suspense fallback={<LoadingFallback message="Loading project tracker..." />}>
              <ProjectTracker />
            </Suspense>
          </Route>

          <Route path="/stats">
            <Suspense fallback={<LoadingFallback message="Loading statistics..." />}>
              <LiveGlobalStatistics />
            </Suspense>
          </Route>

          <Route path="/global-statistics">
            <Suspense fallback={<LoadingFallback message="Loading statistics..." />}>
              <LiveGlobalStatistics />
            </Suspense>
          </Route>

          <Route path="/hierarchy">
            <Suspense fallback={<LoadingFallback message="Loading hierarchy..." />}>
              <HierarchyDashboard />
            </Suspense>
          </Route>

          {/* ========== LifeCEO Routes (3) ========== */}
          <Route path="/life-ceo">
            <Suspense fallback={<LoadingFallback message="Loading Life CEO..." />}>
              <LifeCEOEnhanced />
            </Suspense>
          </Route>

          <Route path="/life-ceo-performance">
            <Suspense fallback={<LoadingFallback message="Loading Life CEO Performance..." />}>
              <LifeCeoPerformance />
            </Suspense>
          </Route>

          <Route path="/lifeceo">
            <Suspense fallback={<LoadingFallback message="Loading Life CEO..." />}>
              <LifeCEOEnhanced />
            </Suspense>
          </Route>

          {/* ========== Testing & Development Routes (6) ========== */}
          <Route path="/monitoring">
            <Suspense fallback={<LoadingFallback message="Loading monitoring dashboard..." />}>
              <MonitoringDashboard />
            </Suspense>
          </Route>

          <Route path="/monitoring-test">
            <Suspense fallback={<LoadingFallback message="Loading monitoring test..." />}>
              <MonitoringTest />
            </Suspense>
          </Route>

          <Route path="/media-upload-test">
            <Suspense fallback={<LoadingFallback message="Loading media upload test..." />}>
              <MediaUploadTest />
            </Suspense>
          </Route>

          <Route path="/test-grouped-roles">
            <Suspense fallback={<LoadingFallback message="Loading test..." />}>
              <TestGroupedRoleSelector />
            </Suspense>
          </Route>

          <Route path="/ttfiles-demo">
            <Suspense fallback={<LoadingFallback message="Loading TTfiles demo..." />}>
              <TTfilesDemo />
            </Suspense>
          </Route>

          <Route path="/feature-navigation">
            <Suspense fallback={<LoadingFallback message="Loading feature navigation..." />}>
              <FeatureNavigation />
            </Suspense>
          </Route>

          <Route path="/database-security">
            <Suspense fallback={<LoadingFallback message="Loading database security..." />}>
              <DatabaseSecurity />
            </Suspense>
          </Route>

          {/* ========== Legal & Compliance Routes (4) ========== */}
          <Route path="/code-of-conduct">
            <Suspense fallback={<LoadingFallback message="Loading terms..." />}>
              <CodeOfConduct />
            </Suspense>
          </Route>

          <Route path="/terms">
            <Suspense fallback={<LoadingFallback message="Loading terms..." />}>
              <CodeOfConduct />
            </Suspense>
          </Route>

          <Route path="/privacy-policy">
            <Suspense fallback={<LoadingFallback message="Loading privacy policy..." />}>
              <CodeOfConduct />
            </Suspense>
          </Route>

          <Route path="/privacy-analytics">
            <Suspense fallback={<LoadingFallback message="Loading privacy settings..." />}>
              <PrivacyAnalytics />
            </Suspense>
          </Route>

          {/* ========== Additional Platform Routes (5) ========== */}
          <Route path="/travel-planner">
            <Suspense fallback={<LoadingFallback message="Loading travel planner..." />}>
              <TravelPlanner />
            </Suspense>
          </Route>

          <Route path="/mobile-dashboard">
            <Suspense fallback={<LoadingFallback message="Loading mobile dashboard..." />}>
              <MobileAppDashboard />
            </Suspense>
          </Route>

          <Route path="/error">
            <Suspense fallback={<LoadingFallback message="Loading..." />}>
              <ErrorBoundaryPage />
            </Suspense>
          </Route>

          {/* TODO: Add Notion integration when pages are ready
          <Route path="/notion">
            <Suspense fallback={<LoadingFallback message="Loading Notion..." />}>
              <NotionHomePage />
            </Suspense>
          </Route>

          <Route path="/notion/:entryId">
            <Suspense fallback={<LoadingFallback message="Loading Notion entry..." />}>
              <NotionEntryPage />
            </Suspense>
          </Route>
          */}

          {/* 404 Fallback - Must be last */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  // Life CEO 44x21s Layer 25 - Add TenantProvider to fix useTenant context error
  console.log('Life CEO 44x21s - Adding required context providers');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CsrfProvider>
          <TenantProvider>
            <OpenReplayProvider>
              <MonitoringProvider>
                <TrialBanner />
                <SessionRecordingNotice />
                <Router />
                <Toaster />
              </MonitoringProvider>
            </OpenReplayProvider>
          </TenantProvider>
        </CsrfProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}