/**
 * STREAM 3: Terminal Security - Command Audit Logger
 * 
 * Comprehensive audit trail for all terminal command executions
 */

import { logger } from '../lib/logger';
import { randomUUID } from 'crypto';

export interface CommandAudit {
  id: string;
  command: string;
  executedBy: number; // User ID
  executedAt: Date;
  success: boolean;
  exitCode: number | null;
  duration: number;
  stdout: string;
  stderr: string;
  workingDirectory: string;
  riskAssessment: 'safe' | 'moderate' | 'high';
  approved: boolean; // Whether it required approval
  approvalId?: string;
}

/**
 * Command audit logger
 */
export class CommandAuditor {
  private audits: CommandAudit[] = [];
  private readonly MAX_AUDITS = 1000; // Keep last 1000 commands

  /**
   * Assess command risk level
   */
  assessRisk(command: string): 'safe' | 'moderate' | 'high' {
    const cmdLower = command.toLowerCase().trim();

    // High risk patterns
    const highRiskPatterns = [
      'rm', 'delete', 'drop', 'truncate', 'destroy',
      'chmod', 'chown', 'sudo', 'su',
      'kill', 'pkill', 'killall',
      'reboot', 'shutdown', 'poweroff',
    ];

    // Moderate risk patterns
    const moderateRiskPatterns = [
      'install', 'uninstall', 'remove',
      'update', 'upgrade',
      'push', 'deploy', 'publish',
      'migrate', 'seed',
    ];

    for (const pattern of highRiskPatterns) {
      if (cmdLower.includes(pattern)) {
        return 'high';
      }
    }

    for (const pattern of moderateRiskPatterns) {
      if (cmdLower.includes(pattern)) {
        return 'moderate';
      }
    }

    return 'safe';
  }

  /**
   * Log command execution
   */
  log(audit: Omit<CommandAudit, 'id'>): string {
    const id = randomUUID();
    
    const fullAudit: CommandAudit = {
      id,
      ...audit,
    };

    this.audits.push(fullAudit);

    // Trim to max size
    if (this.audits.length > this.MAX_AUDITS) {
      this.audits = this.audits.slice(-this.MAX_AUDITS);
    }

    // Structured logging
    logger.info({
      auditId: id,
      command: audit.command.substring(0, 200),
      executedBy: audit.executedBy,
      success: audit.success,
      exitCode: audit.exitCode,
      duration: audit.duration,
      riskAssessment: audit.riskAssessment,
      approved: audit.approved,
    }, '[CommandAuditor] Command executed');

    // Alert on high-risk failures
    if (audit.riskAssessment === 'high' && !audit.success) {
      logger.warn({
        auditId: id,
        command: audit.command,
        stderr: audit.stderr.substring(0, 500),
      }, '[CommandAuditor] ⚠️ High-risk command failed');
    }

    return id;
  }

  /**
   * Get audit by ID
   */
  getAudit(id: string): CommandAudit | null {
    return this.audits.find(a => a.id === id) || null;
  }

  /**
   * Get recent audits
   */
  getRecentAudits(limit: number = 50, userId?: number): CommandAudit[] {
    let filtered = [...this.audits];

    if (userId) {
      filtered = filtered.filter(a => a.executedBy === userId);
    }

    return filtered
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get failed commands
   */
  getFailedCommands(limit: number = 20): CommandAudit[] {
    return this.audits
      .filter(a => !a.success)
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get high-risk commands
   */
  getHighRiskCommands(limit: number = 20): CommandAudit[] {
    return this.audits
      .filter(a => a.riskAssessment === 'high')
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    successful: number;
    failed: number;
    byRisk: Record<string, number>;
    avgDuration: number;
  } {
    const total = this.audits.length;
    const successful = this.audits.filter(a => a.success).length;
    const failed = total - successful;

    const byRisk = this.audits.reduce((acc, a) => {
      acc[a.riskAssessment] = (acc[a.riskAssessment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgDuration = total > 0
      ? this.audits.reduce((sum, a) => sum + a.duration, 0) / total
      : 0;

    return {
      total,
      successful,
      failed,
      byRisk,
      avgDuration: Math.round(avgDuration),
    };
  }
}

// Export singleton instance
export const commandAuditor = new CommandAuditor();
