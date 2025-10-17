/**
 * Stub for posthog-js - Provides minimal PostHog analytics stubs
 * This stub allows the app to run without the actual posthog-js package
 */

export interface PostHogConfig {
  api_host?: string;
  autocapture?: boolean;
  capture_pageview?: boolean;
  disable_session_recording?: boolean;
  [key: string]: any;
}

class PostHogStub {
  init(token: string, config?: PostHogConfig): void {
    console.warn('PostHog is not installed - analytics tracking is stubbed');
  }

  capture(event: string, properties?: Record<string, any>): void {}

  identify(distinctId: string, properties?: Record<string, any>): void {}

  reset(): void {}

  opt_in_capturing(): void {}

  opt_out_capturing(): void {}

  has_opted_in_capturing(): boolean {
    return false;
  }

  has_opted_out_capturing(): boolean {
    return true;
  }

  isFeatureEnabled(key: string): boolean {
    return false;
  }

  onFeatureFlags(callback: (flags: string[]) => void): void {}

  getFeatureFlag(key: string): string | boolean | undefined {
    return undefined;
  }
}

const posthog = new PostHogStub();

export default posthog;
