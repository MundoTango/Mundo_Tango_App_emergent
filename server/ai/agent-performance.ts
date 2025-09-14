/**
 * ESA LIFE CEO 61x21 - Agent Performance Optimization (Phase 12)
 * High-performance layer for 61-agent system
 */

import { cacheManager } from '../lib/cache-manager';
import OpenAI from 'openai';
import pLimit from 'p-limit';

// Agent request queue configuration
const AGENT_CONFIG = {
  MAX_CONCURRENT_REQUESTS: 5,
  BATCH_SIZE: 10,
  BATCH_DELAY: 100, // ms
  CACHE_TTL: 3600, // 1 hour
  PRIORITY_LEVELS: {
    CRITICAL: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3
  }
};

// Priority queue for agent requests
class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    const queueItem = { item, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > priority) {
        this.items.splice(i, 0, queueItem);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueItem);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Agent request interface
interface AgentRequest {
  id: string;
  agentId: string;
  prompt: string;
  context?: any;
  userId?: string;
  priority?: number;
  timestamp: number;
}

interface AgentResponse {
  id: string;
  agentId: string;
  response: string;
  metadata?: any;
  cached?: boolean;
  processingTime?: number;
}

// ============= Agent Performance Manager =============
export class AgentPerformanceManager {
  private static instance: AgentPerformanceManager;
  private queue: PriorityQueue<AgentRequest>;
  private processing: boolean = false;
  private batchBuffer: AgentRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private concurrencyLimit: any;
  private metrics: AgentMetrics;
  private agentPool: Map<string, AgentInstance>;
  private openai: OpenAI;

  private constructor() {
    this.queue = new PriorityQueue();
    this.concurrencyLimit = pLimit(AGENT_CONFIG.MAX_CONCURRENT_REQUESTS);
    this.metrics = new AgentMetrics();
    this.agentPool = new Map();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Start processing loop
    this.startProcessingLoop();
  }

  static getInstance(): AgentPerformanceManager {
    if (!AgentPerformanceManager.instance) {
      AgentPerformanceManager.instance = new AgentPerformanceManager();
    }
    return AgentPerformanceManager.instance;
  }

  // ============= Request Processing =============
  
  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = await cacheManager.getAIResponse(request.prompt, request.agentId);
    
    if (cached) {
      this.metrics.recordCacheHit();
      return {
        id: request.id,
        agentId: request.agentId,
        response: cached,
        cached: true,
        processingTime: Date.now() - startTime
      };
    }

    // Add to priority queue
    return new Promise((resolve) => {
      const priority = request.priority || AGENT_CONFIG.PRIORITY_LEVELS.NORMAL;
      
      // Store resolver for later
      (request as any).resolver = resolve;
      (request as any).startTime = startTime;
      
      this.queue.enqueue(request, priority);
      this.metrics.recordQueueAdd();
    });
  }

  private async startProcessingLoop() {
    setInterval(async () => {
      if (this.processing || this.queue.isEmpty()) return;
      
      this.processing = true;
      await this.processBatch();
      this.processing = false;
    }, 50); // Check every 50ms
  }

  private async processBatch() {
    const batch: AgentRequest[] = [];
    const maxBatch = AGENT_CONFIG.BATCH_SIZE;
    
    while (!this.queue.isEmpty() && batch.length < maxBatch) {
      const request = this.queue.dequeue();
      if (request) batch.push(request);
    }

    if (batch.length === 0) return;

    // Process batch in parallel with concurrency limit
    const results = await Promise.all(
      batch.map(request => 
        this.concurrencyLimit(() => this.processS ingleRequest(request))
      )
    );

    // Resolve promises
    results.forEach((result, index) => {
      const request = batch[index] as any;
      if (request.resolver) {
        request.resolver({
          ...result,
          processingTime: Date.now() - request.startTime
        });
      }
    });
  }

  private async processSingleRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Get or create agent instance
      const agent = this.getAgentInstance(request.agentId);
      
      // Process with agent
      const response = await agent.process(request.prompt, request.context);
      
      // Cache response
      await cacheManager.setAIResponse(
        request.prompt,
        request.agentId,
        response
      );
      
      this.metrics.recordSuccess();
      
      return {
        id: request.id,
        agentId: request.agentId,
        response,
        cached: false
      };
    } catch (error) {
      this.metrics.recordError();
      console.error(`[Agent ${request.agentId}] Processing error:`, error);
      
      return {
        id: request.id,
        agentId: request.agentId,
        response: 'I apologize, but I encountered an error processing your request.',
        metadata: { error: true }
      };
    }
  }

  // ============= Agent Instance Management =============
  
  private getAgentInstance(agentId: string): AgentInstance {
    if (!this.agentPool.has(agentId)) {
      this.agentPool.set(agentId, new AgentInstance(agentId, this.openai));
    }
    
    const agent = this.agentPool.get(agentId)!;
    agent.updateLastUsed();
    
    // Cleanup old agents
    this.cleanupUnusedAgents();
    
    return agent;
  }

  private cleanupUnusedAgents() {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    
    for (const [id, agent] of this.agentPool.entries()) {
      if (now - agent.lastUsed > maxAge) {
        agent.cleanup();
        this.agentPool.delete(id);
        this.metrics.recordAgentCleanup();
      }
    }
  }

  // ============= Batch Processing =============
  
  async processBatchRequest(requests: AgentRequest[]): Promise<AgentResponse[]> {
    // Group by agent for efficient processing
    const groupedByAgent = new Map<string, AgentRequest[]>();
    
    requests.forEach(req => {
      if (!groupedByAgent.has(req.agentId)) {
        groupedByAgent.set(req.agentId, []);
      }
      groupedByAgent.get(req.agentId)!.push(req);
    });

    // Process each agent's batch in parallel
    const results: AgentResponse[] = [];
    
    for (const [agentId, agentRequests] of groupedByAgent) {
      const agent = this.getAgentInstance(agentId);
      const batchResponses = await agent.processBatch(agentRequests);
      results.push(...batchResponses);
    }

    return results;
  }

  // ============= Cache Management =============
  
  private generateCacheKey(request: AgentRequest): string {
    const base = `${request.agentId}:${request.prompt}`;
    if (request.context) {
      return `${base}:${JSON.stringify(request.context)}`;
    }
    return base;
  }

  async warmCache(agentId: string, prompts: string[]) {
    console.log(`[Agent Performance] Warming cache for ${agentId}...`);
    
    const agent = this.getAgentInstance(agentId);
    
    for (const prompt of prompts) {
      const cached = await cacheManager.getAIResponse(prompt, agentId);
      if (!cached) {
        try {
          const response = await agent.process(prompt, {});
          await cacheManager.setAIResponse(prompt, agentId, response);
        } catch (error) {
          console.error(`Cache warming failed for prompt: ${prompt}`, error);
        }
      }
    }
  }

  // ============= Performance Metrics =============
  
  getMetrics(): any {
    return this.metrics.getSnapshot();
  }

  resetMetrics() {
    this.metrics.reset();
  }
}

