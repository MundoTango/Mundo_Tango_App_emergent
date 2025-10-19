import React, { useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// Phase 14 Batch 1: Lazy load heavy components to improve LCP (24.6s → 15-18s target)
// ESA MindMap - Global AI agent navigator for Super Admins (Section 10.11)
const ESAMindMap = lazy(() => import("@/components/esa/ESAMindMap").then(m => ({ default: m.ESAMindMap })));

// ESA AI Intelligence Network - User Support Components (Agent #31, #68-71)
const AIHelpButton = lazy(() => import("@/components/ai/AIHelpButton").then(m => ({ default: m.AIHelpButton })));
const SmartPageSuggestions = lazy(() => import("@/components/ai/SmartPageSuggestions").then(m => ({ default: m.SmartPageSuggestions })));
const AIContextBar = lazy(() => import("@/components/ai/AIContextBar").then(m => ({ default: m.AIContextBar })));

// ESA Mr Blue - AI Companion for Universal Access (Agents #73-80)  
const MrBlueFloatingButton = lazy(() => import("@/components/mrBlue/MrBlueFloatingButton").then(m => ({ default: m.MrBlueFloatingButton })));

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

          {/* Mundo Tango ESA - Dynamic Routes from Registry (Visual Editor, Mr Blue, etc.) */}
          {allRoutes.map((route: RouteConfig) => {
            const RouteComponent = route.component;
            return (
              <Route key={route.path} path={route.path}>
                <RouteComponent />
              </Route>
            );
          })}

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

  console.log('🎯 [AppContent] Mr Blue AI & Visual Editor both ACTIVE ✅');

  return (
    <>
      <Router />
      <Toaster />
      <TrialBanner />
      {/* Phase 14 Batch 1: Lazy load dev/admin tools with Suspense */}
      <Suspense fallback={null}>
        <SuperAdminToggle />
      </Suspense>
      <Suspense fallback={null}>
        <ESAMindMap />
      </Suspense>
      {/* MB.MD: Mr Blue AI Companion (Agents #73-80, mb.md lines 988-1012) */}
      <Suspense fallback={null}>
        <MrBlueFloatingButton />
      </Suspense>
      <Suspense fallback={null}>
        <VisualEditorWrapper />
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
