/**
 * Screenshot Capture Utility
 * Phase 0: Test Infrastructure - Oct 27, 2025
 */

import { Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

export class ScreenshotCapture {
  private page: Page;
  private sessionId: number;
  private screenshotDir: string;

  constructor(page: Page, sessionId: number) {
    this.page = page;
    this.sessionId = sessionId;
    this.screenshotDir = path.join(process.cwd(), 'tests', 'evidence', `session-${sessionId}`);
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.screenshotDir, { recursive: true });
  }

  async captureAccess(feature: string): Promise<string> {
    const filename = `${feature}-access.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log('[Screenshot] Captured access:', filepath);
    return filepath;
  }

  async captureAction(feature: string): Promise<string> {
    const filename = `${feature}-action.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath });
    console.log('[Screenshot] Captured action:', filepath);
    return filepath;
  }

  async captureResult(feature: string): Promise<string> {
    const filename = `${feature}-result.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath });
    console.log('[Screenshot] Captured result:', filepath);
    return filepath;
  }

  async captureError(feature: string): Promise<string> {
    const filename = `${feature}-error.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath });
    console.log('[Screenshot] Captured error:', filepath);
    return filepath;
  }

  async captureConsole(feature: string): Promise<string> {
    const filename = `${feature}-console.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath });
    console.log('[Screenshot] Captured console:', filepath);
    return filepath;
  }

  async captureCustom(name: string): Promise<string> {
    const filename = `${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath });
    console.log('[Screenshot] Captured custom:', filepath);
    return filepath;
  }
}

export async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return errors;
}
