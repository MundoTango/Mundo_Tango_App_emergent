import { z } from 'zod';

// AI Model Types
export type AIModel = 'claude' | 'openai' | 'gemini';

export type CostPriority = 'cheap' | 'balanced' | 'quality';

export type QueryComplexity = 'low' | 'medium' | 'high';

// AI Route Request/Response
export const aiRouteRequestSchema = z.object({
  query: z.string().min(1),
  costPriority: z.enum(['cheap', 'balanced', 'quality']).optional(),
  preferredModel: z.enum(['claude', 'openai', 'gemini']).optional(),
});

export type AIRouteRequest = z.infer<typeof aiRouteRequestSchema>;

export const aiRouteResponseSchema = z.object({
  model: z.enum(['claude-sonnet-4.5', 'gpt-4o', 'gemini-2.5-flash', 'gemini-2.5-pro']),
  content: z.string(),
  complexity: z.enum(['low', 'medium', 'high']),
  routing: z.object({
    costPriority: z.string(),
    estimatedCost: z.number(),
    reasoning: z.string(),
  }),
});

export type AIRouteResponse = z.infer<typeof aiRouteResponseSchema>;

// Ensemble Request/Response
export const ensembleRequestSchema = z.object({
  query: z.string().min(1),
  models: z.array(z.enum(['claude', 'openai', 'gemini'])).min(2).max(3),
  synthesize: z.boolean().optional().default(true),
});

export type EnsembleRequest = z.infer<typeof ensembleRequestSchema>;

export const ensembleResponseSchema = z.object({
  query: z.string(),
  responses: z.array(z.object({
    model: z.string(),
    content: z.string(),
    latency: z.number(),
    confidence: z.number().optional(),
  })),
  synthesis: z.object({
    combined: z.string(),
    consensus: z.number(),
    disagreements: z.array(z.string()),
    recommendation: z.string(),
  }).optional(),
  metadata: z.object({
    totalLatency: z.number(),
    costEstimate: z.number(),
    timestamp: z.string(),
  }),
});

export type EnsembleResponse = z.infer<typeof ensembleResponseSchema>;

// System Status
export const aiStatusResponseSchema = z.object({
  status: z.enum(['operational', 'degraded', 'offline']),
  agents: z.object({
    orchestrator: z.string(),
    router: z.string(),
    ensemble: z.string(),
  }),
  models: z.object({
    claude: z.boolean(),
    openai: z.boolean(),
    gemini: z.boolean(),
  }),
});

export type AIStatusResponse = z.infer<typeof aiStatusResponseSchema>;

// Metrics
export const aiMetricsResponseSchema = z.object({
  totalQueries: z.number(),
  costSavings: z.number(),
  qualityRetention: z.number(),
  averageLatency: z.number(),
  modelUsage: z.object({
    'claude-sonnet-4.5': z.number(),
    'gpt-4o': z.number(),
    'gemini-2.5-pro': z.number(),
  }),
});

export type AIMetricsResponse = z.infer<typeof aiMetricsResponseSchema>;

// UI State Types
export interface ModelPreference {
  preferredModel?: AIModel;
  costPriority: CostPriority;
  autoRoute: boolean;
}

export interface AIQueryState {
  query: string;
  isLoading: boolean;
  response?: AIRouteResponse;
  error?: string;
}

export interface ParallelConsultationState {
  query: string;
  selectedModels: AIModel[];
  responses: Map<AIModel, {
    content: string;
    latency: number;
    isLoading: boolean;
    error?: string;
  }>;
}

export interface EnsembleSynthesisState {
  query: string;
  responses: Array<{
    model: string;
    content: string;
    confidence?: number;
  }>;
  synthesis?: {
    combined: string;
    consensus: number;
    disagreements: string[];
  };
  isLoading: boolean;
}

// Analytics Types
export interface CostSavingsData {
  date: string;
  baseline: number;
  actual: number;
  savings: number;
}

export interface ModelUsageData {
  model: string;
  count: number;
  percentage: number;
  avgCost: number;
}

export interface LatencyData {
  model: string;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
}
