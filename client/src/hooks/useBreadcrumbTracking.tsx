import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';

// Breadcrumb Tracking Hook
// MB.MD Phase 3E - Oct 21, 2025
// Tracks user actions: page navigation, clicks, form inputs for context

interface BreadcrumbData {
  userId?: number;
  sessionId: string;
  page: string;
  pageTitle: string;
  referrer: string;
  action: string;
  target?: string;
  targetId?: string;
  value?: any;
  userJourney?: string;
  userRole?: string;
  success?: boolean;
  errorMessage?: string;
}

export function useBreadcrumbTracking() {
  const [location] = useLocation();
  const { user } = useAuth();
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const lastPageRef = useRef<string>('');

  // Get or create session ID
  function getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('breadcrumb_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('breadcrumb_session_id', sessionId);
    }
    return sessionId;
  }

  // Track breadcrumb to backend
  async function trackBreadcrumb(data: Partial<BreadcrumbData>) {
    try {
      const breadcrumb: BreadcrumbData = {
        userId: user?.id,
        sessionId: sessionIdRef.current,
        page: location,
        pageTitle: document.title,
        referrer: lastPageRef.current || document.referrer,
        action: 'view',
        userJourney: user?.customerJourneyState,
        userRole: user?.subscriptionTier,
        success: true,
        ...data,
      };

      await apiRequest('/api/breadcrumbs', {
        method: 'POST',
        body: JSON.stringify(breadcrumb),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Breadcrumb] Tracking error:', error);
    }
  }

  // Track page navigation
  useEffect(() => {
    trackBreadcrumb({
      action: 'navigation',
      target: location,
    });

    lastPageRef.current = location;
  }, [location, user?.id]);

  // Track clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const targetId = target.getAttribute('data-testid') || target.id;
      const targetText = target.textContent?.substring(0, 100);

      trackBreadcrumb({
        action: 'click',
        target: target.tagName,
        targetId,
        value: { text: targetText },
      });
    }

    // Track all clicks
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [user?.id]);

  // Track form inputs (debounced)
  useEffect(() => {
    let inputTimeout: NodeJS.Timeout;

    function handleInput(e: Event) {
      const target = e.target as HTMLInputElement;
      const targetId = target.getAttribute('data-testid') || target.id || target.name;

      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        trackBreadcrumb({
          action: 'input',
          target: target.tagName,
          targetId,
          value: { type: target.type, hasValue: !!target.value },
        });
      }, 1000); // Debounce 1 second
    }

    // Track inputs and textareas
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('input', handleInput);
      clearTimeout(inputTimeout);
    };
  }, [user?.id]);

  // Track form submissions
  useEffect(() => {
    function handleSubmit(e: Event) {
      const form = e.target as HTMLFormElement;
      const formId = form.getAttribute('data-testid') || form.id || form.name;

      trackBreadcrumb({
        action: 'submit',
        target: 'FORM',
        targetId: formId,
        success: true,
      });
    }

    document.addEventListener('submit', handleSubmit);

    return () => {
      document.removeEventListener('submit', handleSubmit);
    };
  }, [user?.id]);

  // Track errors (API failures, 404s)
  useEffect(() => {
    function handleError(e: ErrorEvent) {
      trackBreadcrumb({
        action: 'error',
        target: 'GLOBAL',
        success: false,
        errorMessage: e.message,
        value: { filename: e.filename, lineno: e.lineno },
      });
    }

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [user?.id]);

  return {
    trackBreadcrumb,
    sessionId: sessionIdRef.current,
  };
}
