/**
 * ESA Life CEO 61x21 - Monitoring Hook
 * React hook for accessing monitoring services
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { monitoring } from '@/services/monitoring';

export interface UseMonitoringReturn {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (path?: string) => void;
  trackAgentInteraction: (agentName: string, action: string, metadata?: Record<string, any>) => void;
  getFeatureFlag: (flagName: string) => boolean | string | undefined;
  captureException: (error: Error, context?: Record<string, any>) => void;
}

export function useMonitoring(): UseMonitoringReturn {
  const { user } = useAuth();

  // Identify user when auth changes
  useEffect(() => {
    if (user?.id) {
      monitoring.identifyUser(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.subscription?.plan,
        createdAt: user.createdAt
      });
    }
  }, [user]);

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = () => {
      monitoring.trackPageView(window.location.pathname);
    };

    // Track initial page view
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    monitoring.trackEvent(eventName, properties);
  }, []);

  const trackPageView = useCallback((path?: string) => {
    monitoring.trackPageView(path || window.location.pathname);
  }, []);

  const trackAgentInteraction = useCallback((agentName: string, action: string, metadata?: Record<string, any>) => {
    monitoring.trackAgentInteraction(agentName, action, metadata);
  }, []);

  const getFeatureFlag = useCallback((flagName: string): boolean | string | undefined => {
    return monitoring.getFeatureFlag(flagName);
  }, []);

  const captureException = useCallback((error: Error, context?: Record<string, any>) => {
    monitoring.captureException(error, context);
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackAgentInteraction,
    getFeatureFlag,
    captureException
  };
}