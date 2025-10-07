import { Langfuse } from "langfuse";

/**
 * Langfuse Prompt Management Service
 * ESA Layer 32 - Prompt engineering, versioning, and LLM observability
 * 
 * Features:
 * - Prompt versioning and management
 * - LLM call tracing and observability
 * - A/B testing for prompts
 * - Production prompt analytics
 */

export class LangfuseService {
  private langfuse: Langfuse | null = null;
  private enabled: boolean = false;

  constructor() {
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const baseUrl = process.env.LANGFUSE_BASE_URL;

    if (publicKey && secretKey) {
      this.langfuse = new Langfuse({
        publicKey,
        secretKey,
        baseUrl: baseUrl || "https://cloud.langfuse.com",
        flushAt: 1, // Send events immediately
      });
      this.enabled = true;
      console.log("✅ Langfuse initialized for prompt management");
    } else {
      console.log("⚠️  Langfuse not configured (LANGFUSE_PUBLIC_KEY/SECRET_KEY missing)");
    }
  }

  createTrace(name: string, metadata?: Record<string, any>) {
    if (!this.enabled || !this.langfuse) {
      return {
        span: () => ({ end: () => {} }),
        update: () => {},
        event: () => {}
      };
    }

    return this.langfuse.trace({
      name,
      metadata,
      timestamp: new Date(),
    });
  }

  async generation(params: {
    name: string;
    model: string;
    input: any;
    output?: any;
    metadata?: Record<string, any>;
    promptName?: string;
    promptVersion?: number;
  }) {
    if (!this.enabled || !this.langfuse) {
      return null;
    }

    return this.langfuse.generation({
      name: params.name,
      model: params.model,
      input: params.input,
      output: params.output,
      metadata: params.metadata,
      promptName: params.promptName,
      promptVersion: params.promptVersion,
    });
  }

  async getPrompt(name: string, version?: number): Promise<any> {
    if (!this.enabled || !this.langfuse) {
      console.warn("Langfuse not enabled, returning null prompt");
      return null;
    }

    try {
      const prompt = await this.langfuse.getPrompt(name, version);
      return prompt;
    } catch (error) {
      console.error(`Failed to fetch prompt "${name}":`, error);
      return null;
    }
  }

  async flush(): Promise<void> {
    if (!this.enabled || !this.langfuse) {
      return;
    }

    await this.langfuse.flushAsync();
  }

  async shutdown(): Promise<void> {
    if (!this.enabled || !this.langfuse) {
      return;
    }

    await this.langfuse.shutdownAsync();
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const langfuseService = new LangfuseService();
