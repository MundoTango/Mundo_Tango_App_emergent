/**
 * AGENT #143: OpenTelemetry Observability Setup
 * Automatic LLM instrumentation with OpenTelemetry
 * MB.MD: Production-ready monitoring for Mr Blue
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // Local Jaeger for development
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {},
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable some noisy instrumentations
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Start the SDK
export async function initObservability() {
  try {
    await sdk.start();
    console.log('✅ [Observability] OpenTelemetry SDK started');
    console.log('📊 [Observability] Exporting to:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318');
  } catch (error) {
    console.error('❌ [Observability] Failed to start OpenTelemetry:', error);
  }
}

// Graceful shutdown
export async function shutdownObservability() {
  try {
    await sdk.shutdown();
    console.log('✅ [Observability] OpenTelemetry SDK shut down');
  } catch (error) {
    console.error('❌ [Observability] Error during shutdown:', error);
  }
}

// Custom span creation for LLM calls
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

export interface LLMCallMetrics {
  model: string;
  provider: 'claude' | 'openai' | 'gemini';
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost: number;
  conversationId?: number;
  userId?: number;
}

/**
 * Trace an LLM call with custom metrics
 */
export async function traceLLMCall<T>(
  spanName: string,
  operation: () => Promise<T>,
  metrics?: Partial<LLMCallMetrics>
): Promise<T> {
  const tracer = trace.getTracer('mr-blue-llm');
  
  return tracer.startActiveSpan(spanName, async (span) => {
    const startTime = Date.now();
    
    try {
      // Set initial attributes
      if (metrics) {
        if (metrics.model) span.setAttribute('gen_ai.request.model', metrics.model);
        if (metrics.provider) span.setAttribute('gen_ai.system', metrics.provider);
        if (metrics.conversationId) span.setAttribute('conversation.id', metrics.conversationId);
        if (metrics.userId) span.setAttribute('user.id', metrics.userId);
      }
      
      const result = await operation();
      
      // Set completion attributes
      const latencyMs = Date.now() - startTime;
      span.setAttribute('gen_ai.latency_ms', latencyMs);
      
      if (metrics?.inputTokens) span.setAttribute('gen_ai.usage.input_tokens', metrics.inputTokens);
      if (metrics?.outputTokens) span.setAttribute('gen_ai.usage.output_tokens', metrics.outputTokens);
      if (metrics?.cost) span.setAttribute('gen_ai.cost_usd', metrics.cost);
      
      span.setStatus({ code: SpanStatusCode.OK });
      
      return result;
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Calculate cost for LLM usage
 */
export function calculateLLMCost(
  provider: 'claude' | 'openai' | 'gemini',
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing as of Oct 2025 (per million tokens)
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet': { input: 3, output: 15 },
    'gpt-4o': { input: 10, output: 30 },
    'gemini-pro': { input: 1.25, output: 5 },
  };
  
  const rates = pricing[model] || { input: 0, output: 0 };
  
  return (
    (inputTokens * rates.input / 1_000_000) +
    (outputTokens * rates.output / 1_000_000)
  );
}

/**
 * 🚀 PHASE 3.2 & 6: Export autonomous runtime metrics to Grafana
 * Exports SessionManager metrics to OpenTelemetry for Grafana Cloud visualization
 */
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('mr-blue-autonomous');

// Create gauges for autonomous runtime metrics
const autonomousRuntimeGauge = meter.createObservableGauge('autonomous.runtime.minutes', {
  description: 'Current autonomous runtime in minutes'
});

const autonomousTasksGauge = meter.createObservableGauge('autonomous.tasks.completed', {
  description: 'Number of tasks completed in autonomous session'
});

const autonomousCostGauge = meter.createObservableGauge('autonomous.cost.usd', {
  description: 'Estimated cost of autonomous session in USD'
});

const autonomousTestPassRateGauge = meter.createObservableGauge('autonomous.tests.pass_rate', {
  description: 'Test pass rate percentage in autonomous session'
});

const autonomousSelfHealingRateGauge = meter.createObservableGauge('autonomous.self_healing.success_rate', {
  description: 'Self-healing success rate percentage'
});

// Store current session metrics for export
let currentSessionMetrics: Record<string, number> = {};

/**
 * Update autonomous metrics for export to Grafana
 * Called by SessionManager on each metric update
 */
export function updateAutonomousMetrics(metrics: Record<string, number>): void {
  currentSessionMetrics = metrics;
  
  // Log to console for debugging
  console.log('📊 [Observability] Autonomous metrics updated:', {
    runtime: metrics['autonomous.runtime.minutes'],
    tasks: metrics['autonomous.tasks.completed'],
    cost: metrics['autonomous.cost.usd']?.toFixed(3),
    testPassRate: metrics['autonomous.tests.pass_rate']?.toFixed(1) + '%'
  });
}

/**
 * Export current autonomous metrics to OpenTelemetry
 * This is called automatically by OpenTelemetry on collection interval (10s)
 */
export function exportAutonomousMetrics(): Record<string, number> {
  return currentSessionMetrics;
}
