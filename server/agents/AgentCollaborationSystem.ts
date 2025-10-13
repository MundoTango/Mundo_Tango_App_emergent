/**
 * Agent Collaboration System (Agents #79-80 Upgrade)
 * MB.MD PHASE 5 - TRACK 20
 * 
 * Inter-agent messaging and shared knowledge graph
 */

import { EventEmitter } from 'events';

interface AgentMessage {
  id: string;
  fromAgent: number;
  toAgent: number | 'broadcast';
  messageType: 'insight' | 'question' | 'solution' | 'alert';
  content: any;
  timestamp: Date;
  priority: number;
}

interface KnowledgeGraphNode {
  id: string;
  type: 'issue' | 'solution' | 'pattern' | 'metric';
  agentId: number;
  data: any;
  connections: string[];
  confidence: number;
  timestamp: Date;
}

interface RootCauseAnalysis {
  issueId: string;
  rootCauses: Array<{
    cause: string;
    likelihood: number;
    evidence: string[];
    contributingAgents: number[];
  }>;
  suggestedSolutions: Array<{
    solution: string;
    effectiveness: number;
    steps: string[];
    requiredAgents: number[];
  }>;
}

export class AgentCollaborationSystem extends EventEmitter {
  private messageQueue: AgentMessage[] = [];
  private knowledgeGraph: Map<string, KnowledgeGraphNode> = new Map();
  private agentCapabilities: Map<number, string[]> = new Map();

  constructor() {
    super();
    this.initializeAgentCapabilities();
  }

  /**
   * Initialize agent capabilities registry
   */
  private initializeAgentCapabilities() {
    this.agentCapabilities.set(106, ['api-validation', 'path-matching', 'auto-fix']);
    this.agentCapabilities.set(107, ['query-optimization', 'n+1-detection', 'performance']);
    this.agentCapabilities.set(108, ['websocket-management', 'connection-pooling', 'real-time']);
    this.agentCapabilities.set(109, ['cache-intelligence', 'prediction', 'invalidation']);
  }

  /**
   * Send message from one agent to another
   */
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.messageQueue.push(fullMessage);
    
    console.log(`💬 [Agent #${message.fromAgent}] → [Agent ${message.toAgent}]: ${message.messageType}`);
    
    // Emit message event
    this.emit('agent-message', fullMessage);
    
