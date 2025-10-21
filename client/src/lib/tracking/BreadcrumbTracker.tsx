/**
 * Frontend Breadcrumb Tracker
 * MB.MD Option A - Recursive Testing System
 * 
 * Tracks all user interactions globally and sends to backend
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface BreadcrumbEvent {
  actionType: 'click' | 'hover' | 'scroll' | 'navigate' | 'form_submit';
  targetElement?: string;
  targetUrl?: string;
  currentPage: string;
  elementText?: string;
  metadata?: Record<string, any>;
}

class BreadcrumbTrackerService {
  private sessionId: string;
  private hoverTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initGlobalListeners();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('mt-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('mt-session-id', sessionId);
    }
    return sessionId;
  }

  private initGlobalListeners() {
    // Track clicks
    document.addEventListener('click', (e) => this.handleClick(e), true);
    
    // Track hovers (debounced)
    document.addEventListener('mouseover', (e) => this.handleHover(e), true);
    
    // Track scroll
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => this.handleScroll(), 200);
    }, { passive: true });
  }

  private handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const testId = target.getAttribute('data-testid') || 
                   target.closest('[data-testid]')?.getAttribute('data-testid');
    
    const href = target.getAttribute('href') || 
                 (target as HTMLAnchorElement).href ||
                 target.closest('a')?.getAttribute('href');

    this.track({
      actionType: 'click',
      targetElement: testId || target.tagName.toLowerCase(),
      targetUrl: href || undefined,
      currentPage: window.location.pathname,
      elementText: target.textContent?.substring(0, 100) || undefined,
      metadata: {
        tag: target.tagName,
        classes: target.className,
      },
    });
  }

  private handleHover(e: MouseEvent) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    // Only track hovers that last >500ms (intent signal)
    this.hoverTimeout = setTimeout(() => {
      const target = e.target as HTMLElement;
      const testId = target.getAttribute('data-testid') || 
                     target.closest('[data-testid]')?.getAttribute('data-testid');

      // Only track interactive elements
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || testId) {
        this.track({
          actionType: 'hover',
          targetElement: testId || target.tagName.toLowerCase(),
          currentPage: window.location.pathname,
          elementText: target.textContent?.substring(0, 100) || undefined,
        });
      }
    }, 500);
  }

  private handleScroll() {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    this.track({
      actionType: 'scroll',
      currentPage: window.location.pathname,
      metadata: {
        scrollPercent: Math.round(scrollPercent),
        scrollY: window.scrollY,
      },
    });
  }

  public trackNavigation(from: string, to: string) {
    this.track({
      actionType: 'navigate',
      targetUrl: to,
      currentPage: from,
      metadata: {
        from,
        to,
      },
    });
  }

  private async track(event: BreadcrumbEvent) {
    try {
      await fetch('/api/breadcrumbs/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...event,
          sessionId: this.sessionId,
        }),
      });
    } catch (error) {
      // Silent fail - don't break user experience
      console.debug('[Breadcrumb] Track failed:', error);
    }
  }
}

// Singleton instance
let trackerInstance: BreadcrumbTrackerService | null = null;

export function useBreadcrumbTracker() {
  const [location] = useLocation();
  const previousLocation = useRef(location);

  useEffect(() => {
    // Initialize tracker once
    if (!trackerInstance) {
      trackerInstance = new BreadcrumbTrackerService();
    }

    // Track navigation
    if (previousLocation.current !== location) {
      trackerInstance.trackNavigation(previousLocation.current, location);
      previousLocation.current = location;
    }
  }, [location]);

  return trackerInstance;
}

// Export for manual tracking
export const breadcrumbTracker = {
  track: (event: BreadcrumbEvent) => {
    if (!trackerInstance) {
      trackerInstance = new BreadcrumbTrackerService();
    }
    return trackerInstance;
  }
};
