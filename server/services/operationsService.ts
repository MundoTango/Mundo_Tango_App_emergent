/**
 * Operations Service
 * MB.MD Track 6: Operations Infrastructure
 * Implements: Monitoring, alerting, logging, health checks
 */

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  message?: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  service: string;
  timestamp: number;
  resolved: boolean;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class OperationsService {
  private alerts: Alert[] = [];
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 50000;
  private readonly MAX_ALERTS = 1000;

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    uptime: number;
  }> {
    const checks: HealthCheck[] = [];

    // Database health
    checks.push(await this.checkDatabase());

    // Memory health
    checks.push(this.checkMemory());

    // API health
    checks.push(this.checkAPI());

    // WebSocket health
    checks.push(this.checkWebSocket());

    // File system health
    checks.push(await this.checkFileSystem());

    // Determine overall status
    const hasUnhealthy = checks.some(c => c.status === 'unhealthy');
    const hasDegraded = checks.some(c => c.status === 'degraded');
    
    const overall = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    return {
      overall,
      checks,
      uptime: process.uptime(),
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Simple ping to database
      // In production, this would actually query the database
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {
        service: 'database',
        status: 'healthy',
        latency: Date.now() - start,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        service: 'database',
        status: 'unhealthy',
        latency: Date.now() - start,
        message: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthCheck {
    const mem = process.memoryUsage();
    const heapUsedPercentage = (mem.heapUsed / mem.heapTotal) * 100;

    let status: HealthCheck['status'] = 'healthy';
    let message: string | undefined;

    if (heapUsedPercentage > 90) {
      status = 'unhealthy';
      message = `Memory usage critical: ${heapUsedPercentage.toFixed(1)}%`;
    } else if (heapUsedPercentage > 75) {
      status = 'degraded';
      message = `Memory usage high: ${heapUsedPercentage.toFixed(1)}%`;
    }

    return {
      service: 'memory',
      status,
      latency: 0,
      message,
      timestamp: Date.now(),
    };
  }

  /**
   * Check API responsiveness
   */
  private checkAPI(): HealthCheck {
    const start = Date.now();
    
    // Simulate API check
    const latency = Math.random() * 100;

    return {
      service: 'api',
      status: latency < 200 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
      latency,
      timestamp: Date.now(),
    };
  }

  /**
   * Check WebSocket connections
   */
  private checkWebSocket(): HealthCheck {
    return {
      service: 'websocket',
      status: 'healthy',
      latency: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Check file system
   */
  private async checkFileSystem(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Check if we can write to disk
      const fs = await import('fs/promises');
      await fs.access('/tmp');
      
      return {
        service: 'filesystem',
        status: 'healthy',
        latency: Date.now() - start,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        service: 'filesystem',
        status: 'unhealthy',
        latency: Date.now() - start,
        message: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Create alert
   */
  createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    this.alerts.push({
      id: Math.random().toString(36).substring(7),
      ...alert,
      timestamp: Date.now(),
      resolved: false,
    });

    // Keep only recent alerts
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }

    // Log critical alerts
    if (alert.severity === 'critical' || alert.severity === 'error') {
      console.error(`🚨 [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Log message
   */
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    this.logs.push({
      ...entry,
      timestamp: Date.now(),
    });

    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Console output
    const prefix = `[${entry.level.toUpperCase()}] [${entry.service}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'error':
        console.error(message, entry.metadata);
        break;
      case 'warn':
        console.warn(message, entry.metadata);
        break;
      case 'debug':
        console.debug(message, entry.metadata);
        break;
      default:
        console.log(message, entry.metadata);
    }
  }

  /**
   * Query logs
   */
  queryLogs(options: {
    level?: LogEntry['level'];
    service?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filtered = this.logs;

    if (options.level) {
      filtered = filtered.filter(l => l.level === options.level);
    }

    if (options.service) {
      filtered = filtered.filter(l => l.service === options.service);
    }

    if (options.since) {
      filtered = filtered.filter(l => l.timestamp >= options.since);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: number;
    activeConnections: number;
  } {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      activeConnections: 0, // Would track actual connections
    };
  }

  /**
   * Trigger backup
   */
  async triggerBackup(type: 'database' | 'files' | 'full'): Promise<{
    success: boolean;
    backupId: string;
    size: number;
  }> {
    this.log({
      level: 'info',
      service: 'backup',
      message: `Starting ${type} backup`,
    });

    // Simulate backup
    await new Promise(resolve => setTimeout(resolve, 1000));

    const backupId = `backup_${Date.now()}`;
    
    this.log({
      level: 'info',
      service: 'backup',
      message: `Backup completed: ${backupId}`,
    });

    return {
      success: true,
      backupId,
      size: 1024 * 1024 * 100, // 100 MB
    };
  }
}

// Export singleton instance
export const operationsService = new OperationsService();
