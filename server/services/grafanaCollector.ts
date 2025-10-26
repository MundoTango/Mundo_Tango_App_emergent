/**
 * STREAM 1: Observability - Grafana Cloud OTel Collector
 * 
 * Export OpenTelemetry metrics/traces to Grafana Cloud
 * Research: docs/research/TESTING_OBSERVABILITY_RESEARCH.md
 */

import { logger } from '../lib/logger';

export interface GrafanaConfig {
  endpoint: string;
  apiKey: string;
  instanceId: string;
  enabled: boolean;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: Date;
  endTime: Date;
  attributes?: Record<string, any>;
}

/**
 * Grafana Cloud collector for metrics and traces
 */
export class GrafanaCollector {
  private config: GrafanaConfig;
  private metricsBuffer: MetricData[] = [];
  private tracesBuffer: TraceSpan[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<GrafanaConfig> = {}) {
    this.config = {
      endpoint: process.env.GRAFANA_ENDPOINT || 'https://otlp-gateway-prod-us-central-0.grafana.net/otlp',
      apiKey: process.env.GRAFANA_API_KEY || '',
      instanceId: process.env.GRAFANA_INSTANCE_ID || '',
      enabled: false,
      ...config,
    };

    if (this.config.enabled) {
      this.startFlushTimer();
      logger.info('[GrafanaCollector] Initialized and enabled');
    } else {
      logger.info('[GrafanaCollector] Disabled (set ENABLE_OBSERVABILITY=true and GRAFANA_API_KEY)');
    }
  }

  /**
   * Record metric (counter, gauge, histogram)
   */
  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.config.enabled) return;

    this.metricsBuffer.push({
      name,
      value,
      timestamp: new Date(),
      labels,
    });

    // Auto-flush if buffer is large
    if (this.metricsBuffer.length >= 100) {
      this.flushMetrics();
    }
  }

  /**
   * Record trace span
   */
  recordSpan(span: TraceSpan): void {
    if (!this.config.enabled) return;

    this.tracesBuffer.push(span);

    // Auto-flush if buffer is large
    if (this.tracesBuffer.length >= 50) {
      this.flushTraces();
    }
  }

  /**
   * Flush metrics to Grafana Cloud
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const batch = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // Convert to OpenTelemetry format
      const payload = this.convertMetricsToOTLP(batch);

      // Send to Grafana Cloud via OTLP HTTP
      const authHeader = `Basic ${Buffer.from(`${this.config.instanceId}:${this.config.apiKey}`).toString('base64')}`;
      
      const response = await fetch(`${this.config.endpoint}/v1/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      logger.info(`[GrafanaCollector] Successfully flushed ${batch.length} metrics to Grafana Cloud`);
      
    } catch (error) {
      logger.error({ error }, '[GrafanaCollector] Failed to flush metrics');
      // Re-add to buffer on failure
      this.metricsBuffer.push(...batch);
    }
  }

  /**
   * Flush traces to Grafana Cloud
   */
  private async flushTraces(): Promise<void> {
    if (this.tracesBuffer.length === 0) return;

    const batch = [...this.tracesBuffer];
    this.tracesBuffer = [];

    try {
      // Convert to OpenTelemetry format
      const payload = this.convertTracesToOTLP(batch);

      // Send to Grafana Cloud via OTLP HTTP
      const authHeader = `Basic ${Buffer.from(`${this.config.instanceId}:${this.config.apiKey}`).toString('base64')}`;
      
      const response = await fetch(`${this.config.endpoint}/v1/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      logger.info(`[GrafanaCollector] Successfully flushed ${batch.length} traces to Grafana Cloud`);
      
    } catch (error) {
      logger.error({ error }, '[GrafanaCollector] Failed to flush traces');
      this.tracesBuffer.push(...batch);
    }
  }

  /**
   * Convert metrics to OTLP format
   */
  private convertMetricsToOTLP(metrics: MetricData[]): any {
    // Simplified OTLP metric format
    return {
      resourceMetrics: [{
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'mundo-tango' } },
          ],
        },
        scopeMetrics: [{
          metrics: metrics.map(m => ({
            name: m.name,
            gauge: {
              dataPoints: [{
                asDouble: m.value,
                timeUnixNano: m.timestamp.getTime() * 1000000,
                attributes: Object.entries(m.labels || {}).map(([key, value]) => ({
                  key,
                  value: { stringValue: value },
                })),
              }],
            },
          })),
        }],
      }],
    };
  }

  /**
   * Convert traces to OTLP format
   */
  private convertTracesToOTLP(traces: TraceSpan[]): any {
    // Simplified OTLP trace format
    return {
      resourceSpans: [{
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'mundo-tango' } },
          ],
        },
        scopeSpans: [{
          spans: traces.map(t => ({
            traceId: t.traceId,
            spanId: t.spanId,
            parentSpanId: t.parentSpanId,
            name: t.name,
            startTimeUnixNano: t.startTime.getTime() * 1000000,
            endTimeUnixNano: t.endTime.getTime() * 1000000,
            attributes: Object.entries(t.attributes || {}).map(([key, value]) => ({
              key,
              value: { stringValue: String(value) },
            })),
          })),
        }],
      }],
    };
  }

  /**
   * Start auto-flush timer (every 10 seconds)
   */
  private startFlushTimer(): void {
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
      this.flushTraces();
    }, 10000); // 10 seconds
  }

  /**
   * Stop collector and flush remaining data
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    await this.flushMetrics();
    await this.flushTraces();

    logger.info('[GrafanaCollector] Shutdown complete');
  }
}

// Export singleton instance
export const grafanaCollector = new GrafanaCollector();
