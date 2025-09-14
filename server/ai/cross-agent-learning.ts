// ESA LIFE CEO 61x21 - Cross-Agent Learning System (Layer 47: Advanced AI Features)
import { Pool } from 'pg';
import { redisClient } from '../services/cache';
import { EventEmitter } from 'events';

export interface AgentMemory {
  agentId: string;
  userId: number;
  timestamp: Date;
  context: any;
  insights: AgentInsight[];
  interactions: AgentInteraction[];
  metadata?: Record<string, any>;
}

export interface AgentInsight {
  type: string;
  content: string;
  confidence: number;
  source: string;
  timestamp: Date;
  relatedAgents?: string[];
}

export interface AgentInteraction {
  fromAgent: string;
  toAgent: string;
  type: 'query' | 'response' | 'collaboration' | 'delegation';
  content: any;
  result?: any;
  timestamp: Date;
}

export interface SharedKnowledge {
  id: string;
  type: 'fact' | 'pattern' | 'preference' | 'behavior' | 'goal';
  content: any;
  confidence: number;
  sources: string[];
  validFrom: Date;
  validUntil?: Date;
  userId?: number;
}

export interface AgentCollaboration {
  id: string;
  initiator: string;
  participants: string[];
  goal: string;
  status: 'active' | 'completed' | 'failed';
  tasks: CollaborationTask[];
  result?: any;
  startTime: Date;
  endTime?: Date;
}

export interface CollaborationTask {
  id: string;
  assignedTo: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies?: string[];
  result?: any;
  startTime?: Date;
  endTime?: Date;
}

export interface LearningMetrics {
  agentId: string;
  successRate: number;
  avgResponseTime: number;
  knowledgeContributions: number;
  collaborations: number;
  improvementRate: number;
  lastUpdated: Date;
}

export class CrossAgentLearningSystem extends EventEmitter {
  private pool: Pool;
  private sharedMemory: Map<string, SharedKnowledge> = new Map();
  private agentMemories: Map<string, AgentMemory[]> = new Map();
  private collaborations: Map<string, AgentCollaboration> = new Map();
  private learningMetrics: Map<string, LearningMetrics> = new Map();
  private knowledgeGraph: Map<string, Set<string>> = new Map();
  
  // Agent capabilities registry
  private agentCapabilities: Map<string, AgentCapability> = new Map();
  
