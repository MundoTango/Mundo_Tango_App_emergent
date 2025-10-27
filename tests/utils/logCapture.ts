/**
 * Log Capture Utility
 * Phase 0: Test Infrastructure - Oct 27, 2025
 */

import { Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

export class LogCapture {
  private sessionId: number;
  private logDir: string;
  private browserLogs: string[] = [];
  private serverLogs: string[] = [];

  constructor(sessionId: number) {
    this.sessionId = sessionId;
    this.logDir = path.join(process.cwd(), 'tests', 'evidence', `session-${sessionId}`, 'logs');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.logDir, { recursive: true });
  }

  async captureBrowserLogs(page: Page): Promise<string> {
    this.browserLogs = [];

    page.on('console', msg => {
      const log = `[${msg.type()}] ${msg.text()}`;
      this.browserLogs.push(log);
    });

    page.on('pageerror', error => {
      this.browserLogs.push(`[ERROR] ${error.message}`);
    });

    // Wait a bit to collect logs
    await new Promise(resolve => setTimeout(resolve, 1000));

    const filepath = path.join(this.logDir, 'browser-console.log');
    const content = this.browserLogs.join('\n');
    await fs.writeFile(filepath, content);

    console.log('[LogCapture] Browser logs saved:', filepath);
    return filepath;
  }

  async captureServerLogs(): Promise<string> {
    // In a real implementation, this would fetch from workflow logs
    // For now, we'll create a placeholder
    const filepath = path.join(this.logDir, 'server.log');
    await fs.writeFile(filepath, 'Server logs would be captured here');
    
    console.log('[LogCapture] Server logs saved:', filepath);
    return filepath;
  }

  getBrowserLogs(): string {
    return this.browserLogs.join('\n');
  }

  hasBrowserErrors(): boolean {
    return this.browserLogs.some(log => 
      log.includes('[error]') || 
      log.includes('[ERROR]') || 
      log.includes('Error:')
    );
  }

  async saveTestResults(results: any): Promise<string> {
    const filepath = path.join(this.logDir, 'test-results.json');
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    
    console.log('[LogCapture] Test results saved:', filepath);
    return filepath;
  }
}
