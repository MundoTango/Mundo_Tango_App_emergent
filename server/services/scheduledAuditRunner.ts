/**
 * Scheduled Audit Runner
 * ESA Layer 57: Background Jobs & Automation
 * 
 * Orchestrates scheduled audit execution and reporting
 */

import { performanceMetricsDashboard } from './performanceMetricsDashboard';
import { auditNotificationService } from './auditNotificationService';
import { lighthouseAuditor } from './lighthouseAuditor';
import { bundleSizeTracker } from './bundleSizeTracker';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface ScheduledAuditResult {
  jobId: string;
  jobType: 'daily' | 'weekly' | 'on-demand';
  startTime: string;
  endTime: string;
  duration: number;
  results: {
    lighthouse?: any;
    bundle?: any;
    dashboard?: any;
    notifications?: any[];
  };
  success: boolean;
  errors: string[];
}

class ScheduledAuditRunnerService {
  private resultsDir = join(process.cwd(), 'docs/scheduled-audits');

  constructor() {
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async runDailyAudit(): Promise<ScheduledAuditResult> {
    const startTime = new Date().toISOString();
    const jobId = `daily-${Date.now()}`;
    const errors: string[] = [];
    const results: any = {};

    console.log(`\n🔄 Starting Daily Audit Job (${jobId})...\n`);

    try {
      // 1. Lighthouse audit
      console.log('→ Running Lighthouse audit...');
      const lighthousePages = lighthouseAuditor.getTestPages();
      results.lighthouse = await lighthouseAuditor.auditSuite(lighthousePages);
      console.log('✅ Lighthouse complete');

      // 2. Bundle size tracking
      console.log('→ Capturing bundle snapshot...');
      try {
        const commit = `daily-${new Date().toISOString().split('T')[0]}`;
        results.bundle = await bundleSizeTracker.captureSnapshot(commit);
        console.log('✅ Bundle snapshot complete');
      } catch (error) {
        errors.push(`Bundle tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // 3. Performance dashboard
      console.log('→ Generating performance dashboard...');
      results.dashboard = await performanceMetricsDashboard.generateDashboard();
      console.log('✅ Dashboard complete');

      // 4. Evaluate and send notifications
      console.log('→ Evaluating notification rules...');
      results.notifications = await auditNotificationService.evaluateAndNotify(results.dashboard);
      console.log(`✅ ${results.notifications.length} notifications generated`);

    } catch (error) {
      errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const endTime = new Date().toISOString();
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

    const auditResult: ScheduledAuditResult = {
      jobId,
      jobType: 'daily',
      startTime,
      endTime,
      duration,
      results,
      success: errors.length === 0,
      errors
    };

    this.saveResult(auditResult);
    this.printSummary(auditResult);

    return auditResult;
  }

  async runWeeklyAudit(): Promise<ScheduledAuditResult> {
    const startTime = new Date().toISOString();
    const jobId = `weekly-${Date.now()}`;
    const errors: string[] = [];
    const results: any = {};

    console.log(`\n🔄 Starting Weekly Audit Job (${jobId})...\n`);

    try {
      // Run daily audit plus additional weekly checks
      const dailyResult = await this.runDailyAudit();
      results.daily = dailyResult;

      // Additional weekly-specific tasks would go here
      // (dependency review, security deep scan, etc.)

    } catch (error) {
      errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const endTime = new Date().toISOString();
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

    const auditResult: ScheduledAuditResult = {
      jobId,
      jobType: 'weekly',
      startTime,
      endTime,
      duration,
      results,
      success: errors.length === 0,
      errors
    };

    this.saveResult(auditResult);
    return auditResult;
  }

  private saveResult(result: ScheduledAuditResult): void {
    const timestamp = new Date(result.startTime).toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${result.jobType}-audit-${timestamp}.json`;
    const filepath = join(this.resultsDir, filename);
    writeFileSync(filepath, JSON.stringify(result, null, 2));
  }

  private printSummary(result: ScheduledAuditResult): void {
    console.log('\n' + '═'.repeat(80));
    console.log(`📊 ${result.jobType.toUpperCase()} AUDIT SUMMARY`);
    console.log('═'.repeat(80) + '\n');

    console.log(`Job ID: ${result.jobId}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Success: ${result.success ? '✅' : '❌'}\n`);

    if (result.results.lighthouse) {
      console.log('Lighthouse Results:');
      console.log(`  Performance: ${result.results.lighthouse.summary.avgPerformance}/100`);
      console.log(`  Accessibility: ${result.results.lighthouse.summary.avgAccessibility}/100`);
      console.log(`  Critical Issues: ${result.results.lighthouse.summary.criticalIssues}\n`);
    }

    if (result.results.dashboard) {
      console.log('Performance Dashboard:');
      console.log(`  Overall Health: ${result.results.dashboard.overall.healthScore}/100`);
      console.log(`  Status: ${result.results.dashboard.overall.status.toUpperCase()}\n`);
    }

    if (result.results.notifications && result.results.notifications.length > 0) {
      console.log('Notifications Sent:');
      result.results.notifications.forEach((n: any) => {
        const iconMap: Record<string, string> = {
          critical: '🔴',
          warning: '🟡',
          info: '🔵',
          success: '🟢'
        };
        const icon = iconMap[n.severity] || '⚪';
        console.log(`  ${icon} ${n.title}`);
      });
      console.log('');
    }

    if (result.errors.length > 0) {
      console.log('Errors:');
      result.errors.forEach(e => console.log(`  ❌ ${e}`));
      console.log('');
    }

    console.log('═'.repeat(80) + '\n');
  }
}

export const scheduledAuditRunner = new ScheduledAuditRunnerService();
