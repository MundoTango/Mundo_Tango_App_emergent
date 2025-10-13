// TRACK 2: Lighthouse Audit Service - CLI-based approach (ESM fix)
import { exec } from 'child_process';
import { promisify } from 'util';
import type { InsertAuditResult } from '@shared/schema';

const execAsync = promisify(exec);

interface LighthouseResult {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    'best-practices': { score: number };
    seo: { score: number };
    pwa: { score: number };
  };
  audits: {
    [key: string]: {
      id: string;
      title: string;
      description: string;
      score: number | null;
      displayValue?: string;
    };
  };
}

export class LighthouseAuditService {
  private baseUrl: string;

  constructor() {
    // Use environment domain for production, localhost for dev
    const domain = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : 'http://localhost:5000';
    this.baseUrl = domain;
  }

  async auditPage(pageRoute: string, pageAgent: string): Promise<InsertAuditResult> {
    const url = `${this.baseUrl}${pageRoute}`;
    console.log(`[Lighthouse] Auditing ${url} for ${pageAgent}`);

    try {
      // Run Lighthouse CLI as subprocess
      const command = `npx lighthouse ${url} --output=json --quiet --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"`;
      
      const { stdout } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 120000, // 2 minute timeout
      });

      const result: LighthouseResult = JSON.parse(stdout);

      // Calculate overall score (average of all categories)
      const scores = [
        result.categories.performance.score,
        result.categories.accessibility.score,
        result.categories['best-practices'].score,
        result.categories.seo.score,
        result.categories.pwa.score,
      ];
      const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100);

      // Extract key findings
      const findings: any[] = [];
      const issues: string[] = [];

      // Check critical performance metrics
      Object.entries(result.audits).forEach(([key, audit]) => {
        if (audit.score !== null && audit.score < 0.9) {
          findings.push({
            type: 'lighthouse',
            id: audit.id,
            impact: audit.score < 0.5 ? 'critical' : audit.score < 0.7 ? 'serious' : 'moderate',
            description: audit.title,
            help: audit.description,
            helpUrl: `https://web.dev/${audit.id}`,
          });
          issues.push(`${audit.title}: ${audit.displayValue || 'needs improvement'}`);
        }
      });

      // Determine severity based on score
      let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
      if (overallScore < 50) severity = 'critical';
      else if (overallScore < 70) severity = 'high';
      else if (overallScore < 85) severity = 'medium';

      return {
        pageAgent,
        pageRoute,
        tool: 'lighthouse',
        score: overallScore,
        passed: overallScore >= 85,
        findings: findings.slice(0, 10), // Top 10 issues
        summary: `Performance: ${Math.round(result.categories.performance.score * 100)}, Accessibility: ${Math.round(result.categories.accessibility.score * 100)}, Best Practices: ${Math.round(result.categories['best-practices'].score * 100)}, SEO: ${Math.round(result.categories.seo.score * 100)}, PWA: ${Math.round(result.categories.pwa.score * 100)}`,
        severity,
        issuesFound: issues.length,
        metadata: {
          categories: {
            performance: Math.round(result.categories.performance.score * 100),
            accessibility: Math.round(result.categories.accessibility.score * 100),
            bestPractices: Math.round(result.categories['best-practices'].score * 100),
            seo: Math.round(result.categories.seo.score * 100),
            pwa: Math.round(result.categories.pwa.score * 100),
          },
          url,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error(`[Lighthouse] Audit failed for ${pageAgent}:`, error.message);

      // Return error result
      return {
        pageAgent,
        pageRoute,
        tool: 'lighthouse',
        score: 0,
        passed: false,
        findings: [],
        summary: `Lighthouse audit failed: ${error.message}`,
        severity: 'critical',
        issuesFound: 1,
        metadata: {
          error: error.message,
          url,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

export const lighthouseAuditService = new LighthouseAuditService();
