/**
 * TRACK 3: Page State Monitoring & Component Health
 * Agent #81 - Page Intelligence
 * 
 * Tracks real-time page state, component health, user behavior
 */

interface ComponentHealth {
  componentName: string;
  status: 'loaded' | 'loading' | 'error' | 'slow';
  loadTime?: number;
  errorMessage?: string;
  timestamp: Date;
}

interface PageState {
  url: string;
  title: string;
  components: ComponentHealth[];
  performance: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  };
  userActivity: {
    clicks: number;
    scrollDepth: number;
    timeOnPage: number;
    stuckPoints: Array<{ selector: string; attempts: number }>;
  };
  apiCalls: Array<{
    endpoint: string;
    method: string;
    status: number;
    duration: number;
    timestamp: Date;
  }>;
  errors: Array<{
    message: string;
    stack?: string;
    timestamp: Date;
  }>;
}

export class PageStateMonitor {
  private pageStates: Map<string, PageState> = new Map();
  private readonly MAX_STATES = 100; // Keep last 100 page states

  /**
   * Record page state snapshot
   */
  recordPageState(url: string, state: Partial<PageState>) {
    const existing = this.pageStates.get(url) || {
      url,
      title: '',
      components: [],
      performance: {},
      userActivity: {
        clicks: 0,
        scrollDepth: 0,
        timeOnPage: 0,
        stuckPoints: []
      },
      apiCalls: [],
      errors: []
    };

    const updated: PageState = {
      ...existing,
      ...state,
      components: state.components || existing.components,
      performance: { ...existing.performance, ...state.performance },
      userActivity: { ...existing.userActivity, ...state.userActivity },
      apiCalls: [...existing.apiCalls, ...(state.apiCalls || [])],
      errors: [...existing.errors, ...(state.errors || [])]
    };

    if (url) {
      this.pageStates.set(url, updated);
    }

    // Maintain max size
    if (this.pageStates.size > this.MAX_STATES) {
      const firstKey = this.pageStates.keys().next().value;
      if (firstKey) {
        this.pageStates.delete(firstKey);
      }
    }

    console.log(`📊 [PageMonitor] State recorded for ${url}:`, {
      components: updated.components.length,
      apiCalls: updated.apiCalls.length,
      errors: updated.errors.length
    });
  }

  /**
   * Record component health
   */
  recordComponentHealth(url: string, component: ComponentHealth) {
    const state = this.pageStates.get(url);
    if (!state) {
      this.recordPageState(url, { components: [component] });
      return;
    }

    // Update or add component
    const existingIndex = state.components.findIndex(c => c.componentName === component.componentName);
    if (existingIndex >= 0) {
      state.components[existingIndex] = component;
    } else {
      state.components.push(component);
    }

    this.pageStates.set(url, state);

    // Alert if component is slow or errored
    if (component.status === 'error') {
      console.error(`❌ [PageMonitor] Component error on ${url}: ${component.componentName} - ${component.errorMessage}`);
    } else if (component.status === 'slow' && component.loadTime) {
      console.warn(`⚠️ [PageMonitor] Slow component on ${url}: ${component.componentName} (${component.loadTime}ms)`);
    }
  }

  /**
   * Record API call
   */
  recordAPICall(url: string, call: PageState['apiCalls'][0]) {
    const state = this.pageStates.get(url);
    if (!state) {
      this.recordPageState(url, { apiCalls: [call] });
      return;
    }

    state.apiCalls.push(call);
    this.pageStates.set(url, state);

    // Alert on API errors
    if (call.status >= 400) {
      console.error(`❌ [PageMonitor] API error on ${url}: ${call.method} ${call.endpoint} - ${call.status}`);
    }
  }

  /**
   * Record page error
   */
  recordPageError(url: string, error: PageState['errors'][0]) {
    const state = this.pageStates.get(url);
    if (!state) {
      this.recordPageState(url, { errors: [error] });
      return;
    }

    state.errors.push(error);
    this.pageStates.set(url, state);

    console.error(`❌ [PageMonitor] Page error on ${url}:`, error.message);
  }

  /**
   * Get page health summary
   */
  getPageHealth(url: string): {
    status: 'healthy' | 'degraded' | 'broken';
    issues: string[];
  } {
    const state = this.pageStates.get(url);
    if (!state) {
      return { status: 'healthy', issues: [] };
    }

    const issues: string[] = [];

    // Check components
    const errorComponents = state.components.filter(c => c.status === 'error');
    const slowComponents = state.components.filter(c => c.status === 'slow');

    if (errorComponents.length > 0) {
      issues.push(`${errorComponents.length} components failed to load`);
    }
    if (slowComponents.length > 0) {
      issues.push(`${slowComponents.length} components loading slowly`);
    }

    // Check API calls
    const failedAPICalls = state.apiCalls.filter(c => c.status >= 400);
    if (failedAPICalls.length > 0) {
      issues.push(`${failedAPICalls.length} API calls failed`);
    }

    // Check performance
    if (state.performance.lcp && state.performance.lcp > 2500) {
      issues.push(`Slow page load (LCP: ${state.performance.lcp}ms)`);
    }

    // Check errors
    if (state.errors.length > 0) {
      issues.push(`${state.errors.length} JavaScript errors`);
    }

    // Determine status
    let status: 'healthy' | 'degraded' | 'broken' = 'healthy';
    if (errorComponents.length > 0 || state.errors.length > 0) {
      status = 'broken';
    } else if (issues.length > 0) {
      status = 'degraded';
    }

    return { status, issues };
  }

  /**
   * Get all page states
   */
  getAllPageStates(): PageState[] {
    return Array.from(this.pageStates.values());
  }

  /**
   * Get pages with issues
   */
  getPagesWithIssues(): Array<{ url: string; status: string; issues: string[] }> {
    return Array.from(this.pageStates.values())
      .map(state => ({
        url: state.url,
        ...this.getPageHealth(state.url)
      }))
      .filter(page => page.status !== 'healthy');
  }
}

export const pageStateMonitor = new PageStateMonitor();
