// TRACK 5: Axe Audit Service - Accessibility Testing (WCAG 2.1 AA)
import { chromium, Browser } from 'playwright';
import type { AxeResults } from 'axe-core';
import type { InsertAuditResult } from '@shared/schema';

export class AxeAuditService {
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

    try {
      await this.initialize();
      if (!this.browser) throw new Error('Browser not initialized');

      const context = await this.browser.newContext();
      const page = await context.newPage();
      
      const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5000';
      const url = `${baseUrl}${pageRoute}`;

      console.log(`[AxeAudit] Testing accessibility for ${pageAgent}: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Inject axe-core
      await page.addScriptTag({
        url: 'https://cdn.jsdelivr.net/npm/axe-core@4.8.2/axe.min.js',
      });

      // Run axe accessibility tests
      const results: AxeResults = await page.evaluate(() => {
        return new Promise((resolve) => {
          (window as any).axe.run().then((results: AxeResults) => {
            resolve(results);
          });
        });
      });

      await context.close();

      const passed = results.passes.length;
      const failed = results.violations.length;
      const warnings = results.incomplete.length;
      
      // Calculate score (0-100)
      const totalTests = passed + failed + warnings;
      const score = totalTests > 0 ? (passed / totalTests) * 100 : 0;

      // Map violations to findings
      const findings = [
        ...results.violations.map(v => ({
          type: 'violation',
          severity: this.mapSeverity(v.impact),
          message: `${v.help} (${v.nodes.length} instances)`,
          element: v.nodes[0]?.html || '',
          location: v.helpUrl,
        })),
        ...results.incomplete.map(i => ({
          type: 'incomplete',
          severity: 'medium' as const,
          message: `${i.help} (needs manual review)`,
          element: i.nodes[0]?.html || '',
          location: i.helpUrl,
        })),
      ];

      const recommendations = this.generateRecommendations(results);
      const severity = this.calculateOverallSeverity(results);

      return {
        pageAgent,
        pageRoute,
        auditType: 'accessibility',
        toolName: 'axe',
        score,
        passed,
        failed,
        warnings,
        findings,
        recommendations,
        severity,
        runDuration: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`[AxeAudit] Error auditing ${pageAgent}:`, error);
      
      return {
        pageAgent,
        pageRoute,
        auditType: 'accessibility',
        toolName: 'axe',
        score: 0,
        passed: 0,
        failed: 1,
        warnings: 0,
        findings: [{
          type: 'error',
          severity: 'critical',
          message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        recommendations: ['Fix critical errors before running accessibility audit'],
        severity: 'critical',
        runDuration: Date.now() - startTime,
      };
    }
  }

  private mapSeverity(impact?: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (impact) {
      case 'critical': return 'critical';
      case 'serious': return 'high';
      case 'moderate': return 'medium';
      case 'minor': return 'low';
      default: return 'medium';
    }
  }

  private calculateOverallSeverity(results: AxeResults): 'critical' | 'high' | 'medium' | 'low' {
    const hasCritical = results.violations.some(v => v.impact === 'critical');
    const hasSerious = results.violations.some(v => v.impact === 'serious');
    const hasModerate = results.violations.some(v => v.impact === 'moderate');

    if (hasCritical) return 'critical';
    if (hasSerious) return 'high';
    if (hasModerate) return 'medium';
    return 'low';
  }

  private generateRecommendations(results: AxeResults): string[] {
    const recommendations: string[] = [];

    // Group violations by impact
    const criticalCount = results.violations.filter(v => v.impact === 'critical').length;
    const seriousCount = results.violations.filter(v => v.impact === 'serious').length;

    if (criticalCount > 0) {
      recommendations.push(`Fix ${criticalCount} critical accessibility issues immediately`);
    }

    if (seriousCount > 0) {
      recommendations.push(`Address ${seriousCount} serious WCAG violations`);
    }

    // Specific recommendations
    const commonIssues = new Map<string, number>();
    results.violations.forEach(v => {
      commonIssues.set(v.id, (commonIssues.get(v.id) || 0) + v.nodes.length);
    });

    // Top 3 issues
    const topIssues = Array.from(commonIssues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topIssues.forEach(([issue]) => {
      if (issue.includes('color-contrast')) {
        recommendations.push('Improve color contrast for better readability');
      }
      if (issue.includes('label')) {
        recommendations.push('Add proper labels to form elements');
      }
      if (issue.includes('alt')) {
        recommendations.push('Add alt text to all images');
      }
      if (issue.includes('heading')) {
        recommendations.push('Fix heading hierarchy (h1→h2→h3)');
      }
      if (issue.includes('aria')) {
        recommendations.push('Review and fix ARIA attributes');
      }
    });

    if (results.incomplete.length > 0) {
      recommendations.push(`Manually review ${results.incomplete.length} items that require human judgment`);
    }

    return recommendations.length > 0 ? recommendations : ['Page passed all automated accessibility tests'];
  }
}

export const axeAuditService = new AxeAuditService();
