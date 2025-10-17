/**
 * Stub for @openreplay/tracker - Provides minimal OpenReplay tracking stubs
 * This stub allows the app to run without the actual @openreplay/tracker package
 */

export interface TrackerOptions {
  projectKey: string;
  ingestPoint?: string;
  revID?: string;
  resourceBaseHref?: string;
  capturePerformance?: boolean;
  [key: string]: any;
}

export default class Tracker {
  constructor(options: TrackerOptions) {
    console.warn('OpenReplay Tracker is not installed - tracking is stubbed');
  }

  start(): Promise<void> {
    return Promise.resolve();
  }

  stop(): void {}

  setUserID(userID: string): void {}

  setMetadata(key: string, value: string): void {}

  event(name: string, payload?: any): void {}

  issue(message: string): void {}
}
