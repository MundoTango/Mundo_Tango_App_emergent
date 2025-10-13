/**
 * Multi-Agent Learning Network
 * MB.MD PHASE 6 - TRACK 25
 * 
 * Federated learning system where agents learn from each other
 */

import { EventEmitter } from 'events';

interface LearningData {
  agentId: number;
  pattern: string;
  confidence: number;
  data: any;
  timestamp: Date;
}

interface SharedKnowledge {
  id: string;
  pattern: string;
  sources: number[]; // Agent IDs that contributed
  aggregatedConfidence: number;
  data: any;
  learnedAt: Date;
}

interface TrainingJob {
  id: string;
  agentIds: number[];
  dataset: any[];
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
}

export class MultiAgentLearningNetwork extends EventEmitter {
  private learningData: Map<number, LearningData[]> = new Map();
  private sharedKnowledge: Map<string, SharedKnowledge> = new Map();
  private trainingJobs: Map<string, TrainingJob> = new Map();

  /**
   * Agent shares learning with network
   */
  async shareLearning(data: Omit<LearningData, 'timestamp'>): Promise<string> {
    const learning: LearningData = {
      ...data,
      timestamp: new Date()
    };

    // Store agent's learning
    if (!this.learningData.has(data.agentId)) {
      this.learningData.set(data.agentId, []);
    }
    this.learningData.get(data.agentId)!.push(learning);

    console.log(`📚 [Multi-Agent Learning] Agent #${data.agentId} shared: ${data.pattern} (confidence: ${(data.confidence * 100).toFixed(1)}%)`);

    // Check if this pattern is being learned by other agents
    const knowledgeId = await this.aggregateKnowledge(data.pattern);
    
    this.emit('knowledge-shared', { agentId: data.agentId, pattern: data.pattern, knowledgeId });

    return knowledgeId;
  }

  /**
   * Aggregate knowledge from multiple agents
   */
  private async aggregateKnowledge(pattern: string): Promise<string> {
    // Find all agents that have learned this pattern
    const contributors: number[] = [];
    const confidences: number[] = [];
    const dataPoints: any[] = [];

    for (const [agentId, learnings] of this.learningData.entries()) {
      const relevantLearning = learnings.find(l => l.pattern === pattern);
      if (relevantLearning) {
        contributors.push(agentId);
        confidences.push(relevantLearning.confidence);
        dataPoints.push(relevantLearning.data);
      }
    }

    // Calculate aggregated confidence (weighted average)
    const aggregatedConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    // Create or update shared knowledge
    const knowledgeId = `knowledge-${pattern}`;
    
    const knowledge: SharedKnowledge = {
      id: knowledgeId,
      pattern,
      sources: contributors,
      aggregatedConfidence,
      data: this.mergeDataPoints(dataPoints),
      learnedAt: new Date()
    };

    this.sharedKnowledge.set(knowledgeId, knowledge);

    if (contributors.length > 1) {
      console.log(`🤝 [Multi-Agent Learning] Knowledge aggregated: ${pattern} from ${contributors.length} agents (confidence: ${(aggregatedConfidence * 100).toFixed(1)}%)`);
    }

    return knowledgeId;
  }

  /**
   * Start federated training job
   */
  async startFederatedTraining(agentIds: number[], dataset: any[]): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: TrainingJob = {
      id: jobId,
      agentIds,
      dataset,
      status: 'pending',
      progress: 0
    };

    this.trainingJobs.set(jobId, job);

    console.log(`🎓 [Federated Training] Starting job ${jobId} with ${agentIds.length} agents`);

    // Execute training asynchronously
    this.executeFederatedTraining(jobId).catch(error => {
      console.error(`❌ [Federated Training] Job ${jobId} failed:`, error);
      job.status = 'failed';
    });

