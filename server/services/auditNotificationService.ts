/**
 * Audit Notification Service
 * ESA Layer 16: Notification System + Layer 57: Background Jobs
 * 
 * Sends notifications for audit results and critical issues
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export type NotificationChannel = 'email' | 'slack' | 'console' | 'github';
export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AuditNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  metadata?: {
    auditType?: string;
    score?: number;
    issues?: number;
    recommendations?: string[];
  };
  timestamp: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  template: (data: any) => { title: string; message: string };
}

class AuditNotificationServiceClass {
  private notificationsDir = join(process.cwd(), 'docs/notifications');
  private rules: NotificationRule[] = [];

  constructor() {
    if (!existsSync(this.notificationsDir)) {
      mkdirSync(this.notificationsDir, { recursive: true });
    }
    this.initializeRules();
  }

  private initializeRules() {
    // Rule 1: Critical performance degradation
    this.rules.push({
      id: 'critical-performance',
      name: 'Critical Performance Degradation',
      condition: (data) => {
        return data.lighthouse?.avgPerformance < 50 || data.overall?.healthScore < 50;
      },
      severity: 'critical',
      channels: ['email', 'slack', 'github'],
      template: (data) => ({
        title: '🚨 CRITICAL: Performance Severely Degraded',
        message: `Performance has dropped to ${data.lighthouse?.avgPerformance || data.overall?.healthScore}/100. Immediate attention required!`
      })
    });

    // Rule 2: Bundle size increase
    this.rules.push({
      id: 'bundle-size-alert',
      name: 'Bundle Size Alert',
      condition: (data) => {
        return data.bundleSize?.changePercent > 10;
      },
      severity: 'warning',
      channels: ['slack', 'github'],
      template: (data) => ({
        title: '⚠️ Bundle Size Increased',
        message: `Bundle size increased by ${data.bundleSize.changePercent.toFixed(1)}% (threshold: 10%)`
      })
    });

    // Rule 3: Security vulnerabilities
    this.rules.push({
      id: 'security-vulnerabilities',
      name: 'Security Vulnerabilities Detected',
      condition: (data) => {
        return data.security?.criticalCount > 0 || data.security?.highCount > 0;
      },
      severity: 'critical',
      channels: ['email', 'slack', 'github'],
      template: (data) => ({
        title: '🔒 Security Vulnerabilities Found',
        message: `Found ${data.security.criticalCount} critical and ${data.security.highCount} high severity vulnerabilities`
      })
    });

    // Rule 4: Accessibility issues
    this.rules.push({
      id: 'accessibility-issues',
      name: 'Accessibility Issues',
      condition: (data) => {
        return data.lighthouse?.avgAccessibility < 90 || data.accessibility?.criticalCount > 0;
      },
      severity: 'warning',
      channels: ['slack', 'console'],
      template: (data) => ({
        title: '♿ Accessibility Issues Detected',
        message: `Accessibility score: ${data.lighthouse?.avgAccessibility}/100. ${data.accessibility?.criticalCount || 0} critical issues found.`
      })
    });

    // Rule 5: Page audit failures
    this.rules.push({
      id: 'page-audit-failures',
      name: 'Page Audit Failures',
      condition: (data) => {
        return data.pageAudit?.criticalIssues > 5;
      },
      severity: 'warning',
      channels: ['slack', 'console'],
      template: (data) => ({
        title: '📄 Multiple Page Audit Failures',
        message: `${data.pageAudit.criticalIssues} critical issues found across platform pages`
      })
    });

    // Rule 6: Success notification
    this.rules.push({
      id: 'audit-success',
      name: 'Audit Passed Successfully',
      condition: (data) => {
        return data.overall?.healthScore >= 90 && data.overall?.status === 'excellent';
      },
      severity: 'success',
      channels: ['console'],
      template: (data) => ({
        title: '✅ All Audits Passed',
        message: `Health Score: ${data.overall.healthScore}/100 - All systems performing excellently!`
      })
    });
  }

  async evaluateAndNotify(auditData: any): Promise<AuditNotification[]> {
    const notifications: AuditNotification[] = [];

    for (const rule of this.rules) {
      if (rule.condition(auditData)) {
        const { title, message } = rule.template(auditData);
        
        const notification: AuditNotification = {
          id: `${rule.id}-${Date.now()}`,
          title,
          message,
          severity: rule.severity,
          channels: rule.channels,
          metadata: {
            auditType: auditData.type,
            score: auditData.overall?.healthScore,
            issues: auditData.overall?.criticalIssues,
            recommendations: auditData.overall?.recommendations
          },
          timestamp: new Date().toISOString()
        };

        notifications.push(notification);
        await this.send(notification);
      }
    }

    return notifications;
  }

  private async send(notification: AuditNotification): Promise<void> {
    // Save to file system
    this.saveNotification(notification);

    // Send to each channel
    for (const channel of notification.channels) {
      switch (channel) {
        case 'console':
          this.sendToConsole(notification);
          break;
        case 'email':
          await this.sendToEmail(notification);
          break;
        case 'slack':
          await this.sendToSlack(notification);
          break;
        case 'github':
          await this.sendToGitHub(notification);
          break;
      }
    }
  }

  private sendToConsole(notification: AuditNotification): void {
    const icon = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵',
      success: '🟢'
    }[notification.severity];

    console.log(`\n${icon} ${notification.title}`);
    console.log(`   ${notification.message}`);
    if (notification.metadata?.recommendations) {
      console.log(`   Recommendations: ${notification.metadata.recommendations.length}`);
    }
    console.log('');
  }

  private async sendToEmail(notification: AuditNotification): Promise<void> {
    // Mock email sending (integrate with Resend in production)
    console.log(`[EMAIL] Would send: ${notification.title}`);
    
    // In production:
    // await resend.emails.send({
    //   from: 'audits@mundotango.com',
    //   to: process.env.AUDIT_EMAIL_RECIPIENTS?.split(',') || [],
    //   subject: notification.title,
    //   html: this.formatEmailBody(notification)
    // });
  }

  private async sendToSlack(notification: AuditNotification): Promise<void> {
    // Mock Slack notification (integrate with Slack webhook in production)
    console.log(`[SLACK] Would send: ${notification.title}`);
    
    // In production:
    // const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    // if (webhookUrl) {
    //   await fetch(webhookUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: notification.title,
    //       attachments: [{
    //         color: this.getSeverityColor(notification.severity),
    //         text: notification.message,
    //         fields: this.formatSlackFields(notification)
    //       }]
    //     })
    //   });
    // }
  }

  private async sendToGitHub(notification: AuditNotification): Promise<void> {
    // Mock GitHub issue creation (integrate with Octokit in production)
    console.log(`[GITHUB] Would create issue: ${notification.title}`);
    
    // In production (in GitHub Actions):
    // const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    // await octokit.rest.issues.create({
    //   owner: 'your-org',
    //   repo: 'your-repo',
    //   title: notification.title,
    //   body: this.formatGitHubIssue(notification),
    //   labels: [notification.severity, 'audit', 'automated']
    // });
  }

  private saveNotification(notification: AuditNotification): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `notification-${notification.severity}-${timestamp}.json`;
    const filepath = join(this.notificationsDir, filename);
    writeFileSync(filepath, JSON.stringify(notification, null, 2));
  }

  private getSeverityColor(severity: NotificationSeverity): string {
    const colors = {
      critical: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',
      success: '#10b981'
    };
    return colors[severity];
  }

  private formatEmailBody(notification: AuditNotification): string {
    return `
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
      ${notification.metadata?.recommendations ? `
        <h3>Recommendations:</h3>
        <ul>
          ${notification.metadata.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      ` : ''}
      <p><small>Timestamp: ${new Date(notification.timestamp).toLocaleString()}</small></p>
    `;
  }

  private formatSlackFields(notification: AuditNotification): any[] {
    const fields: any[] = [];
    
    if (notification.metadata?.score !== undefined) {
      fields.push({
        title: 'Health Score',
        value: `${notification.metadata.score}/100`,
        short: true
      });
    }
    
    if (notification.metadata?.issues !== undefined) {
      fields.push({
        title: 'Critical Issues',
        value: notification.metadata.issues.toString(),
        short: true
      });
    }
    
    return fields;
  }

  private formatGitHubIssue(notification: AuditNotification): string {
    let body = `## ${notification.title}\n\n`;
    body += `${notification.message}\n\n`;
    
    if (notification.metadata?.score !== undefined) {
      body += `**Health Score:** ${notification.metadata.score}/100\n`;
    }
    
    if (notification.metadata?.issues !== undefined) {
      body += `**Critical Issues:** ${notification.metadata.issues}\n`;
    }
    
    if (notification.metadata?.recommendations) {
      body += `\n### Recommendations\n`;
      notification.metadata.recommendations.forEach((rec, i) => {
        body += `${i + 1}. ${rec}\n`;
      });
    }
    
    body += `\n---\n*Automated notification from Audit System at ${new Date(notification.timestamp).toLocaleString()}*`;
    
    return body;
  }

  // Utility method for CLI
  async notifyFromDashboard(dashboardPath: string): Promise<void> {
    const fs = require('fs');
    const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf-8'));
    await this.evaluateAndNotify(dashboard);
  }
}

export const auditNotificationService = new AuditNotificationServiceClass();
