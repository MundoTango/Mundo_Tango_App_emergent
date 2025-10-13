// TRACK 5: Playwright Audit Service - UI & Functional Testing
import { chromium, Browser, Page } from 'playwright';
import type { InsertAuditResult } from '@shared/schema';

interface AuditFinding {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  element?: string;
  location?: string;
}

export class PlaywrightAuditService {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async auditPage(pageRoute: string, pageAgent: string): Promise<Partial<InsertAuditResult>> {
    const startTime = Date.now();
    const findings: AuditFinding[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    try {
      await this.initialize();
      if (!this.browser) throw new Error('Browser not initialized');

      const page = await this.browser.newPage();
      const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5000';
      const url = `${baseUrl}${pageRoute}`;

      console.log(`[PlaywrightAudit] Testing ${pageAgent}: ${url}`);

      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Test 1: Page loads successfully
      const title = await page.title();
      if (title) {
        findings.push({
          type: 'page_load',
          severity: 'low',
          message: `Page loads successfully with title: "${title}"`,
        });
        passed++;
      } else {
        findings.push({
          type: 'page_load',
          severity: 'critical',
          message: 'Page failed to load or has no title',
        });
        failed++;
      }

      // Test 2: Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      if (consoleErrors.length > 0) {
        findings.push({
          type: 'console_errors',
          severity: 'high',
          message: `Found ${consoleErrors.length} console errors`,
          location: consoleErrors.slice(0, 3).join('; '),
        });
        failed++;
      } else {
        findings.push({
          type: 'console_errors',
          severity: 'low',
          message: 'No console errors detected',
        });
        passed++;
      }

      // Test 3: Check for broken images
      const images = await page.$$('img');
      let brokenImages = 0;
      for (const img of images) {
        const src = await img.getAttribute('src');
        const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
        if (src && naturalWidth === 0) {
          brokenImages++;
        }
      }

      if (brokenImages > 0) {
        findings.push({
          type: 'broken_images',
          severity: 'medium',
          message: `Found ${brokenImages} broken images`,
        });
        warnings++;
      } else {
        findings.push({
          type: 'broken_images',
          severity: 'low',
          message: 'All images load correctly',
        });
        passed++;
      }

      // Test 4: Check for interactive elements with testid
      const interactiveElements = await page.$$('[data-testid]');
      if (interactiveElements.length > 0) {
        findings.push({
          type: 'test_coverage',
          severity: 'low',
          message: `Found ${interactiveElements.length} testable elements`,
        });
        passed++;
      } else {
        findings.push({
          type: 'test_coverage',
          severity: 'medium',
          message: 'No data-testid attributes found - testing coverage may be limited',
        });
        warnings++;
      }

      // Test 5: Check page responsiveness
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
          findings.push({
            type: 'responsiveness',
            severity: 'medium',
            message: `Horizontal scroll detected on ${viewport.name}`,
            location: `${viewport.width}x${viewport.height}`,
          });
          warnings++;
        }
      }

      // Test 6: Check navigation
      const links = await page.$$('a[href]');
      findings.push({
        type: 'navigation',
        severity: 'low',
        message: `Found ${links.length} navigation links`,
      });
      passed++;

      await page.close();

      const runDuration = Date.now() - startTime;
      const score = (passed / (passed + failed + warnings)) * 100;

      return {
        pageAgent,
        pageRoute,
        auditType: 'functional',
        toolName: 'playwright',
        score,
        passed,
        failed,
        warnings,
        findings,
        recommendations: this.generateRecommendations(findings),
        severity: this.calculateSeverity(findings),
        runDuration,
      };
    } catch (error) {
      console.error(`[PlaywrightAudit] Error auditing ${pageAgent}:`, error);
      
      return {
        pageAgent,
        pageRoute,
        auditType: 'functional',
        toolName: 'playwright',
        score: 0,
        passed: 0,
        failed: 1,
        warnings: 0,
        findings: [{
          type: 'error',
          severity: 'critical',
          message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        recommendations: ['Fix critical errors before running audit again'],
        severity: 'critical',
        runDuration: Date.now() - startTime,
      };
    }
  }

  private generateRecommendations(findings: AuditFinding[]): string[] {
    const recommendations: string[] = [];

    findings.forEach(finding => {
      if (finding.severity === 'critical' || finding.severity === 'high') {
        if (finding.type === 'console_errors') {
          recommendations.push('Fix console errors - they may impact user experience');
        }
        if (finding.type === 'page_load') {
          recommendations.push('Ensure page loads correctly with proper title tag');
        }
      }
      
      if (finding.type === 'broken_images') {
        recommendations.push('Fix broken images - verify image URLs and availability');
      }
      
      if (finding.type === 'test_coverage') {
        recommendations.push('Add data-testid attributes to interactive elements for better testing');
      }
      
      if (finding.type === 'responsiveness') {
        recommendations.push('Fix horizontal scroll issues for better mobile experience');
      }
    });

    return [...new Set(recommendations)];
  }

  private calculateSeverity(findings: AuditFinding[]): 'critical' | 'high' | 'medium' | 'low' {
    const hasCritical = findings.some(f => f.severity === 'critical');
    const hasHigh = findings.some(f => f.severity === 'high');
    const hasMedium = findings.some(f => f.severity === 'medium');

    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  }
}

export const playwrightAuditService = new PlaywrightAuditService();