// ============= Agent Instance Class =============
class AgentInstance {
  id: string;
  lastUsed: number;
  private openai: OpenAI;
  private systemPrompt: string;
  private memoryBuffer: string[] = [];
  private maxMemorySize = 10;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this.openai = openai;
    this.lastUsed = Date.now();
    this.systemPrompt = this.getSystemPrompt(id);
  }

  async process(prompt: string, context: any): Promise<string> {
    try {
      // Build messages with memory context
      const messages: any[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      // Add memory context if available
      if (this.memoryBuffer.length > 0) {
        messages.push({
          role: 'system',
          content: `Previous context: ${this.memoryBuffer.join(' ')}`
        });
      }

      // Add user prompt
      messages.push({ role: 'user', content: prompt });

      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Update memory buffer
      this.updateMemory(prompt, response);
      
      return response;
    } catch (error) {
      console.error(`[Agent ${this.id}] Process error:`, error);
      throw error;
    }
  }

  async processBatch(requests: AgentRequest[]): Promise<AgentResponse[]> {
    // Process in smaller chunks to avoid API limits
    const chunkSize = 5;
    const results: AgentResponse[] = [];
    
    for (let i = 0; i < requests.length; i += chunkSize) {
      const chunk = requests.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(async (req) => {
          const response = await this.process(req.prompt, req.context);
          return {
            id: req.id,
            agentId: req.agentId,
            response,
            cached: false
          };
        })
      );
      results.push(...chunkResults);
    }
    
    return results;
  }

  updateLastUsed() {
    this.lastUsed = Date.now();
  }

  updateMemory(prompt: string, response: string) {
    const summary = `Q: ${prompt.substring(0, 50)}... A: ${response.substring(0, 50)}...`;
    this.memoryBuffer.push(summary);
    
    if (this.memoryBuffer.length > this.maxMemorySize) {
      this.memoryBuffer.shift();
    }
  }

  cleanup() {
    this.memoryBuffer = [];
  }

  private getSystemPrompt(agentId: string): string {
    // Return appropriate system prompt based on agent ID
    const prompts: Record<string, string> = {
      'health-advisor': 'You are a supportive health and wellness advisor...',
      'career-coach': 'You are a strategic career development coach...',
      'financial-advisor': 'You are a knowledgeable financial advisor...',
      // Add more agent prompts as needed
    };
    
    return prompts[agentId] || 'You are a helpful AI assistant.';
  }
}

// ============= Metrics Tracking =============
class AgentMetrics {
  private metrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    successCount: 0,
    errorCount: 0,
    queueSize: 0,
    averageProcessingTime: 0,
    agentCleanups: 0,
    processingTimes: [] as number[]
  };

  recordCacheHit() {
    this.metrics.cacheHits++;
    this.metrics.totalRequests++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordSuccess() {
    this.metrics.successCount++;
  }

  recordError() {
    this.metrics.errorCount++;
  }

  recordQueueAdd() {
    this.metrics.queueSize++;
  }

  recordProcessingTime(time: number) {
    this.metrics.processingTimes.push(time);
    if (this.metrics.processingTimes.length > 100) {
      this.metrics.processingTimes.shift();
    }
    
    const sum = this.metrics.processingTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageProcessingTime = sum / this.metrics.processingTimes.length;
  }

  recordAgentCleanup() {
    this.metrics.agentCleanups++;
  }

  getSnapshot() {
    const cacheHitRate = this.metrics.totalRequests > 0
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100
      : 0;

    return {
      ...this.metrics,
      cacheHitRate: cacheHitRate.toFixed(2) + '%',
      timestamp: new Date().toISOString()
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      successCount: 0,
      errorCount: 0,
      queueSize: 0,
      averageProcessingTime: 0,
      agentCleanups: 0,
      processingTimes: []
    };
  }
}

// Export singleton instance
export const agentPerformance = AgentPerformanceManager.getInstance();