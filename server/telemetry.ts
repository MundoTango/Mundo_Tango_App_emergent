/**
 * OpenTelemetry Setup
 * MB.MD BATCH 1: Grafana Cloud Integration
 * Oct 26, 2025
 * 
 * Exports metrics, traces, and logs to Grafana Cloud via OTLP
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;

export function setupTelemetry() {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  
  if (!endpoint || !headers) {
    console.warn('⚠️ [Telemetry] OTEL environment variables not set - skipping telemetry setup');
    console.warn('   Set OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS to enable Grafana Cloud');
    return;
  }

  try {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'mundo-tango',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'mundo-tango-app',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
    });

    const traceExporter = new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
      headers: parseHeaders(headers),
    });

    const metricExporter = new OTLPMetricExporter({
      url: `${endpoint}/v1/metrics`,
      headers: parseHeaders(headers),
    });

    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10000,
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    sdk.start();
    console.log('✅ [Telemetry] OpenTelemetry initialized - exporting to Grafana Cloud');
    
    process.on('SIGTERM', () => {
      sdk?.shutdown()
        .then(() => console.log('[Telemetry] Shutdown complete'))
        .catch((error) => console.error('[Telemetry] Shutdown error:', error))
        .finally(() => process.exit(0));
    });
  } catch (error) {
    console.error('❌ [Telemetry] Failed to initialize:', error);
  }
}

function parseHeaders(headersString: string): Record<string, string> {
  const headers: Record<string, string> = {};
  headersString.split(',').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      headers[key.trim()] = value.trim();
    }
  });
  return headers;
}

export function shutdownTelemetry() {
  return sdk?.shutdown();
}
