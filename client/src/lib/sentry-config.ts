/**
 * ESA LIFE CEO 61x21 - Sentry Error Tracking Configuration
 * Phase 14: Monitoring & Analytics
 * 
 * Comprehensive error tracking with privacy-first approach
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Initialize Sentry error tracking
 */
export function initSentry(config?: Partial<SentryConfig>) {
  const defaultConfig: SentryConfig = {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENV || 'development',
    enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
    sampleRate: 0.1, // 10% of errors
    tracesSampleRate: 0.01, // 1% of transactions
    replaysSessionSampleRate: 0.001, // 0.1% of sessions
    replaysOnErrorSampleRate: 0.1, // 10% of sessions with errors
  };

  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.enabled || !finalConfig.dsn) {
    console.log('🔍 Sentry monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: finalConfig.dsn,
    environment: finalConfig.environment,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Navigation transactions
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
        // Set tracingOrigins to control what URLs are traced
        tracingOrigins: [
          'localhost',
          /^https:\/\/.*\.replit\.dev/,
          /^https:\/\/mundo-tango\./,
        ],
      }),
      // Session Replay
      new Sentry.Replay({
        // Mask all text content for privacy
        maskAllText: true,
        maskAllInputs: true,
        // Block certain CSS classes from replay
        blockClass: 'sentry-block',
        // Ignore certain interactions
        ignoreClass: 'sentry-ignore',
        // Privacy-first: don't record network bodies
        networkDetailAllowUrls: [],
        networkCaptureBodies: false,
        networkRequestHeaders: false,
        networkResponseHeaders: false,
      }),
    ],

    // Sample rates
    sampleRate: finalConfig.sampleRate,
    tracesSampleRate: finalConfig.tracesSampleRate,
    replaysSessionSampleRate: finalConfig.replaysSessionSampleRate,
    replaysOnErrorSampleRate: finalConfig.replaysOnErrorSampleRate,

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    
    // User privacy
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Filter out certain errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        // Ignore network errors that are expected
        if (error.message?.includes('NetworkError')) {
          return null;
        }
        // Ignore user cancellations
        if (error.message?.includes('AbortError')) {
          return null;
        }
      }

      // Add custom tags
      event.tags = {
        ...event.tags,
        layer: 'frontend',
        framework: 'esa-61x21',
        phase: '14-monitoring',
      };

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      
      // Don't log passwords or tokens
      if (breadcrumb.data?.url?.includes('password') || 
          breadcrumb.data?.url?.includes('token')) {
        delete breadcrumb.data.body;
      }

      return breadcrumb;
    },

    // Configure which errors to ignore
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // User actions
      'AbortError',
      'cancelled',
    ],
  });

  console.log('🛡️ Sentry error tracking initialized');
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: {
  id: string;
  username?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // Add custom user data
    role: user.role,
  });
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add custom context to errors
 */
export function setSentryContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context);
}

/**
 * Track custom performance transactions
 */
export function trackTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
    tags: {
      framework: 'esa-61x21',
    },
  });
}

/**
 * Capture custom errors with context
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Track user feedback
 */
export function showReportDialog(options?: {
  eventId?: string;
  title?: string;
  subtitle?: string;
  subtitle2?: string;
}) {
  const user = Sentry.getCurrentHub().getScope()?.getUser();
  
  Sentry.showReportDialog({
    ...options,
    user: user || undefined,
    title: options?.title || 'It looks like we're having issues.',
    subtitle: options?.subtitle || 'Our team has been notified.',
    subtitle2: options?.subtitle2 || 'If you'd like to help, tell us what happened below.',
  });
}

/**
 * Error boundary component for React
 */
export class SentryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      scope.setTag('component', 'error-boundary');
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      if (Fallback) {
        return <Fallback error={this.state.error} />;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We've been notified and are working on fixing this issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  initSentry,
  setSentryUser,
  clearSentryUser,
  setSentryContext,
  trackTransaction,
  captureError,
  showReportDialog,
  SentryErrorBoundary,
};