  // Learning parameters
  private learningRate: number = 0.01;
  private memoryRetentionDays: number = 30;
  private minConfidenceThreshold: number = 0.6;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.initializeSystem();
  }

  private async initializeSystem() {
    // Load existing knowledge from database
    await this.loadSharedKnowledge();
    
    // Initialize agent capabilities
    this.initializeAgentCapabilities();
    
    // Start background processes
    this.startMemoryConsolidation();
    this.startKnowledgePropagation();
    this.startPerformanceAnalysis();
    
    console.log('✅ Cross-Agent Learning System initialized');
  }

  private initializeAgentCapabilities() {
    // Define capabilities for each Life CEO agent
    const capabilities = [
      { id: 'health-advisor', skills: ['health', 'wellness', 'medical', 'fitness'], strength: 0.9 },
      { id: 'career-coach', skills: ['career', 'jobs', 'skills', 'professional'], strength: 0.9 },
      { id: 'financial-advisor', skills: ['finance', 'money', 'investment', 'budgeting'], strength: 0.9 },
      { id: 'relationship-counselor', skills: ['relationships', 'social', 'communication'], strength: 0.85 },
      { id: 'education-mentor', skills: ['learning', 'education', 'courses', 'skills'], strength: 0.85 },
      { id: 'productivity-optimizer', skills: ['productivity', 'time', 'efficiency', 'organization'], strength: 0.88 },
      { id: 'mindfulness-guide', skills: ['meditation', 'mindfulness', 'stress', 'mental'], strength: 0.87 },
      { id: 'creative-catalyst', skills: ['creativity', 'art', 'innovation', 'design'], strength: 0.82 },
      { id: 'travel-planner', skills: ['travel', 'destinations', 'planning', 'logistics'], strength: 0.84 },
      { id: 'home-organizer', skills: ['home', 'organization', 'declutter', 'space'], strength: 0.81 },
      { id: 'nutrition-specialist', skills: ['nutrition', 'diet', 'food', 'recipes'], strength: 0.88 },
      { id: 'fitness-trainer', skills: ['exercise', 'workout', 'fitness', 'training'], strength: 0.89 },
      { id: 'sleep-optimizer', skills: ['sleep', 'rest', 'recovery', 'circadian'], strength: 0.83 },
      { id: 'habit-architect', skills: ['habits', 'routines', 'behavior', 'change'], strength: 0.86 },
      { id: 'emergency-advisor', skills: ['emergency', 'crisis', 'safety', 'urgent'], strength: 0.95 },
      { id: 'life-strategist', skills: ['strategy', 'planning', 'goals', 'vision'], strength: 0.91 }
    ];

    capabilities.forEach(cap => {
      this.agentCapabilities.set(cap.id, {
        agentId: cap.id,
        skills: cap.skills,
        strength: cap.strength,
        experience: 0,
        successfulInteractions: 0,
        totalInteractions: 0
      });
    });
  }

  // Memory Management
  public async storeAgentMemory(memory: AgentMemory) {
    // Store in local memory
    if (!this.agentMemories.has(memory.agentId)) {
      this.agentMemories.set(memory.agentId, []);
    }
    
    const memories = this.agentMemories.get(memory.agentId)!;
    memories.push(memory);
    
    // Keep only recent memories
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.memoryRetentionDays);
    
    const recentMemories = memories.filter(m => m.timestamp > cutoffDate);
    this.agentMemories.set(memory.agentId, recentMemories);
    
    // Extract and share insights
    await this.extractAndShareInsights(memory);
    
    // Store in Redis for fast access
    await this.cacheMemory(memory);
    
    // Persist important memories to database
    if (memory.insights.some(i => i.confidence > 0.8)) {
      await this.persistMemory(memory);
    }
  }

  private async extractAndShareInsights(memory: AgentMemory) {
    const insights = memory.insights.filter(i => i.confidence >= this.minConfidenceThreshold);
    
    for (const insight of insights) {
      // Create shared knowledge from high-confidence insights
      const knowledge: SharedKnowledge = {
        id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: this.classifyInsight(insight),
        content: insight.content,
        confidence: insight.confidence,
        sources: [memory.agentId],
        validFrom: new Date(),
        userId: memory.userId
      };
      
      // Check if similar knowledge exists
      const similar = await this.findSimilarKnowledge(knowledge);
      
      if (similar) {
        // Reinforce existing knowledge
        await this.reinforceKnowledge(similar, knowledge);
      } else {
        // Add new knowledge
        await this.addSharedKnowledge(knowledge);
      }
    }
  }

  private classifyInsight(insight: AgentInsight): SharedKnowledge['type'] {
    const typeKeywords = {
      'fact': ['is', 'are', 'was', 'were', 'fact', 'true', 'false'],
      'pattern': ['usually', 'often', 'tends', 'pattern', 'regular', 'typical'],
      'preference': ['likes', 'prefers', 'enjoys', 'wants', 'wishes', 'favorite'],
      'behavior': ['does', 'acts', 'behaves', 'responds', 'reacts'],
      'goal': ['wants to', 'aims to', 'goal', 'objective', 'target', 'aspires']
    };
    
    const lowerContent = insight.content.toLowerCase();
    
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return type as SharedKnowledge['type'];
      }
    }
    
    return 'fact';
  }

  // Knowledge Management
  public async addSharedKnowledge(knowledge: SharedKnowledge) {
    this.sharedMemory.set(knowledge.id, knowledge);
    
    // Update knowledge graph
    this.updateKnowledgeGraph(knowledge);
    
    // Broadcast to relevant agents
    await this.broadcastKnowledge(knowledge);
    
    // Store in database
    await this.persistKnowledge(knowledge);
    
    this.emit('knowledge-added', knowledge);
  }

  private async findSimilarKnowledge(knowledge: SharedKnowledge): Promise<SharedKnowledge | null> {
    for (const existing of this.sharedMemory.values()) {
      if (existing.type === knowledge.type && existing.userId === knowledge.userId) {
        const similarity = this.calculateSimilarity(existing.content, knowledge.content);
        if (similarity > 0.8) {
          return existing;
        }
      }
    }
    return null;
  }

  private async reinforceKnowledge(existing: SharedKnowledge, new: SharedKnowledge) {
    // Update confidence
    existing.confidence = Math.min(1.0, existing.confidence + (new.confidence * this.learningRate));
    
    // Add source if not present
    if (!existing.sources.includes(new.sources[0])) {
      existing.sources.push(new.sources[0]);
    }
    
    // Update validity
    existing.validUntil = undefined; // Knowledge reinforced, so it remains valid
    
    this.emit('knowledge-reinforced', existing);
  }

  private calculateSimilarity(content1: any, content2: any): number {
    // Simple string similarity for now
    if (typeof content1 === 'string' && typeof content2 === 'string') {
      const words1 = new Set(content1.toLowerCase().split(' '));
      const words2 = new Set(content2.toLowerCase().split(' '));
      
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      
      return union.size > 0 ? intersection.size / union.size : 0;
    }
    
    // For objects, compare keys and values
    if (typeof content1 === 'object' && typeof content2 === 'object') {
      const keys1 = Object.keys(content1);
      const keys2 = Object.keys(content2);
      
      const commonKeys = keys1.filter(k => keys2.includes(k));
      if (commonKeys.length === 0) return 0;
      
      let similarity = commonKeys.length / Math.max(keys1.length, keys2.length);
      
      // Compare values for common keys
      for (const key of commonKeys) {
        if (content1[key] === content2[key]) {
          similarity += 0.1;
        }
      }
      
      return Math.min(1.0, similarity);
    }
    
    return content1 === content2 ? 1.0 : 0;
  }

  // Agent Collaboration
  public async initiateCollaboration(
    initiatorAgent: string,
    goal: string,
    requiredSkills: string[]
  ): Promise<AgentCollaboration> {
    // Find suitable agents
    const participants = this.selectAgentsForTask(requiredSkills);
    
    if (participants.length === 0) {
      throw new Error('No suitable agents found for collaboration');
    }
    
    // Create collaboration
    const collaboration: AgentCollaboration = {
      id: `collab_${Date.now()}`,
      initiator: initiatorAgent,
      participants: [initiatorAgent, ...participants],
      goal,
      status: 'active',
      tasks: [],
      startTime: new Date()
    };
    
    // Break down goal into tasks
    const tasks = await this.decomposeGoal(goal, participants);
    collaboration.tasks = tasks;
    
    // Store collaboration
    this.collaborations.set(collaboration.id, collaboration);
    
    // Notify participating agents
    this.emit('collaboration-started', collaboration);
    
    // Start task execution
    this.executeCollaborationTasks(collaboration);
    
    return collaboration;
  }

  private selectAgentsForTask(requiredSkills: string[]): string[] {
    const selectedAgents: string[] = [];
    const skillCoverage = new Set<string>();
    
    // Sort agents by capability strength
    const sortedAgents = Array.from(this.agentCapabilities.entries())
      .sort(([,a], [,b]) => b.strength - a.strength);
    
    for (const [agentId, capability] of sortedAgents) {
      // Check if agent has any required skills
      const hasSkills = capability.skills.some(skill => 
        requiredSkills.some(required => 
          skill.toLowerCase().includes(required.toLowerCase()) ||
          required.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      if (hasSkills) {
        selectedAgents.push(agentId);
        capability.skills.forEach(skill => skillCoverage.add(skill));
        
        // Check if all skills are covered
        const allCovered = requiredSkills.every(required =>
          Array.from(skillCoverage).some(skill =>
            skill.toLowerCase().includes(required.toLowerCase())
          )
        );
        
        if (allCovered) break;
      }
    }
    
    return selectedAgents;
  }

  private async decomposeGoal(goal: string, participants: string[]): Promise<CollaborationTask[]> {
    // Simple task decomposition based on keywords
    const tasks: CollaborationTask[] = [];
    const keywords = goal.toLowerCase().split(' ');
    
    // Analyze goal for different aspects
    const aspects = {
      'analysis': ['analyze', 'examine', 'study', 'investigate'],
      'planning': ['plan', 'schedule', 'organize', 'prepare'],
      'execution': ['do', 'execute', 'implement', 'perform'],
      'monitoring': ['monitor', 'track', 'watch', 'observe'],
      'evaluation': ['evaluate', 'assess', 'review', 'measure']
    };
    
    let taskIndex = 0;
    for (const [aspect, triggers] of Object.entries(aspects)) {
      if (triggers.some(trigger => keywords.includes(trigger))) {
        const task: CollaborationTask = {
          id: `task_${taskIndex++}`,
          assignedTo: participants[taskIndex % participants.length],
          description: `${aspect}: ${goal}`,
          status: 'pending',
          dependencies: taskIndex > 0 ? [`task_${taskIndex - 2}`] : undefined
        };
        tasks.push(task);
      }
    }
    
    // If no specific tasks identified, create a general task
    if (tasks.length === 0) {
      tasks.push({
        id: 'task_0',
        assignedTo: participants[0],
        description: goal,
        status: 'pending'
      });
    }
    
    return tasks;
  }

  private async executeCollaborationTasks(collaboration: AgentCollaboration) {
    // Execute tasks in parallel where possible
    const executionPromises: Promise<void>[] = [];
    
    for (const task of collaboration.tasks) {
      // Check dependencies
      const canExecute = !task.dependencies || 
        task.dependencies.every(depId => {
          const depTask = collaboration.tasks.find(t => t.id === depId);
          return depTask?.status === 'completed';
        });
      
      if (canExecute && task.status === 'pending') {
        task.status = 'in_progress';
        task.startTime = new Date();
        
        const promise = this.executeTask(task, collaboration)
          .then(result => {
            task.result = result;
            task.status = 'completed';
            task.endTime = new Date();
            
            // Check if all tasks are complete
            if (collaboration.tasks.every(t => t.status === 'completed')) {
              this.completeCollaboration(collaboration);
            } else {
              // Try to execute dependent tasks
              this.executeCollaborationTasks(collaboration);
            }
          })
          .catch(error => {
            task.status = 'failed';
            task.endTime = new Date();
            task.result = { error: error.message };
            
            // Mark collaboration as failed
            collaboration.status = 'failed';
            this.emit('collaboration-failed', collaboration);
          });
        
        executionPromises.push(promise);
      }
    }
    
    await Promise.all(executionPromises);
  }

  private async executeTask(task: CollaborationTask, collaboration: AgentCollaboration): Promise<any> {
    // Simulate task execution by agent
    this.emit('task-started', { task, collaboration });
    
    // Get agent capability
    const capability = this.agentCapabilities.get(task.assignedTo);
    if (!capability) {
      throw new Error(`Agent ${task.assignedTo} not found`);
    }
    
    // Simulate processing time based on task complexity
    const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Generate result based on agent capability
    const success = Math.random() < capability.strength;
    
    if (success) {
      capability.successfulInteractions++;
      capability.totalInteractions++;
      capability.experience += 0.01;
      capability.strength = Math.min(1.0, capability.strength + 0.001);
      
      return {
        success: true,
        output: `Task completed by ${task.assignedTo}`,
        confidence: capability.strength,
        insights: []
      };
    } else {
      capability.totalInteractions++;
      throw new Error('Task execution failed');
    }
  }

  private completeCollaboration(collaboration: AgentCollaboration) {
    collaboration.status = 'completed';
    collaboration.endTime = new Date();
    
    // Aggregate results
    collaboration.result = {
      tasks: collaboration.tasks.map(t => ({
        id: t.id,
        status: t.status,
        result: t.result
      })),
      duration: collaboration.endTime.getTime() - collaboration.startTime.getTime(),
      success: collaboration.tasks.every(t => t.status === 'completed')
    };
    
    // Update metrics for participating agents
    collaboration.participants.forEach(agentId => {
      const metrics = this.learningMetrics.get(agentId) || this.createDefaultMetrics(agentId);
      metrics.collaborations++;
      metrics.lastUpdated = new Date();
      this.learningMetrics.set(agentId, metrics);
    });
    
    this.emit('collaboration-completed', collaboration);
  }

  // Knowledge Propagation
  private async broadcastKnowledge(knowledge: SharedKnowledge) {
    // Determine which agents should receive this knowledge
    const relevantAgents = this.findRelevantAgents(knowledge);
    
    for (const agentId of relevantAgents) {
      // Store in agent-specific cache
      const key = `agent:${agentId}:knowledge:${knowledge.id}`;
      await redisClient.setex(key, 3600, JSON.stringify(knowledge)); // 1 hour TTL
      
      // Emit event for agent to process
      this.emit('knowledge-available', { agentId, knowledge });
    }
  }

  private findRelevantAgents(knowledge: SharedKnowledge): string[] {
    const relevant: string[] = [];
    
    // Check which agents have skills related to the knowledge
    const contentWords = typeof knowledge.content === 'string' 
      ? knowledge.content.toLowerCase().split(' ')
      : [];
    
    this.agentCapabilities.forEach((capability, agentId) => {
      const hasRelevantSkill = capability.skills.some(skill =>
        contentWords.some(word => 
          word.includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(word)
        )
      );
      
      if (hasRelevantSkill) {
        relevant.push(agentId);
      }
    });
    
    // Always include the source agents
    knowledge.sources.forEach(source => {
      if (!relevant.includes(source)) {
        relevant.push(source);
      }
    });
    
    return relevant;
  }

  // Query Methods
  public async queryKnowledge(
    query: string,
    userId?: number,
    agentId?: string
  ): Promise<SharedKnowledge[]> {
    const results: SharedKnowledge[] = [];
    const queryWords = query.toLowerCase().split(' ');
    
    for (const knowledge of this.sharedMemory.values()) {
      // Check user match if specified
      if (userId && knowledge.userId !== userId) continue;
      
      // Check agent source if specified
      if (agentId && !knowledge.sources.includes(agentId)) continue;
      
      // Check content relevance
      const contentStr = JSON.stringify(knowledge.content).toLowerCase();
      const relevance = queryWords.filter(word => contentStr.includes(word)).length;
      
      if (relevance > 0) {
        results.push(knowledge);
      }
    }
    
    // Sort by confidence and relevance
    results.sort((a, b) => b.confidence - a.confidence);
    
    return results.slice(0, 10); // Return top 10 results
  }

  public getAgentInsights(agentId: string, limit: number = 10): AgentInsight[] {
    const memories = this.agentMemories.get(agentId) || [];
    const allInsights: AgentInsight[] = [];
    
    memories.forEach(memory => {
      allInsights.push(...memory.insights);
    });
    
    // Sort by confidence and recency
    allInsights.sort((a, b) => {
      const confidenceDiff = b.confidence - a.confidence;
      if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    return allInsights.slice(0, limit);
  }

  public getCollaborationHistory(agentId: string): AgentCollaboration[] {
    const history: AgentCollaboration[] = [];
    
    this.collaborations.forEach(collaboration => {
      if (collaboration.participants.includes(agentId)) {
        history.push(collaboration);
      }
    });
    
    return history.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Performance Metrics
  public getAgentMetrics(agentId: string): LearningMetrics {
    return this.learningMetrics.get(agentId) || this.createDefaultMetrics(agentId);
  }

  private createDefaultMetrics(agentId: string): LearningMetrics {
    return {
      agentId,
      successRate: 0,
      avgResponseTime: 0,
      knowledgeContributions: 0,
      collaborations: 0,
      improvementRate: 0,
      lastUpdated: new Date()
    };
  }

  public async updateAgentPerformance(
    agentId: string,
    success: boolean,
    responseTime: number
  ) {
    const metrics = this.learningMetrics.get(agentId) || this.createDefaultMetrics(agentId);
    
    // Update success rate (exponential moving average)
    const alpha = 0.1; // Smoothing factor
    metrics.successRate = metrics.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
    
    // Update average response time
    metrics.avgResponseTime = metrics.avgResponseTime * (1 - alpha) + responseTime * alpha;
    
    // Calculate improvement rate
    const capability = this.agentCapabilities.get(agentId);
    if (capability) {
      const previousStrength = capability.strength;
      capability.strength = Math.min(1.0, capability.strength + (success ? 0.001 : -0.0005));
      metrics.improvementRate = capability.strength - previousStrength;
    }
    
    metrics.lastUpdated = new Date();
    this.learningMetrics.set(agentId, metrics);
    
    // Persist metrics
    await this.persistMetrics(metrics);
  }

  // Background Processes
  private startMemoryConsolidation() {
    setInterval(async () => {
      // Consolidate agent memories into shared knowledge
      for (const [agentId, memories] of this.agentMemories) {
        const recentMemories = memories.filter(m => {
          const hoursSince = (Date.now() - m.timestamp.getTime()) / (1000 * 60 * 60);
          return hoursSince < 24; // Last 24 hours
        });
        
        if (recentMemories.length > 5) {
          await this.consolidateMemories(agentId, recentMemories);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  private async consolidateMemories(agentId: string, memories: AgentMemory[]) {
    // Extract common patterns
    const patterns: Map<string, number> = new Map();
    
    memories.forEach(memory => {
      memory.insights.forEach(insight => {
        const key = `${insight.type}:${insight.content}`;
        patterns.set(key, (patterns.get(key) || 0) + 1);
      });
    });
    
    // Create shared knowledge from frequent patterns
    for (const [pattern, count] of patterns) {
      if (count >= 3) { // Pattern appears at least 3 times
        const [type, content] = pattern.split(':');
        
        const knowledge: SharedKnowledge = {
          id: `consolidated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'pattern',
          content: { type, content, frequency: count },
          confidence: Math.min(count / memories.length, 1.0),
          sources: [agentId],
          validFrom: new Date()
        };
        
        await this.addSharedKnowledge(knowledge);
      }
    }
  }

  private startKnowledgePropagation() {
    setInterval(async () => {
      // Propagate high-confidence knowledge to relevant agents
      for (const knowledge of this.sharedMemory.values()) {
        if (knowledge.confidence > 0.8) {
          const hoursSince = (Date.now() - knowledge.validFrom.getTime()) / (1000 * 60 * 60);
          
          if (hoursSince < 1) { // Knowledge less than 1 hour old
            await this.broadcastKnowledge(knowledge);
          }
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private startPerformanceAnalysis() {
    setInterval(async () => {
      // Analyze agent performance and adjust capabilities
      for (const [agentId, metrics] of this.learningMetrics) {
        const capability = this.agentCapabilities.get(agentId);
        if (!capability) continue;
        
        // Adjust strength based on performance
        if (metrics.successRate > 0.8 && capability.strength < 0.95) {
          capability.strength += 0.01;
        } else if (metrics.successRate < 0.5 && capability.strength > 0.5) {
          capability.strength -= 0.01;
        }
        
        // Update experience
        capability.experience = Math.log10(capability.totalInteractions + 1) / 10;
      }
      
      // Identify collaboration opportunities
      await this.identifyCollaborationOpportunities();
      
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  private async identifyCollaborationOpportunities() {
    // Find agents with complementary skills
    const opportunities: Array<{ agents: string[], reason: string }> = [];
    
    const agents = Array.from(this.agentCapabilities.keys());
    
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const agent1 = this.agentCapabilities.get(agents[i])!;
        const agent2 = this.agentCapabilities.get(agents[j])!;
        
        // Check for complementary skills
        const overlap = agent1.skills.filter(s => agent2.skills.includes(s));
        
        if (overlap.length === 0 && agent1.strength > 0.7 && agent2.strength > 0.7) {
          opportunities.push({
            agents: [agents[i], agents[j]],
            reason: 'Complementary skills with high performance'
          });
        }
      }
    }
    
    // Emit opportunities for coordination
    if (opportunities.length > 0) {
      this.emit('collaboration-opportunities', opportunities);
    }
  }

  // Database Operations
  private async loadSharedKnowledge() {
    try {
      const result = await this.pool.query(
        `SELECT * FROM shared_knowledge 
         WHERE valid_until IS NULL OR valid_until > NOW()
         ORDER BY confidence DESC
         LIMIT 1000`
      );
      
      result.rows.forEach(row => {
        const knowledge: SharedKnowledge = {
          id: row.id,
          type: row.type,
          content: row.content,
          confidence: row.confidence,
          sources: row.sources,
          validFrom: row.valid_from,
          validUntil: row.valid_until,
          userId: row.user_id
        };
        
        this.sharedMemory.set(knowledge.id, knowledge);
      });
      
      console.log(`📚 Loaded ${result.rows.length} shared knowledge items`);
    } catch (error) {
      console.error('Error loading shared knowledge:', error);
    }
  }

  private async persistKnowledge(knowledge: SharedKnowledge) {
    try {
      await this.pool.query(
        `INSERT INTO shared_knowledge 
         (id, type, content, confidence, sources, valid_from, valid_until, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
         confidence = $3,
         sources = $4,
         valid_until = $7`,
        [
          knowledge.id,
          knowledge.type,
          JSON.stringify(knowledge.content),
          knowledge.confidence,
          knowledge.sources,
          knowledge.validFrom,
          knowledge.validUntil,
          knowledge.userId
        ]
      );
    } catch (error) {
      console.error('Error persisting knowledge:', error);
    }
  }

  private async persistMemory(memory: AgentMemory) {
    try {
      await this.pool.query(
        `INSERT INTO agent_memories 
         (agent_id, user_id, timestamp, context, insights, interactions, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          memory.agentId,
          memory.userId,
          memory.timestamp,
          JSON.stringify(memory.context),
          JSON.stringify(memory.insights),
          JSON.stringify(memory.interactions),
          JSON.stringify(memory.metadata)
        ]
      );
    } catch (error) {
      console.error('Error persisting memory:', error);
    }
  }

  private async persistMetrics(metrics: LearningMetrics) {
    try {
      await this.pool.query(
        `INSERT INTO agent_metrics 
         (agent_id, success_rate, avg_response_time, knowledge_contributions, 
          collaborations, improvement_rate, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (agent_id) DO UPDATE SET
         success_rate = $2,
         avg_response_time = $3,
         knowledge_contributions = $4,
         collaborations = $5,
         improvement_rate = $6,
         last_updated = $7`,
        [
          metrics.agentId,
          metrics.successRate,
          metrics.avgResponseTime,
          metrics.knowledgeContributions,
          metrics.collaborations,
          metrics.improvementRate,
          metrics.lastUpdated
        ]
      );
    } catch (error) {
      console.error('Error persisting metrics:', error);
    }
  }

  private async cacheMemory(memory: AgentMemory) {
    const key = `agent:${memory.agentId}:memory:${memory.timestamp.getTime()}`;
    await redisClient.setex(key, 86400, JSON.stringify(memory)); // 24 hour TTL
  }

  private updateKnowledgeGraph(knowledge: SharedKnowledge) {
    // Create connections between related knowledge
    const contentWords = typeof knowledge.content === 'string'
      ? knowledge.content.toLowerCase().split(' ')
      : [];
    
    this.sharedMemory.forEach((otherKnowledge, otherId) => {
      if (otherId === knowledge.id) return;
      
      const otherWords = typeof otherKnowledge.content === 'string'
        ? otherKnowledge.content.toLowerCase().split(' ')
        : [];
      
      const commonWords = contentWords.filter(w => otherWords.includes(w));
      
      if (commonWords.length > 2) {
        // Create edge in knowledge graph
        if (!this.knowledgeGraph.has(knowledge.id)) {
          this.knowledgeGraph.set(knowledge.id, new Set());
        }
        this.knowledgeGraph.get(knowledge.id)!.add(otherId);
        
        if (!this.knowledgeGraph.has(otherId)) {
          this.knowledgeGraph.set(otherId, new Set());
        }
        this.knowledgeGraph.get(otherId)!.add(knowledge.id);
      }
    });
  }

  // Public API
  public getSharedKnowledge(): SharedKnowledge[] {
    return Array.from(this.sharedMemory.values());
  }

  public getActiveCollaborations(): AgentCollaboration[] {
    return Array.from(this.collaborations.values())
      .filter(c => c.status === 'active');
  }

  public getAgentCapabilities(): Map<string, AgentCapability> {
    return this.agentCapabilities;
  }

  public getKnowledgeGraph(): Map<string, Set<string>> {
    return this.knowledgeGraph;
  }

  public async reset() {
    this.sharedMemory.clear();
    this.agentMemories.clear();
    this.collaborations.clear();
    this.learningMetrics.clear();
    this.knowledgeGraph.clear();
    
    await this.initializeSystem();
  }
}

interface AgentCapability {
  agentId: string;
  skills: string[];
  strength: number;
  experience: number;
  successfulInteractions: number;
  totalInteractions: number;
}

// Export singleton instance
let crossAgentLearning: CrossAgentLearningSystem | null = null;

export function initializeCrossAgentLearning(pool: Pool): CrossAgentLearningSystem {
  if (!crossAgentLearning) {
    crossAgentLearning = new CrossAgentLearningSystem(pool);
  }
  return crossAgentLearning;
}

export function getCrossAgentLearning(): CrossAgentLearningSystem | null {
  return crossAgentLearning;
}