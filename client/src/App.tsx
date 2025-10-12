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
import { LocationBiasProvider } from "@/contexts/LocationBiasContext";
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

// ESA LIFE CEO 61x21 - Route Registry (Layers 21-30)
import { productionRoutes, debugRoutes, type RouteConfig } from "@/config/routes";

// Import shared queryClient with ESA Layer 14 cache configuration
import { queryClient } from "@/lib/queryClient";

// Critical components that load immediately - minimal initial bundle
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import TrialBanner from "@/components/TrialBanner";

// ESA MindMap - Global AI agent navigator for Super Admins (Section 10.11)
const ESAMindMap = lazy(() => import("@/components/esa/ESAMindMap").then(module => ({ default: module.ESAMindMap })));

// ESA AI Intelligence Network - User Support Components (Agent #31, #68-71)
const AIHelpButton = lazy(() => import("@/components/ai/AIHelpButton").then(module => ({ default: module.AIHelpButton })));
const SmartPageSuggestions = lazy(() => import("@/components/ai/SmartPageSuggestions").then(module => ({ default: module.SmartPageSuggestions })));
const AIContextBar = lazy(() => import("@/components/ai/AIContextBar").then(module => ({ default: module.AIContextBar })));

// ESA Mr Blue - AI Companion for Super Admins (Agents #73-80)
const MrBlueFloatingButton = lazy(() => import("@/components/mrBlue/MrBlueFloatingButton").then(module => ({ default: module.MrBlueFloatingButton })));

// Import EventDiscoveryFeed directly since it's used frequently
import EventDiscoveryFeed from '@/components/events/EventDiscoveryFeed';

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
  // ESA LIFE CEO 61x21 - Registry-driven routing (Layers 21-30)
  const currentPath = window.location.pathname;
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
          {/* Homepage - Redirect to unified Memories feed */}
          <Route path="/">
            <Redirect to="/memories" />
          </Route>

          {/* Landing page for non-authenticated users */}
          <Route path="/landing">
            <Landing />
          </Route>

          {/* ESA LIFE CEO 61x21 - Dynamic Routes from Registry */}
          {allRoutes.map((route: RouteConfig) => {
            // React.createElement for dynamic lazy components
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
      
      {/* ESA AI Intelligence Network - Wrapped in Suspense for lazy loading */}
      <Suspense fallback={null}>
        <AIHelpButton position="bottom-right" offset={6} />
        <SmartPageSuggestions position="top-center" autoHide={true} />
        <AIContextBar position="top" collapsible={true} />
      </Suspense>
    </ErrorBoundary>
  );
}

function AppContent() {
  usePerformanceOptimization(); // ESA Performance Layer 50
  useMonitoring(); // ESA Monitoring Layer 51

  return (
    <>
      <Router />
      <Suspense fallback={null}>
        <ESAMindMap />
        <MrBlueFloatingButton />
      </Suspense>
      <Toaster />
      <TrialBanner />
    </>
  );
}

function App() {
  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers();
    setupQueryErrorHandling(queryClient);
    
    // Initialize analytics
    initAnalytics();

    // Life CEO Performance Optimization
    lifeCeoPerformance.init();
    // Performance optimizations auto-initialized
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <CsrfProvider>
          <AuthProvider>
            <TenantProvider>
              <LocationBiasProvider>
                <SocketProvider>
                  <TooltipProvider>
                    <OpenReplayProvider>
                      <MonitoringProvider>
                        <MicroInteractionProvider>
                          <SessionRecordingNotice />
                          <ThemeManager />
                          <AppContent />
                        </MicroInteractionProvider>
                      </MonitoringProvider>
                    </OpenReplayProvider>
                  </TooltipProvider>
                </SocketProvider>
              </LocationBiasProvider>
            </TenantProvider>
          </AuthProvider>
        </CsrfProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
