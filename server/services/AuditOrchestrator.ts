// TRACK 5: Audit Orchestrator - Coordinates all audit tools
import { db } from '../db';
import { auditResults, auditSchedules, features } from '@shared/schema';
import { playwrightAuditService } from './PlaywrightAuditService';
import { axeAuditService } from './AxeAuditService';
import { lighthouseAuditService } from './LighthouseAuditService';
import { auditAutomationService } from './AuditAutomationService';
import type { InsertAuditResult } from '@shared/schema';

type AuditTool = 'playwright' | 'axe' | 'lighthouse' | 'all';

export class AuditOrchestrator {
  async runPageAudit(
    pageAgent: string,
    pageRoute: string,
    tools: AuditTool[] = ['all']
  ): Promise<InsertAuditResult[]> {
    console.log(`[AuditOrchestrator] Running audit for ${pageAgent}: ${tools.join(', ')}`);

    const results: InsertAuditResult[] = [];
    const runTools = tools.includes('all') ? ['playwright', 'axe', 'lighthouse'] : tools;

    // Run audits in parallel
    const auditPromises = runTools.map(async (tool) => {
      try {
        let result;

        switch (tool) {
          case 'playwright':
            result = await playwrightAuditService.auditPage(pageRoute, pageAgent);
            break;
          case 'axe':
            result = await axeAuditService.auditPage(pageRoute, pageAgent);
            break;
          case 'lighthouse':
            result = await lighthouseAuditService.auditPage(pageRoute, pageAgent);
            break;
          default:
            return null;
        }

        // Save to database
        const [saved] = await db.insert(auditResults).values(result as InsertAuditResult).returning();
        
        // Auto-generate story cards if findings are critical/high
        if (saved.severity === 'critical' || saved.severity === 'high') {
          await this.generateStoryCards(saved);
        }

        return saved;
      } catch (error) {
        console.error(`[AuditOrchestrator] ${tool} audit failed:`, error);
        return null;
      }
    });

    const auditResults = await Promise.all(auditPromises);
    return auditResults.filter((r): r is InsertAuditResult => r !== null);
  }

  async runScheduledAudits(): Promise<number> {
    try {
      const now = new Date();

      // Get all active schedules due for execution
      const dueSchedules = await db.query.auditSchedules.findMany({
        where: (schedules, { and, lte, eq }) =>
          and(
            eq(schedules.isActive, true),
            lte(schedules.nextRun, now)
          ),
      });

      console.log(`[AuditOrchestrator] Running ${dueSchedules.length} scheduled audits`);

      let executedCount = 0;

      for (const schedule of dueSchedules) {
        try {
          await this.runPageAudit(
            schedule.pageAgent,
            schedule.pageRoute,
            (schedule.auditTypes || ['all']) as AuditTool[]
          );

          // Update schedule
          const nextRun = this.calculateNextRun(schedule.cronExpression || '0 2 * * *');
          await db
            .update(auditSchedules)
            .set({
              lastRun: now,
              nextRun,
              updatedAt: now,
            })
            .where(eq(auditSchedules.id, schedule.id));

          executedCount++;
        } catch (error) {
          console.error(`[AuditOrchestrator] Failed to run scheduled audit for ${schedule.pageAgent}:`, error);
        }
      }

      return executedCount;
    } catch (error) {
      console.error('[AuditOrchestrator] Scheduled audit error:', error);
      return 0;
    }
  }

  private async generateStoryCards(audit: InsertAuditResult): Promise<void> {
    try {
      // Map audit findings to story card format
      const findings = (audit.findings || []) as any[];
      
      const auditData = {
        pageAgent: audit.pageAgent,
        auditType: audit.auditType,
        findings: findings.map(f => ({
          phase: `${audit.toolName}_${f.type}`,
          severity: f.severity,
          description: f.message,
          recommendation: f.location || '',
        })),
      };

      // Use existing audit automation service
      await auditAutomationService.processAuditResults(auditData);

      // Mark story card as generated
      await db
        .update(auditResults)
        .set({ storyCardGenerated: true })
        .where(eq(auditResults.id, audit.id));

      console.log(`[AuditOrchestrator] Story cards generated for ${audit.pageAgent}`);
    } catch (error) {
      console.error('[AuditOrchestrator] Story card generation error:', error);
    }
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simple cron parser - extend as needed
    const now = new Date();
    
    // For now, just add based on common patterns
    if (cronExpression.includes('*/6')) {
      // Every 6 hours
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    } else if (cronExpression.includes('0 2')) {
      // Daily at 2 AM
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(2, 0, 0, 0);
      return next;
    } else if (cronExpression.includes('0 3 * * 0')) {
      // Weekly on Sunday at 3 AM
      const next = new Date(now);
      next.setDate(next.getDate() + ((7 - next.getDay()) % 7 || 7));
      next.setHours(3, 0, 0, 0);
      return next;
    }

    // Default: next day at same time
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  async cleanup(): Promise<void> {
    await playwrightAuditService.close();
    await axeAuditService.close();
  }
}

export const auditOrchestrator = new AuditOrchestrator();