    return jobId;
  }

  /**
   * Execute federated training
   */
  private async executeFederatedTraining(jobId: string): Promise<void> {
    const job = this.trainingJobs.get(jobId);
    if (!job) return;

    job.status = 'training';
    job.startedAt = new Date();

    // Split dataset among agents
    const dataPerAgent = Math.ceil(job.dataset.length / job.agentIds.length);
    
    for (let i = 0; i < job.agentIds.length; i++) {
      const agentId = job.agentIds[i];
      const startIdx = i * dataPerAgent;
      const endIdx = Math.min(startIdx + dataPerAgent, job.dataset.length);
      const agentData = job.dataset.slice(startIdx, endIdx);

      // Simulate agent training on local data
      console.log(`  Agent #${agentId} training on ${agentData.length} samples...`);
      await this.trainAgentLocally(agentId, agentData);

      // Update progress
      job.progress = ((i + 1) / job.agentIds.length) * 100;
      this.emit('training-progress', { jobId, progress: job.progress });
    }

    // Aggregate learnings
    await this.aggregateAgentLearnings(job.agentIds);

    job.status = 'completed';
    job.completedAt = new Date();
    job.progress = 100;

    console.log(`✅ [Federated Training] Job ${jobId} completed`);
    this.emit('training-completed', { jobId });
  }

  /**
   * Train single agent on local data
   */
  private async trainAgentLocally(agentId: number, data: any[]): Promise<void> {
    // Simulate local training
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract patterns from data
    const patterns = this.extractPatterns(data);
    
    // Store learnings
    for (const pattern of patterns) {
      await this.shareLearning({
        agentId,
        pattern: pattern.name,
        confidence: pattern.confidence,
        data: pattern.data
      });
    }
  }

  /**
   * Extract patterns from training data
   */
  private extractPatterns(data: any[]): Array<{ name: string; confidence: number; data: any }> {
    // Simplified pattern extraction
    const patterns: Array<{ name: string; confidence: number; data: any }> = [];
    
    // Example: API performance patterns
    if (data.some(d => d.responseTime)) {
      const avgResponseTime = data.reduce((sum, d) => sum + (d.responseTime || 0), 0) / data.length;
      patterns.push({
        name: 'api-response-pattern',
        confidence: 0.85,
        data: { avgResponseTime, samples: data.length }
      });
    }

    // Example: Cache patterns
    if (data.some(d => d.cacheHit !== undefined)) {
      const hitRate = data.filter(d => d.cacheHit).length / data.length;
      patterns.push({
        name: 'cache-hit-pattern',
        confidence: 0.90,
        data: { hitRate, samples: data.length }
      });
    }

    return patterns;
  }

  /**
   * Aggregate learnings from multiple agents
   */
  private async aggregateAgentLearnings(agentIds: number[]): Promise<void> {
    const allPatterns = new Set<string>();

    // Collect all unique patterns
    for (const agentId of agentIds) {
      const learnings = this.learningData.get(agentId) || [];
      learnings.forEach(l => allPatterns.add(l.pattern));
    }

    // Aggregate each pattern
    for (const pattern of allPatterns) {
      await this.aggregateKnowledge(pattern);
    }
  }

  /**
   * Merge data points from multiple agents
   */
  private mergeDataPoints(dataPoints: any[]): any {
    if (dataPoints.length === 0) return {};
    if (dataPoints.length === 1) return dataPoints[0];

    // Merge strategy depends on data structure
    const merged: any = {};
    
    for (const data of dataPoints) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number') {
          // Average numeric values
          merged[key] = (merged[key] || 0) + value / dataPoints.length;
        } else if (Array.isArray(value)) {
          // Concatenate arrays
          merged[key] = [...(merged[key] || []), ...value];
        } else {
          // Keep latest value for other types
          merged[key] = value;
        }
      }
    }

    return merged;
  }

  /**
   * Transfer knowledge to specific agent
   */
  async transferKnowledge(fromAgentId: number, toAgentId: number, pattern: string): Promise<boolean> {
    const sourceLearnings = this.learningData.get(fromAgentId) || [];
    const learning = sourceLearnings.find(l => l.pattern === pattern);

    if (!learning) {
      console.log(`❌ [Knowledge Transfer] Agent #${fromAgentId} has no knowledge of ${pattern}`);
      return false;
    }

    // Transfer knowledge
    await this.shareLearning({
      agentId: toAgentId,
      pattern: learning.pattern,
      confidence: learning.confidence * 0.9, // Slightly reduce confidence for transferred knowledge
      data: learning.data
    });

    console.log(`🔄 [Knowledge Transfer] Transferred ${pattern} from Agent #${fromAgentId} to Agent #${toAgentId}`);
    return true;
  }

  /**
   * Get network statistics
   */
  getStats() {
    const totalLearnings = Array.from(this.learningData.values())
      .reduce((sum, learnings) => sum + learnings.length, 0);
    
    const activeAgents = this.learningData.size;
    const sharedKnowledgeCount = this.sharedKnowledge.size;
    const completedJobs = Array.from(this.trainingJobs.values())
      .filter(j => j.status === 'completed').length;

    return {
      activeAgents,
      totalLearnings,
      sharedKnowledgeCount,
      completedTrainingJobs: completedJobs,
      activeTrainingJobs: Array.from(this.trainingJobs.values())
        .filter(j => j.status === 'training').length
    };
  }

  /**
   * Get shared knowledge by pattern
   */
  getSharedKnowledge(pattern: string): SharedKnowledge | undefined {
    return this.sharedKnowledge.get(`knowledge-${pattern}`);
  }

  /**
   * Get training job status
   */
  getTrainingJobStatus(jobId: string): TrainingJob | undefined {
    return this.trainingJobs.get(jobId);
  }
}

export const multiAgentLearning = new MultiAgentLearningNetwork();