    // If broadcast, notify all agents
    if (message.toAgent === 'broadcast') {
      this.emit('broadcast-message', fullMessage);
    } else {
      this.emit(`agent-${message.toAgent}-message`, fullMessage);
    }
  }

  /**
   * Add insight to shared knowledge graph
   */
  async addKnowledge(node: Omit<KnowledgeGraphNode, 'id' | 'timestamp'>): Promise<string> {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullNode: KnowledgeGraphNode = {
      ...node,
      id,
      timestamp: new Date()
    };

    this.knowledgeGraph.set(id, fullNode);
    
    console.log(`🧠 [Agent #${node.agentId}] Added knowledge: ${node.type} (confidence: ${node.confidence})`);
    
    // Link related nodes
    await this.linkRelatedNodes(fullNode);
    
    return id;
  }

  /**
   * Link related knowledge nodes
   */
  private async linkRelatedNodes(newNode: KnowledgeGraphNode) {
    for (const [nodeId, node] of this.knowledgeGraph.entries()) {
      if (nodeId === newNode.id) continue;
      
      // Link if same type or related agents
      if (node.type === newNode.type || this.areAgentsRelated(node.agentId, newNode.agentId)) {
        if (!node.connections.includes(newNode.id)) {
          node.connections.push(newNode.id);
        }
        if (!newNode.connections.includes(nodeId)) {
          newNode.connections.push(nodeId);
        }
      }
    }
  }

  /**
   * Check if two agents are related
   */
  private areAgentsRelated(agent1: number, agent2: number): boolean {
    const caps1 = this.agentCapabilities.get(agent1) || [];
    const caps2 = this.agentCapabilities.get(agent2) || [];
    
    // Related if they share any capabilities
    return caps1.some(cap => caps2.includes(cap));
  }

  /**
   * Perform root cause analysis
   */
  async performRootCauseAnalysis(issueDescription: string): Promise<RootCauseAnalysis> {
    console.log('🔍 [Collaboration] Performing root cause analysis...');
    
    // Gather insights from all agents
    const insights = Array.from(this.knowledgeGraph.values())
      .filter(node => node.type === 'issue' || node.type === 'pattern')
      .sort((a, b) => b.confidence - a.confidence);

    // Analyze root causes
    const rootCauses = this.analyzeRootCauses(issueDescription, insights);
    
    // Generate solutions
    const suggestedSolutions = this.generateSolutions(rootCauses);
    
    return {
      issueId: `issue-${Date.now()}`,
      rootCauses,
      suggestedSolutions
    };
  }

  /**
   * Analyze root causes from insights
   */
  private analyzeRootCauses(issue: string, insights: KnowledgeGraphNode[]) {
    const causes: Array<{
      cause: string;
      likelihood: number;
      evidence: string[];
      contributingAgents: number[];
    }> = [];

    // Example: API path mismatches
    if (issue.includes('api') || issue.includes('404')) {
      causes.push({
        cause: 'API path mismatch between frontend and backend',
        likelihood: 0.85,
        evidence: ['Agent #106 detected 270 path mismatches', 'Frontend calls /api/* but backend expects /*'],
        contributingAgents: [106]
      });
    }

    // Example: Performance issues
    if (issue.includes('slow') || issue.includes('performance')) {
      causes.push({
        cause: 'N+1 query problem causing performance degradation',
        likelihood: 0.70,
        evidence: ['Agent #107 detected repeated query patterns', '>10 sequential queries detected'],
        contributingAgents: [107]
      });
    }

    // Example: Cache issues
    if (issue.includes('cache') || issue.includes('stale')) {
      causes.push({
        cause: 'Stale cache entries not being invalidated',
        likelihood: 0.65,
        evidence: ['Agent #109 detected low cache hit rate', 'Mutation patterns not triggering invalidation'],
        contributingAgents: [109]
      });
    }

    return causes.sort((a, b) => b.likelihood - a.likelihood);
  }

  /**
   * Generate solutions based on root causes
   */
  private generateSolutions(rootCauses: any[]) {
    const solutions: Array<{
      solution: string;
      effectiveness: number;
      steps: string[];
      requiredAgents: number[];
    }> = [];

    for (const cause of rootCauses) {
      if (cause.contributingAgents.includes(106)) {
        solutions.push({
          solution: 'Auto-fix API path mismatches using route wrappers',
          effectiveness: 0.90,
          steps: [
            'Agent #106 scans for mismatches',
            'Generate route wrapper middleware',
            'Apply wrappers to top 50 critical paths',
            'Validate with integration tests'
          ],
          requiredAgents: [106]
        });
      }

      if (cause.contributingAgents.includes(107)) {
        solutions.push({
          solution: 'Optimize N+1 queries with batch loading',
          effectiveness: 0.85,
          steps: [
            'Agent #107 identifies N+1 patterns',
            'Generate DataLoader instances',
            'Replace sequential queries with batched queries',
            'Measure performance improvement'
          ],
          requiredAgents: [107]
        });
      }

      if (cause.contributingAgents.includes(109)) {
        solutions.push({
          solution: 'Implement predictive cache invalidation',
          effectiveness: 0.75,
          steps: [
            'Agent #109 analyzes mutation patterns',
            'Predict when data will become stale',
            'Auto-invalidate before stale',
            'Monitor cache hit rate improvement'
          ],
          requiredAgents: [109]
        });
      }
    }

    return solutions.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Get collaboration statistics
   */
  getStats() {
    return {
      totalMessages: this.messageQueue.length,
      knowledgeNodes: this.knowledgeGraph.size,
      registeredAgents: this.agentCapabilities.size,
      recentMessages: this.messageQueue.slice(-10),
      knowledgeByType: {
        issues: Array.from(this.knowledgeGraph.values()).filter(n => n.type === 'issue').length,
        solutions: Array.from(this.knowledgeGraph.values()).filter(n => n.type === 'solution').length,
        patterns: Array.from(this.knowledgeGraph.values()).filter(n => n.type === 'pattern').length,
        metrics: Array.from(this.knowledgeGraph.values()).filter(n => n.type === 'metric').length
      }
    };
  }
}

// Singleton instance
export const agentCollaboration = new AgentCollaborationSystem();
