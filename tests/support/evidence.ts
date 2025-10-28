/**
 * Evidence Collection System
 * MB.MD Testing Infrastructure - October 28, 2025
 * 
 * Provides utilities for comprehensive evidence collection:
 * - Screenshots (auto-captured at each step)
 * - Videos (streaming behavior proof)
 * - Playwright traces (click-to-replay)
 * - Console logs (error tracking)
 * - Evidence manifests (JSON summaries)
 */

import { Page, TestInfo } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface EvidenceManifest {
  project: string;
  role: 'super-admin' | 'regular-user';
  testName: string;
  timestamp: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  screenshots: string[];
  videos: string[];
  traces: string[];
  consoleLogs: string[];
  featureFlags: Record<string, boolean>;
  errors?: string[];
}

/**
 * Evidence Collector - Captures all test artifacts
 */
export class EvidenceCollector {
  private manifest: EvidenceManifest;
  private page: Page;
  private testInfo: TestInfo;
  private consoleLogs: string[] = [];
  
  constructor(page: Page, testInfo: TestInfo, role: 'super-admin' | 'regular-user' = 'super-admin') {
    this.page = page;
    this.testInfo = testInfo;
    
    this.manifest = {
      project: testInfo.project.name,
      role,
      testName: testInfo.title,
      timestamp: new Date().toISOString(),
      duration: 0,
      status: 'passed',
      screenshots: [],
      videos: [],
      traces: [],
      consoleLogs: [],
      featureFlags: {},
    };
    
    // Capture console logs
    this.setupConsoleCapture();
  }
  
  private setupConsoleCapture() {
    this.page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      this.consoleLogs.push(text);
      this.manifest.consoleLogs.push(text);
    });
    
    this.page.on('pageerror', error => {
      const text = `[ERROR] ${error.message}`;
      this.consoleLogs.push(text);
      this.manifest.consoleLogs.push(text);
      if (!this.manifest.errors) this.manifest.errors = [];
      this.manifest.errors.push(error.message);
    });
  }
  
  /**
   * Capture screenshot at specific test milestone
   */
  async captureScreenshot(name: string, fullPage: boolean = true): Promise<string> {
    const screenshotPath = join(
      'test-results',
      'screenshots',
      this.manifest.project,
      this.manifest.role,
      `${this.manifest.testName}-${name}.png`
    );
    
    // Ensure directory exists
    const dir = join('test-results', 'screenshots', this.manifest.project, this.manifest.role);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage,
    });
    
    // Attach to test report
    await this.testInfo.attach(name, {
      path: screenshotPath,
      contentType: 'image/png',
    });
    
    this.manifest.screenshots.push(screenshotPath);
    return screenshotPath;
  }
  
  /**
   * Capture screenshot in both light and dark mode
   */
  async captureDualThemeScreenshot(name: string): Promise<void> {
    // Light mode
    await this.page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    await this.captureScreenshot(`${name}-light`);
    
    // Dark mode
    await this.page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await this.captureScreenshot(`${name}-dark`);
    
    // Restore original theme
    await this.page.evaluate(() => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }
  
  /**
   * Set feature flags for this test
   */
  setFeatureFlags(flags: Record<string, boolean>) {
    this.manifest.featureFlags = { ...this.manifest.featureFlags, ...flags };
  }
  
  /**
   * Mark test status
   */
  setStatus(status: 'passed' | 'failed' | 'skipped', duration: number) {
    this.manifest.status = status;
    this.manifest.duration = duration;
  }
  
  /**
   * Save evidence manifest to JSON
   */
  async saveManifest(): Promise<string> {
    const manifestPath = join(
      'test-results',
      'evidence-manifests',
      this.manifest.project,
      `${this.manifest.testName}-${Date.now()}.json`
    );
    
    const dir = join('test-results', 'evidence-manifests', this.manifest.project);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(manifestPath, JSON.stringify(this.manifest, null, 2));
    
    // Attach to test report
    await this.testInfo.attach('evidence-manifest', {
      path: manifestPath,
      contentType: 'application/json',
    });
    
    return manifestPath;
  }
  
  /**
   * Get console logs
   */
  getConsoleLogs(): string[] {
    return this.consoleLogs;
  }
  
  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return (this.manifest.errors?.length ?? 0) > 0;
  }
}

/**
 * Wait for streaming to complete (WebSocket or SSE)
 */
export async function waitForStreaming(page: Page, timeout: number = 30000): Promise<void> {
  // Wait for WebSocket connection
  await page.waitForFunction(
    () => (window as any).socketConnected === true,
    { timeout }
  ).catch(() => {
    console.warn('WebSocket connection timeout');
  });
  
  // Wait for SSE to establish
  await page.waitForTimeout(1000);
}

/**
 * Capture streaming behavior as video
 */
export async function captureStreamingVideo(
  page: Page, 
  testInfo: TestInfo,
  action: () => Promise<void>,
  name: string
): Promise<string> {
  // Video is auto-captured by Playwright config
  await action();
  
  // Video path will be available after test completes
  const videoPath = await page.video()?.path();
  
  if (videoPath) {
    await testInfo.attach(name, {
      path: videoPath,
      contentType: 'video/webm',
    });
  }
  
  return videoPath || '';
}

/**
 * Wait for MB.MD session to complete
 */
export async function waitForMBMDSession(page: Page, sessionId: number, timeout: number = 200000): Promise<void> {
  // Poll session status
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const response = await page.request.get(`/api/mbmd/session/${sessionId}/status`);
    const data = await response.json();
    
    if (data.status === 'complete' || data.status === 'failed') {
      return;
    }
    
    await page.waitForTimeout(2000); // Poll every 2 seconds
  }
  
  throw new Error(`MB.MD session ${sessionId} did not complete within ${timeout}ms`);
}

/**
 * Validate no console errors present
 */
export async function assertNoConsoleErrors(evidence: EvidenceCollector): Promise<void> {
  const logs = evidence.getConsoleLogs();
  const errors = logs.filter(log => log.includes('[error]') || log.includes('[ERROR]'));
  
  if (errors.length > 0) {
    throw new Error(`Console errors detected:\n${errors.join('\n')}`);
  }
}
