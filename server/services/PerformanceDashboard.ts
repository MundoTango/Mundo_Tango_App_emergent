/**
 * TRACK 6: Performance Monitoring Dashboard
 * Agent #66 - Performance Intelligence
 * 
 * Real-time metrics, analytics, alerts
 */

interface PerformanceMetric {
  timestamp: Date;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
}

export class PerformanceDashboard {
  private metrics: PerformanceMetric[] = [];
  private alerts: Alert[] = [];
  private readonly MAX_METRICS = 10000;
  private readonly MAX_ALERTS = 1000;

  /**
   * Record performance metric
   */
  recordMetric(metric: string, value: number, unit: string, tags?: Record<string, string>) {
    const entry: PerformanceMetric = {
      timestamp: new Date(),
      metric,
      value,
      unit,
      tags
    };

    this.metrics.push(entry);

    // Maintain max size
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Check thresholds and create alerts
    this.checkThresholds(entry);
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric) {
    const thresholds: Record<string, { warning: number; critical: number }> = {
      'api.response_time': { warning: 1000, critical: 3000 },
      'db.query_time': { warning: 500, critical: 2000 },
      'memory.usage': { warning: 80, critical: 95 },
      'cpu.usage': { warning: 70, critical: 90 },
      'lcp': { warning: 2500, critical: 4000 },
      'fid': { warning: 100, critical: 300 }
    };

    const threshold = thresholds[metric.metric];
    if (!threshold) return;

    let severity: 'info' | 'warning' | 'critical' | null = null;
    let thresholdValue = 0;

    if (metric.value >= threshold.critical) {
      severity = 'critical';
      thresholdValue = threshold.critical;
    } else if (metric.value >= threshold.warning) {
      severity = 'warning';
      thresholdValue = threshold.warning;
    }

    if (severity) {
      this.createAlert({
        severity,
        message: `${metric.metric} exceeded ${severity} threshold`,
        metric: metric.metric,
        threshold: thresholdValue,
        currentValue: metric.value
      });
    }
  }

  /**
   * Create alert
   */
  private createAlert(params: Omit<Alert, 'id' | 'timestamp'>) {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...params,
      timestamp: new Date()
    };

    this.alerts.push(alert);

    // Maintain max size
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.shift();
    }

    // Log based on severity
    if (alert.severity === 'critical') {
      console.error(`🚨 [Performance] CRITICAL: ${alert.message} (${alert.currentValue} > ${alert.threshold})`);
    } else if (alert.severity === 'warning') {
      console.warn(`⚠️ [Performance] WARNING: ${alert.message} (${alert.currentValue} > ${alert.threshold})`);
    }
  }

  /**
   * Get metrics summary
   */
  getSummary(timeWindowMinutes: number = 5): Record<string, any> {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    const summary: Record<string, any> = {};

    // Group by metric name
    const grouped = recentMetrics.reduce((acc, m) => {
      if (!acc[m.metric]) acc[m.metric] = [];
      acc[m.metric].push(m.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate stats
    for (const [metric, values] of Object.entries(grouped)) {
      summary[metric] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        current: values[values.length - 1]
      };
    }

    return summary;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    const cutoff = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
    return this.alerts.filter(a => a.timestamp >= cutoff);
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    return {
      summary: this.getSummary(),
      alerts: this.getActiveAlerts(),
      metrics: this.metrics.slice(-100), // Last 100 metrics
      timestamp: new Date()
    };
  }
}

export const performanceDashboard = new PerformanceDashboard();
