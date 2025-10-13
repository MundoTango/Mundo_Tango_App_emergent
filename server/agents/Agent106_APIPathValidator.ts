/**
 * ESA AGENT #106: Auto-API Path Validator
 * MB.MD TRACK 8.1 - Horizontal Integration
 * 
 * Purpose: Automatically validate frontend API paths match backend routes
 * Prevents: Data disconnection bugs (Phase 19 audit enforcement)
 * Runs: Hourly via cron, on-demand via API
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../db';
import { agentJobs } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

interface APIValidationResult {
  timestamp: string;
  frontendCalls: number;
  backendRoutes: number;
  matches: number;
  mismatches: number;
  coverage: number;
  criticalIssues: Array<{
    frontend: string;
    backend: string | null;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export class Agent106_APIPathValidator {
  private agentId = 106;
  private agentName = 'Auto-API Path Validator';
  
  /**
   * Run API path validation check
   */
  async validate(): Promise<APIValidationResult> {
    console.log(`[Agent #${this.agentId}] Starting API path validation...`);
    
    const jobId = await this.createJob();
    
    try {
      // Run the validation script
      const { stdout, stderr } = await execAsync('node scripts/validate-api-paths.mjs --compare');
      
      // Parse validation report
      const report = await this.parseValidationReport();
      
      // Identify critical issues
      const criticalIssues = this.identifyCriticalIssues(report);
      
      // Update job status
      await this.completeJob(jobId, 'completed', report);
      
      // Alert if critical issues found
      if (criticalIssues.length > 0) {
        await this.alertCriticalIssues(criticalIssues);
      }
      
      console.log(`[Agent #${this.agentId}] Validation complete:`, {
        coverage: report.coverage,
        mismatches: report.mismatches,
        critical: criticalIssues.length
      });
      
      return {
        ...report,
        criticalIssues
      };
      
    } catch (error) {
      console.error(`[Agent #${this.agentId}] Validation failed:`, error);
      await this.completeJob(jobId, 'failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Parse validation report from file
   */
  private async parseValidationReport(): Promise<APIValidationResult> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const reportPath = path.join(process.cwd(), 'reports/api-validation-report.json');
    const reportData = await fs.readFile(reportPath, 'utf-8');
    const report = JSON.parse(reportData);
    
    return {
      timestamp: report.timestamp,
      frontendCalls: report.frontendCalls,
      backendRoutes: report.backendRoutes,
      matches: report.matches,
      mismatches: report.mismatches,
      coverage: report.coverage,
      criticalIssues: []
    };
  }
  
  /**
   * Identify critical API path issues
   */
  private identifyCriticalIssues(report: APIValidationResult): Array<{
    frontend: string;
    backend: string | null;
    severity: 'high' | 'medium' | 'low';
  }> {
    const fs = require('fs').promises;
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'reports/api-validation-report.json');
    
    try {
      const reportData = require(reportPath);
      const issues = reportData.details?.mismatches || [];
      
      // Prioritize by severity
      return issues.map((issue: any) => {
        let severity: 'high' | 'medium' | 'low' = 'low';
        
        // High severity: Admin/critical endpoints
        if (issue.frontend.includes('/admin/') || 
            issue.frontend.includes('/auth/') ||
            issue.frontend.includes('/payment/')) {
          severity = 'high';
        }
        // Medium severity: User-facing features
        else if (issue.frontend.includes('/api/')) {
          severity = 'medium';
        }
        
        return {
          frontend: issue.frontend,
          backend: issue.suggested || null,
          severity
        };
      }).filter((issue: any) => issue.severity === 'high' || issue.severity === 'medium');
      
    } catch (error) {
      console.error('[Agent #106] Failed to identify critical issues:', error);
      return [];
    }
  }
  
  /**
   * Alert team about critical issues
   */
  private async alertCriticalIssues(issues: any[]): Promise<void> {
    console.warn(`[Agent #${this.agentId}] 🚨 CRITICAL API PATH ISSUES DETECTED:`, issues.length);
    
    issues.forEach(issue => {
      console.warn(`  - ${issue.severity.toUpperCase()}: ${issue.frontend}`);
      console.warn(`    Backend: ${issue.backend || 'NOT FOUND'}`);
    });
    
    // TODO: Send notification to Agent #0 (CEO) and Agent #80 (Learning Coordinator)
    // TODO: Create GitHub issue via Agent #65 (Project Tracker)
  }
  
  /**
   * Create agent job record
   */
  private async createJob(): Promise<number> {
    try {
      const [job] = await db.insert(agentJobs).values({
        agentId: this.agentId,
        agentName: this.agentName,
        jobType: 'api_validation',
        status: 'running',
        priority: 'medium',
        startedAt: new Date(),
        metadata: {
          trigger: 'scheduled',
          phase: 19 // Phase 19: End-to-End Data Flow Validation
        }
      }).returning();
      
      return job.id;
    } catch (error) {
      console.error('[Agent #106] Failed to create job:', error);
      return -1;
    }
  }
  
  /**
   * Complete agent job
   */
  private async completeJob(jobId: number, status: 'completed' | 'failed', result: any): Promise<void> {
    if (jobId === -1) return;
    
    try {
      await db.update(agentJobs)
        .set({
          status,
          completedAt: new Date(),
          result
        })
        .where(eq(agentJobs.id, jobId));
    } catch (error) {
      console.error('[Agent #106] Failed to update job:', error);
    }
  }
  
  /**
   * Run scheduled validation (cron job)
   */
  async runScheduled(): Promise<void> {
    console.log(`[Agent #${this.agentId}] Running scheduled API validation...`);
    await this.validate();
  }
  
  /**
   * Fix detected API path mismatches (automated)
   */
  async autoFix(): Promise<{fixed: number, failed: number}> {
    console.log(`[Agent #${this.agentId}] AUTO-FIX not yet implemented`);
    // TODO: Implement automated fixes for common patterns
    return { fixed: 0, failed: 0 };
  }
}

// Export singleton instance
export const agent106 = new Agent106_APIPathValidator();
