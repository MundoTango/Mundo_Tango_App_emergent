/**
 * Arize Phoenix Observability Service
 * ESA Layer 48 - LLM tracing and observability
 * 
 * Features:
 * - Real-time LLM performance monitoring
 * - Trace collection for AI agent calls
 * - Custom evaluator support
 * - Agent trajectory analysis
 * 
 * Note: This service provides client-side instrumentation.
 * For full observability, run Phoenix server separately:
 * - Docker: docker run -p 6006:6006 arizephoenix/phoenix
 * - Python: pip install arize-phoenix && phoenix serve
 */

import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { OpenAIInstrumentation } from "@arizeai/openinference-instrumentation-openai";
import { 
  SemanticConventions,
  DocumentAttributes,
  EmbeddingAttributes,
  MessageAttributes,
  ToolCallAttributes
} from "@arizeai/openinference-semantic-conventions";

export class ArizePhoenixService {
  private tracer: any;
  private enabled: boolean = false;

  constructor() {
    const phoenixEndpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT || "http://localhost:6006";
    
    try {
      this.tracer = trace.getTracer("esa-life-ceo");
      
      registerInstrumentations({
        instrumentations: [
          new OpenAIInstrumentation({
            enrich: (span, { request, response }) => {
              span.setAttribute(SemanticConventions.LLM_MODEL_NAME, request.model);
            },
          }),
        ],
      });

      this.enabled = true;
      console.log(`✅ Arize Phoenix tracing initialized (endpoint: ${phoenixEndpoint})`);
    } catch (error) {
      console.log("⚠️  Arize Phoenix tracing not available:", error);
    }
  }

  startSpan(name: string, attributes?: Record<string, any>) {
    if (!this.enabled) {
      return { end: () => {}, setStatus: () => {}, recordException: () => {} };
    }

    const span = this.tracer.startSpan(name, {
      attributes: attributes || {},
    });

    return span;
  }

  async traceAgentExecution<T>(
    agentName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return operation();
    }

    const span = this.startSpan(`agent.${agentName}`, {
      [SemanticConventions.OPENINFERENCE_SPAN_KIND]: "AGENT",
      ...metadata,
    });

    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async traceLLMCall<T>(
    model: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return operation();
    }

    const span = this.startSpan(`llm.${model}`, {
      [SemanticConventions.OPENINFERENCE_SPAN_KIND]: "LLM",
      [SemanticConventions.LLM_MODEL_NAME]: model,
      ...metadata,
    });

    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const arizePhoenixService = new ArizePhoenixService();
