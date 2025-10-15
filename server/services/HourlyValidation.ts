/**
 * TRACK 7 (Legacy Task): Hourly Validation System
 * Agent #79 - Autonomous Testing
 * 
 * Runs tests every hour, escalates failures
 */

import * as cron from 'node-cron';
import { pageStateMonitor } from './PageStateMonitor';
import { serviceHealthMonitor } from './ServiceHealthMonitor';
import { autoFixProposal } from './AutoFixProposal';

interface ValidationResult {
  timestamp: Date;
  category: string;
  passed: boolean;
  issues: string[];
  details?: any;
}

interface ValidationReport {
  timestamp: Date;
  totalTests: number;
  passed: number;
  failed: number;
  results: ValidationResult[];
  escalated: boolean;
  escalationReason?: string;
}

export class HourlyValidation {
  private cronJob: cron.ScheduledTask | null = null;
  private reports: ValidationReport[] = [];
  private readonly MAX_REPORTS = 168; // Keep 1 week of hourly reports
  private readonly ESCALATION_THRESHOLD = 0.2; // Escalate if >20% fail

  /**
   * Start hourly validation cron job
   */
  start() {
    console.log('⏰ [HourlyValidation] Starting hourly validation cron...');

    // Run every hour at :00
    this.cronJob = cron.schedule('0 * * * *', async () => {
      await this.runValidation();
    });

    console.log('✅ [HourlyValidation] Cron job scheduled (runs at :00 every hour)');

    // Run immediately on startup
    this.runValidation();
  }

  /**
   * Stop validation cron
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('🛑 [HourlyValidation] Cron job stopped');
    }
  }

  /**
   * Run complete validation suite
   */
  private async runValidation() {
    console.log('🧪 [HourlyValidation] Running hourly validation...');
    const startTime = Date.now();

    const results: ValidationResult[] = [];

    // Test 1: Service Health
    results.push(await this.validateServiceHealth());

    // Test 2: Page Health
    results.push(await this.validatePageHealth());

    // Test 3: API Endpoints
    results.push(await this.validateAPIEndpoints());

    // Test 4: Performance Benchmarks
    results.push(await this.validatePerformance());

    // Test 5: Visual Editor
    results.push(await this.validateVisualEditor());

    // Test 6: Mr Blue Intelligence
    results.push(await this.validateMrBlue());

    // Create report
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const failureRate = failed / results.length;

    const report: ValidationReport = {
      timestamp: new Date(),
      totalTests: results.length,
      passed,
      failed,
      results,
      escalated: failureRate > this.ESCALATION_THRESHOLD
    };

    if (report.escalated) {
      report.escalationReason = `${(failureRate * 100).toFixed(0)}% of tests failed (threshold: ${(this.ESCALATION_THRESHOLD * 100).toFixed(0)}%)`;
      await this.escalateToAgent72(report);
    }

    this.reports.push(report);

    // Maintain max size
    if (this.reports.length > this.MAX_REPORTS) {
      this.reports.shift();
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [HourlyValidation] Validation complete in ${duration}ms:`, {
      passed,
      failed,
      escalated: report.escalated
    });
  }

  /**
   * Validate service health
   */
  private async validateServiceHealth(): Promise<ValidationResult> {
    const services = serviceHealthMonitor.getAllServicesHealth();
    const unhealthy = services.filter(s => s.status !== 'healthy');

    return {
      timestamp: new Date(),
      category: 'service-health',
      passed: unhealthy.length === 0,
      issues: unhealthy.map(s => `${s.name} is ${s.status}`),
      details: { services: services.length, unhealthy: unhealthy.length }
    };
  }

  /**
   * Validate page health
   */
  private async validatePageHealth(): Promise<ValidationResult> {
    const pagesWithIssues = pageStateMonitor.getPagesWithIssues();

    return {
      timestamp: new Date(),
      category: 'page-health',
      passed: pagesWithIssues.length === 0,
      issues: pagesWithIssues.map(p => `${p.url}: ${p.issues.join(', ')}`),
      details: { pagesWithIssues: pagesWithIssues.length }
    };
  }

  /**
   * Validate API endpoints
   */
  private async validateAPIEndpoints(): Promise<ValidationResult> {
    // TODO: Implement API endpoint testing
    return {
      timestamp: new Date(),
      category: 'api-endpoints',
      passed: true,
      issues: [],
      details: { tested: 0 }
    };
  }

  /**
   * Validate performance benchmarks
   */
  private async validatePerformance(): Promise<ValidationResult> {
    // TODO: Implement performance benchmarking
    return {
      timestamp: new Date(),
      category: 'performance',
      passed: true,
      issues: [],
      details: { benchmarks: 0 }
    };
  }

  /**
   * Validate Visual Editor
   */
  private async validateVisualEditor(): Promise<ValidationResult> {
    // TODO: Test Visual Editor functionality
    return {
      timestamp: new Date(),
      category: 'visual-editor',
      passed: true,
      issues: [],
      details: { editorTests: 0 }
    };
  }

  /**
   * Validate Mr Blue Intelligence
   */
  private async validateMrBlue(): Promise<ValidationResult> {
    // TODO: Test Mr Blue query capabilities
    return {
      timestamp: new Date(),
      category: 'mr-blue',
      passed: true,
      issues: [],
      details: { queryTests: 0 }
    };
  }

  /**
   * Escalate failures to Agent #72
   */
  private async escalateToAgent72(report: ValidationReport) {
    console.error(`🚨 [HourlyValidation] ESCALATING to Agent #72:`, report.escalationReason);
    
    // Auto-generate fix proposals for failed tests
    const failedResults = report.results.filter(r => !r.passed);
    
    for (const result of failedResults) {
      if (result.category === 'page-health' && result.issues.length > 0) {
        // Extract page URLs from issues and propose fixes
        const pageUrls = result.issues.map(issue => {
          const match = issue.match(/^([^:]+):/);
          return match ? match[1] : null;
        }).filter(Boolean) as string[];

        for (const url of pageUrls) {
          await autoFixProposal.analyzeAndPropose(url);
        }
      }
    }

    console.log(`🔧 [HourlyValidation] Generated auto-fix proposals for ${failedResults.length} failures`);
  }

  /**
   * Get latest report
   */
  getLatestReport(): ValidationReport | null {
    return this.reports[this.reports.length - 1] || null;
  }

  /**
   * Get all reports
   */
  getAllReports(): ValidationReport[] {
    return this.reports;
  }

  /**
   * Get reports with failures
   */
  getFailedReports(): ValidationReport[] {
    return this.reports.filter(r => r.failed > 0);
  }
}

export const hourlyValidation = new HourlyValidation();
