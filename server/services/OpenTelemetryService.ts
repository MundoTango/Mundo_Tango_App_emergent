import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

/**
 * OpenTelemetry Observability Service (Phase 4)
 * ESA Layer 48 - Distributed tracing and metrics
 * 
 * Features:
 * - Automatic instrumentation for HTTP, Express, PostgreSQL
 * - Distributed tracing across services
 * - Metrics collection and export
 * - Performance monitoring
 */

export class OpenTelemetryService {
  private sdk: NodeSDK | null = null;
  private initialized: boolean = false;
  private prometheusExporter: PrometheusExporter | null = null;

  isEnabled(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    try {
      // Create Prometheus exporter for metrics
      this.prometheusExporter = new PrometheusExporter({
        port: 9464,
      }, () => {
        console.log("📊 Prometheus metrics available at http://localhost:9464/metrics");
      });

      // Configure OpenTelemetry SDK
      this.sdk = new NodeSDK({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: "life-ceo-platform",
          [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
        }),
        metricReader: this.prometheusExporter,
        instrumentations: [
          getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": {
              enabled: false, // Disable FS instrumentation (too noisy)
            },
            "@opentelemetry/instrumentation-http": {
              enabled: true,
            },
            "@opentelemetry/instrumentation-express": {
              enabled: true,
            },
            "@opentelemetry/instrumentation-pg": {
              enabled: true,
            },
          }),
        ],
      });

      await this.sdk.start();
      this.initialized = true;
      console.log("✅ OpenTelemetry instrumentation active");
    } catch (error) {
      console.error("❌ Failed to initialize OpenTelemetry:", error);
      this.initialized = false;
    }
  }

  async shutdown(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
      this.initialized = false;
      console.log("✅ OpenTelemetry shutdown complete");
    }
  }

  getPrometheusMetricsEndpoint(): string {
    return "http://localhost:9464/metrics";
  }
}

export const openTelemetryService = new OpenTelemetryService();
