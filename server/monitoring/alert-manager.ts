/**
 * ESA LIFE CEO 61x21 - Alert Management System
 * Phase 14: Alert Configuration and Notification
 * 
 * Manages alerts for all 61 layers with intelligent notification routing
 */

import { EventEmitter } from 'events';
import { esaRegistry, alertsTriggered } from './prometheus-metrics';
import { agentAnalytics } from './agent-analytics';
import nodemailer from 'nodemailer';
import axios from 'axios';

export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
}

export enum AlertCategory {
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  AGENTS = 'agents',
  DATABASE = 'database',
  CACHE = 'cache',
  MEMORY = 'memory',
  API = 'api',
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  layer?: number;
  agentId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: Date;
  acknowledgedBy?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: () => Promise<boolean>;
  severity: AlertSeverity;
  category: AlertCategory;
  cooldown: number; // Minutes before re-alerting
  message: (data?: any) => string;
  metadata?: () => Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'webhook' | 'slack' | 'discord';
  config: Record<string, any>;
  severities: AlertSeverity[];
  categories?: AlertCategory[];
}

export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private lastAlertTime: Map<string, Date> = new Map();
  private notificationChannels: NotificationChannel[] = [];
  private checkInterval: NodeJS.Timeout;
  private emailTransporter?: any;
  
  constructor() {
    super();
    this.initializeDefaultRules();
    this.initializeNotificationChannels();
    this.startMonitoring();
  }
  
  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules() {
    // System alerts
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      condition: async () => {
        const memUsage = process.memoryUsage();
        const heapPercentage = memUsage.heapUsed / memUsage.heapTotal;
        return heapPercentage > 0.9;
      },
      severity: AlertSeverity.CRITICAL,
      category: AlertCategory.MEMORY,
      cooldown: 5,
      message: (data) => `Memory usage is at ${(data.percentage * 100).toFixed(1)}%`,
      metadata: () => {
        const mem = process.memoryUsage();
        return {
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
          percentage: mem.heapUsed / mem.heapTotal,
        };
      },
    });
    
    // Agent performance alerts
    this.addRule({
      id: 'agent-high-response-time',
      name: 'Agent High Response Time',
      condition: async () => {
        const metrics = agentAnalytics.getPerformanceMetrics();
        return metrics.some(m => m.avgResponseTime > 5000);
      },
      severity: AlertSeverity.WARNING,
      category: AlertCategory.AGENTS,
      cooldown: 15,
      message: (data) => `Agent ${data.agentId} has high response time: ${data.responseTime}ms`,
      metadata: () => {
        const metrics = agentAnalytics.getPerformanceMetrics();
        const slow = metrics.find(m => m.avgResponseTime > 5000);
        return slow ? {
          agentId: slow.agentId,
          responseTime: slow.avgResponseTime,
          layer: slow.layer,
        } : {};
      },
    });
    
    // Agent failure rate
    this.addRule({
      id: 'agent-high-failure-rate',
      name: 'Agent High Failure Rate',
      condition: async () => {
        const metrics = agentAnalytics.getPerformanceMetrics();
        return metrics.some(m => m.errorRate > 10);
      },
      severity: AlertSeverity.CRITICAL,
      category: AlertCategory.AGENTS,
      cooldown: 10,
      message: (data) => `Agent ${data.agentId} has ${data.errorRate}% failure rate`,
      metadata: () => {
        const metrics = agentAnalytics.getPerformanceMetrics();
        const failing = metrics.find(m => m.errorRate > 10);
        return failing ? {
          agentId: failing.agentId,
          errorRate: failing.errorRate,
          layer: failing.layer,
          topErrors: failing.topErrors,
        } : {};
      },
    });
    
    // Layer health monitoring
    this.addRule({
      id: 'layer-unhealthy',
      name: 'Layer Unhealthy',
      condition: async () => {
        const health = agentAnalytics.getAgentHealth();
        return Array.from(health.values()).some(isHealthy => !isHealthy);
      },
      severity: AlertSeverity.WARNING,
      category: AlertCategory.SYSTEM,
      cooldown: 5,
      message: (data) => `Layer ${data.layer} is unhealthy: ${data.reason}`,
      metadata: () => {
        const health = agentAnalytics.getAgentHealth();
        const unhealthy = Array.from(health.entries()).find(([_, isHealthy]) => !isHealthy);
        if (unhealthy) {
          const [key] = unhealthy;
          const [agentId, layer] = key.split('-');
          return { agentId, layer, reason: 'Performance degradation detected' };
        }
        return {};
      },
    });
    
    // Token usage alerts
    this.addRule({
      id: 'high-token-usage',
      name: 'High Token Usage',
      condition: async () => {
        const report = await agentAnalytics.generateReport(
          new Date(Date.now() - 3600000),
          new Date()
        );
        return report.summary.totalTokens > 100000; // 100k tokens per hour
      },
      severity: AlertSeverity.WARNING,
      category: AlertCategory.AGENTS,
      cooldown: 60,
      message: (data) => `High token usage: ${data.tokens} tokens in the last hour ($${data.cost})`,
      metadata: async () => {
        const report = await agentAnalytics.generateReport(
          new Date(Date.now() - 3600000),
          new Date()
        );
        return {
          tokens: report.summary.totalTokens,
          cost: report.costAnalysis.totalCost.toFixed(2),
        };
      },
    });
  }
  
  /**
   * Initialize notification channels from environment
   */
  private initializeNotificationChannels() {
    // Email notifications
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      this.notificationChannels.push({
        type: 'email',
        config: {
          to: process.env.ALERT_EMAIL || 'admin@mundo-tango.life',
          from: process.env.SMTP_FROM || 'alerts@mundo-tango.life',
        },
        severities: [AlertSeverity.CRITICAL, AlertSeverity.WARNING],
      });
    }
    
    // Slack webhook
    if (process.env.SLACK_WEBHOOK_URL) {
      this.notificationChannels.push({
        type: 'slack',
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
        },
        severities: [AlertSeverity.CRITICAL, AlertSeverity.WARNING],
      });
    }
    
    // Discord webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      this.notificationChannels.push({
        type: 'discord',
        config: {
          webhookUrl: process.env.DISCORD_WEBHOOK_URL,
        },
        severities: [AlertSeverity.CRITICAL, AlertSeverity.WARNING, AlertSeverity.INFO],
      });
    }
  }
  
  /**
   * Add a new alert rule
   */
  addRule(rule: AlertRule) {
    this.alertRules.set(rule.id, rule);
  }
  
  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string) {
    this.alertRules.delete(ruleId);
  }
  
  /**
   * Start monitoring alert rules
   */
  private startMonitoring() {
    // Check rules every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkAlertRules();
    }, 30000);
  }
  
  /**
   * Check all alert rules
   */
  private async checkAlertRules() {
    for (const [ruleId, rule] of this.alertRules) {
      try {
        // Check cooldown
        const lastAlert = this.lastAlertTime.get(ruleId);
        if (lastAlert) {
          const cooldownMs = rule.cooldown * 60 * 1000;
          if (Date.now() - lastAlert.getTime() < cooldownMs) {
            continue;
          }
        }
        
        // Check condition
        const shouldAlert = await rule.condition();
        
        if (shouldAlert) {
          const metadata = rule.metadata ? rule.metadata() : {};
          const alert: Alert = {
            id: `${ruleId}-${Date.now()}`,
            title: rule.name,
            description: rule.message(metadata),
            severity: rule.severity,
            category: rule.category,
            timestamp: new Date(),
            metadata,
            resolved: false,
          };
          
          await this.triggerAlert(alert, rule);
        }
      } catch (error) {
        console.error(`Error checking alert rule ${ruleId}:`, error);
      }
    }
  }
  
  /**
   * Trigger an alert
   */
  async triggerAlert(alert: Alert, rule: AlertRule) {
    // Store alert
    this.alerts.set(alert.id, alert);
    this.lastAlertTime.set(rule.id, new Date());
    
    // Update metrics
    alertsTriggered.inc({
      severity: alert.severity,
      category: alert.category,
    });
    
    // Emit event
    this.emit('alert', alert);
    
    // Send notifications
    await this.sendNotifications(alert);
    
    console.log(`🚨 Alert triggered: ${alert.title} (${alert.severity})`);
  }
  
  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(alert: Alert) {
    for (const channel of this.notificationChannels) {
      // Check if channel should receive this alert
      if (!channel.severities.includes(alert.severity)) {
        continue;
      }
      
      if (channel.categories && !channel.categories.includes(alert.category)) {
        continue;
      }
      
      try {
        switch (channel.type) {
          case 'email':
            await this.sendEmailNotification(alert, channel.config);
            break;
          case 'slack':
            await this.sendSlackNotification(alert, channel.config);
            break;
          case 'discord':
            await this.sendDiscordNotification(alert, channel.config);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert, channel.config);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel.type} notification:`, error);
      }
    }
  }
  
  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert, config: Record<string, any>) {
    if (!this.emailTransporter) return;
    
    const severityColors = {
      critical: '#ff0000',
      warning: '#ff9900',
      info: '#0066cc',
    };
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severityColors[alert.severity]}; color: white; padding: 20px;">
          <h2 style="margin: 0;">🚨 ${alert.severity.toUpperCase()} Alert</h2>
        </div>
        <div style="padding: 20px; background: #f5f5f5;">
          <h3>${alert.title}</h3>
          <p>${alert.description}</p>
          <div style="background: white; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <strong>Details:</strong>
            <ul>
              <li>Category: ${alert.category}</li>
              <li>Timestamp: ${alert.timestamp.toISOString()}</li>
              ${alert.layer ? `<li>Layer: ${alert.layer}</li>` : ''}
              ${alert.agentId ? `<li>Agent: ${alert.agentId}</li>` : ''}
            </ul>
            ${alert.metadata ? `
              <strong>Metadata:</strong>
              <pre style="background: #f0f0f0; padding: 10px; overflow-x: auto;">
${JSON.stringify(alert.metadata, null, 2)}
              </pre>
            ` : ''}
          </div>
        </div>
        <div style="padding: 10px; background: #333; color: white; text-align: center;">
          <small>ESA LIFE CEO 61x21 Monitoring System</small>
        </div>
      </div>
    `;
    
    await this.emailTransporter.sendMail({
      from: config.from,
      to: config.to,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html,
    });
  }
  
  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert, config: Record<string, any>) {
    const severityEmojis = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️',
    };
    
    const payload = {
      text: `${severityEmojis[alert.severity]} *${alert.severity.toUpperCase()} Alert*`,
      attachments: [
        {
          color: alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'good',
          title: alert.title,
          text: alert.description,
          fields: [
            { title: 'Category', value: alert.category, short: true },
            { title: 'Timestamp', value: alert.timestamp.toISOString(), short: true },
            ...(alert.layer ? [{ title: 'Layer', value: alert.layer.toString(), short: true }] : []),
            ...(alert.agentId ? [{ title: 'Agent', value: alert.agentId, short: true }] : []),
          ],
          footer: 'ESA LIFE CEO 61x21',
          ts: Math.floor(alert.timestamp.getTime() / 1000),
        },
      ],
    };
    
    await axios.post(config.webhookUrl, payload);
  }
  
  /**
   * Send Discord notification
   */
  private async sendDiscordNotification(alert: Alert, config: Record<string, any>) {
    const severityColors = {
      critical: 0xff0000,
      warning: 0xff9900,
      info: 0x0066cc,
    };
    
    const payload = {
      embeds: [
        {
          title: `${alert.severity.toUpperCase()} Alert: ${alert.title}`,
          description: alert.description,
          color: severityColors[alert.severity],
          fields: [
            { name: 'Category', value: alert.category, inline: true },
            { name: 'Timestamp', value: alert.timestamp.toISOString(), inline: true },
            ...(alert.layer ? [{ name: 'Layer', value: alert.layer.toString(), inline: true }] : []),
            ...(alert.agentId ? [{ name: 'Agent', value: alert.agentId, inline: true }] : []),
          ],
          footer: {
            text: 'ESA LIFE CEO 61x21 Monitoring System',
          },
          timestamp: alert.timestamp.toISOString(),
        },
      ],
    };
    
    await axios.post(config.webhookUrl, payload);
  }
  
  /**
   * Send generic webhook notification
   */
  private async sendWebhookNotification(alert: Alert, config: Record<string, any>) {
    await axios.post(config.url, {
      alert,
      timestamp: alert.timestamp.toISOString(),
      framework: 'esa-life-ceo-61x21',
    }, {
      headers: config.headers || {},
    });
  }
  
  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy?: string) {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.acknowledgedBy = resolvedBy;
      
      this.emit('alert-resolved', alert);
      console.log(`✅ Alert resolved: ${alert.title}`);
    }
  }
  
  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Get alert history
   */
  getAlertHistory(hours: number = 24): Alert[] {
    const cutoff = new Date(Date.now() - hours * 3600000);
    return Array.from(this.alerts.values())
      .filter(alert => alert.timestamp > cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Generate alert summary
   */
  getAlertSummary(): {
    active: number;
    critical: number;
    warning: number;
    info: number;
    recentlyResolved: number;
    topCategories: Array<{ category: string; count: number }>;
  } {
    const activeAlerts = this.getActiveAlerts();
    const recentAlerts = this.getAlertHistory(1); // Last hour
    
    const categoryCount = new Map<string, number>();
    activeAlerts.forEach(alert => {
      categoryCount.set(alert.category, (categoryCount.get(alert.category) || 0) + 1);
    });
    
    return {
      active: activeAlerts.length,
      critical: activeAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
      warning: activeAlerts.filter(a => a.severity === AlertSeverity.WARNING).length,
      info: activeAlerts.filter(a => a.severity === AlertSeverity.INFO).length,
      recentlyResolved: recentAlerts.filter(a => a.resolved).length,
      topCategories: Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }
  
  /**
   * Cleanup on shutdown
   */
  destroy() {
    clearInterval(this.checkInterval);
    this.removeAllListeners();
  }
}

// Global alert manager instance
export const alertManager = new AlertManager();

export default alertManager;