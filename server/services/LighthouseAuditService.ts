// TRACK 5: Lighthouse Audit Service - Performance, SEO, PWA
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import type { InsertAuditResult } from '@shared/schema';

export class LighthouseAuditService {
  async auditPage(pageRoute: string, pageAgent: string): Promise<Partial<InsertAuditResult>> {
    const startTime = Date.now();
    let chrome;

    try {
      const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5000';
      const url = `${baseUrl}${pageRoute}`;

      console.log(`[LighthouseAudit] Testing ${pageAgent}: ${url}`);

      // Launch Chrome
      chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Run Lighthouse
      const options = {
        logLevel: 'error' as const,
        output: 'json' as const,
        port: chrome.port,
      };

      const runnerResult = await lighthouse(url, options);
      if (!runnerResult) throw new Error('Lighthouse audit failed');

      const { lhr } = runnerResult;

      // Extract scores (0-100)
      const performanceScore = (lhr.categories.performance?.score || 0) * 100;
      const accessibilityScore = (lhr.categories.accessibility?.score || 0) * 100;
      const bestPracticesScore = (lhr.categories['best-practices']?.score || 0) * 100;
      const seoScore = (lhr.categories.seo?.score || 0) * 100;
      const pwaScore = (lhr.categories.pwa?.score || 0) * 100;

      // Average score
      const averageScore = (performanceScore + accessibilityScore + bestPracticesScore + seoScore + pwaScore) / 5;

      // Extract findings
      const findings = [];
      let passed = 0;
      let failed = 0;
      let warnings = 0;

      // Performance metrics
      const metrics = lhr.audits['metrics']?.details as any;
      if (metrics?.items?.[0]) {
        const item = metrics.items[0];
        findings.push({
          type: 'performance_metrics',
          severity: 'low' as const,
          message: `FCP: ${item.firstContentfulPaint}ms, LCP: ${item.largestContentfulPaint}ms, TBT: ${item.totalBlockingTime}ms`,
        });
      }

      // Failed audits
      Object.entries(lhr.audits).forEach(([key, audit]: [string, any]) => {
        if (audit.score !== null && audit.score < 0.9) {
          failed++;
          findings.push({
            type: key,
            severity: audit.score < 0.5 ? 'high' as const : 'medium' as const,
            message: audit.title,
            location: audit.description,
          });
        } else if (audit.score !== null) {
          passed++;
        }
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations(lhr);
      const severity = this.calculateSeverity(averageScore);

      await chrome.kill();

      return {
        pageAgent,
        pageRoute,
        auditType: 'performance',
        toolName: 'lighthouse',
        score: averageScore,
        passed,
        failed,
        warnings,
        findings,
        recommendations,
        severity,
        runDuration: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`[LighthouseAudit] Error auditing ${pageAgent}:`, error);
      
      if (chrome) {
        await chrome.kill();
      }

      return {
        pageAgent,
        pageRoute,
        auditType: 'performance',
        toolName: 'lighthouse',
        score: 0,
        passed: 0,
        failed: 1,
        warnings: 0,
        findings: [{
          type: 'error',
          severity: 'critical',
          message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        recommendations: ['Fix critical errors before running performance audit'],
        severity: 'critical',
        runDuration: Date.now() - startTime,
      };
    }
  }

  private generateRecommendations(lhr: any): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (lhr.categories.performance.score < 0.9) {
      const fcp = lhr.audits['first-contentful-paint'];
      const lcp = lhr.audits['largest-contentful-paint'];
      const cls = lhr.audits['cumulative-layout-shift'];

      if (fcp?.score < 0.9) {
        recommendations.push('Optimize First Contentful Paint - reduce render-blocking resources');
      }
      if (lcp?.score < 0.9) {
        recommendations.push('Improve Largest Contentful Paint - optimize images and server response time');
      }
      if (cls?.score < 0.9) {
        recommendations.push('Fix Cumulative Layout Shift - add dimensions to images and avoid dynamic content');
      }
    }

    // SEO recommendations
    if (lhr.categories.seo.score < 0.9) {
      if (lhr.audits['meta-description']?.score < 1) {
        recommendations.push('Add meta descriptions to improve SEO');
      }
      if (lhr.audits['document-title']?.score < 1) {
        recommendations.push('Ensure page has a unique, descriptive title');
      }
    }

    // PWA recommendations
    if (lhr.categories.pwa.score < 0.9) {
      if (lhr.audits['installable-manifest']?.score < 1) {
        recommendations.push('Add web app manifest for PWA capabilities');
      }
      if (lhr.audits['service-worker']?.score < 1) {
        recommendations.push('Register a service worker for offline functionality');
      }
    }

    // Best practices
    if (lhr.categories['best-practices'].score < 0.9) {
      if (lhr.audits['errors-in-console']?.score < 1) {
        recommendations.push('Fix JavaScript console errors');
      }
      if (lhr.audits['uses-https']?.score < 1) {
        recommendations.push('Use HTTPS for all resources');
      }
    }

    return recommendations.length > 0 ? recommendations : ['Page meets all Lighthouse standards'];
  }

  private calculateSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score < 50) return 'critical';
    if (score < 70) return 'high';
    if (score < 90) return 'medium';
    return 'low';
  }
}

export const lighthouseAuditService = new LighthouseAuditService();
