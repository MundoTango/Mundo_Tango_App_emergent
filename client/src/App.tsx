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
import i18n from "@/lib/i18n"; // Initialize i18n
import { I18nextProvider } from "react-i18next";
import { performanceOptimizer } from "@/utils/performance"; // ESA Performance Optimizer
import "@/utils/console-cleanup"; // Security: Clean console output
// ESA Life CEO 61x21 - Monitoring Services
import { MonitoringProvider } from "@/components/MonitoringProvider";
import { useMonitoring } from "@/hooks/useMonitoring";

// ESA LIFE CEO 61x21 - Route Registry (Layers 21-30)
// Type-safe route management system - prevents debug components in production
// Documentation: docs/build-coordination/route-protection-sprint.md
import { productionRoutes, debugRoutes, type RouteConfig } from "@/config/routes";

// Import shared queryClient with ESA Layer 14 cache configuration
import { queryClient } from "@/lib/queryClient";

// Critical components that load immediately - minimal initial bundle
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import TrialBanner from "@/components/TrialBanner";

// Import EventDiscoveryFeed directly since it's used frequently
import EventDiscoveryFeed from '@/components/events/EventDiscoveryFeed';

// ESA LIFE CEO 61x21 - All other components now loaded from route registry
// See client/src/config/routes.ts for the complete route configuration

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
  // Type-safe route management prevents debug components in production
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

          {/* ESA Framework: Redirect legacy timeline routes to unified /memories interface */}
          <Route path="/timeline">
            <Redirect to="/memories" />
          </Route>
          <Route path="/enhanced-timeline">
            <Redirect to="/memories" />
          </Route>
          <Route path="/timeline-minimal">
            <Redirect to="/memories" />
          </Route>

          {/* Special route: Event discovery feed */}
          <Route path="/events/discover">
            <Suspense fallback={<LoadingFallback message="Loading event discovery..." />}>
              <EventDiscoveryFeed />
            </Suspense>
          </Route>

          {/* Landing page (not in registry - always eager loaded) */}
          <Route path="/landing">
            <Landing />
          </Route>

          {/* ESA LIFE CEO 61x21 - Registry-driven routes 
              All production routes are defined in client/src/config/routes.ts
              Debug routes (from pages/_debug/) only loaded in development mode
              See docs/build-coordination/route-protection-sprint.md for details */}
          {allRoutes.map((routeConfig: RouteConfig) => {
            const Component = routeConfig.component;
            return (
              <Route key={routeConfig.path} path={routeConfig.path}>
                <Suspense fallback={<LoadingFallback message={routeConfig.loadingMessage} />}>
                  <Component />
                </Suspense>
              </Route>
            );
          })}

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
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LoadingFallback message="Loading translations..." />}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <CsrfProvider>
                <TenantProvider>
                  <LocationBiasProvider>
                    <OpenReplayProvider>
                      <MonitoringProvider>
                        <TrialBanner />
                        <SessionRecordingNotice />
                        <Router />
                        <Toaster />
                      </MonitoringProvider>
                    </OpenReplayProvider>
                  </LocationBiasProvider>
                </TenantProvider>
              </CsrfProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Suspense>
    </I18nextProvider>
  );
}