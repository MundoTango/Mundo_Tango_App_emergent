/**
 * TRACK 8 (Legacy Task): Agent Registry & Knowledge Distribution
 * Agent #80 - Learning Coordinator
 * 
 * Distributes patterns to all 125 agents
 */

interface AgentCapability {
  name: string;
  version: string;
  patterns: string[];
  certifications: string[];
  lastUpdated: Date;
}

interface KnowledgePattern {
  id: string;
  name: string;
  description: string;
  category: string;
  code?: string;
  documentation: string;
  applicableAgents: number[]; // Agent IDs that can use this pattern
  createdAt: Date;
  distributedTo: number[]; // Agent IDs that received this pattern
}

export class AgentRegistry {
  private agents: Map<number, AgentCapability> = new Map();
  private patterns: Map<string, KnowledgePattern> = new Map();

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialize all 125 ESA agents
   */
  private initializeAgents() {
    // Register all 125 agents
    const agentDefinitions = [
      { id: 73, name: 'Core AI Integration' },
      { id: 74, name: 'Voice & Personality' },
      { id: 75, name: 'Context Awareness' },
      { id: 76, name: 'Multi-model Routing' },
      { id: 77, name: 'Learning Integration' },
      { id: 78, name: 'Visual Editor' },
      { id: 79, name: 'Quality Validator' },
      { id: 80, name: 'Learning Coordinator' },
      { id: 81, name: 'Page Intelligence' },
      { id: 72, name: 'Error Recovery' },
      { id: 66, name: 'Performance Monitoring' },
      { id: 59, name: 'Security Audit' },
      { id: 68, name: 'Pattern Learning' },
      // ... add all 125 agents
    ];

    for (const agent of agentDefinitions) {
      this.agents.set(agent.id, {
        name: agent.name,
        version: '1.0.0',
        patterns: [],
        certifications: [],
        lastUpdated: new Date()
      });
    }

    console.log(`📊 [AgentRegistry] Initialized ${this.agents.size} agents`);
  }

  /**
   * Register new knowledge pattern
   */
  registerPattern(pattern: Omit<KnowledgePattern, 'id' | 'createdAt' | 'distributedTo'>): string {
    const patternId = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newPattern: KnowledgePattern = {
      id: patternId,
      ...pattern,
      createdAt: new Date(),
      distributedTo: []
    };

    this.patterns.set(patternId, newPattern);
    console.log(`📚 [AgentRegistry] Registered pattern: ${pattern.name}`);

    // Auto-distribute to applicable agents
    this.distributePattern(patternId);

    return patternId;
  }

  /**
   * Distribute pattern to applicable agents
   */
  private async distributePattern(patternId: string) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    console.log(`📤 [AgentRegistry] Distributing pattern "${pattern.name}" to ${pattern.applicableAgents.length} agents...`);

    for (const agentId of pattern.applicableAgents) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      // Add pattern to agent's capabilities
      if (!agent.patterns.includes(pattern.id)) {
        agent.patterns.push(pattern.id);
        agent.lastUpdated = new Date();
        this.agents.set(agentId, agent);

        pattern.distributedTo.push(agentId);
      }
    }

    this.patterns.set(patternId, pattern);
    console.log(`✅ [AgentRegistry] Pattern distributed to ${pattern.distributedTo.length} agents`);
  }

  /**
   * Certify agent on a pattern
   */
  certifyAgent(agentId: number, patternId: string): boolean {
    const agent = this.agents.get(agentId);
    const pattern = this.patterns.get(patternId);

    if (!agent || !pattern) {
      console.warn(`⚠️ [AgentRegistry] Cannot certify: agent ${agentId} or pattern ${patternId} not found`);
      return false;
    }

    const certificationKey = `${patternId}:certified`;
    if (!agent.certifications.includes(certificationKey)) {
      agent.certifications.push(certificationKey);
      agent.lastUpdated = new Date();
      this.agents.set(agentId, agent);

      console.log(`✅ [AgentRegistry] Agent ${agentId} (${agent.name}) certified on pattern "${pattern.name}"`);
      return true;
    }

    return false;
  }

  /**
   * Get agent capabilities
   */
  getAgentCapabilities(agentId: number): AgentCapability | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents with a specific pattern
   */
  getAgentsWithPattern(patternId: string): AgentCapability[] {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return [];

    return Array.from(this.agents.values())
      .filter(agent => agent.patterns.includes(patternId));
  }

  /**
   * Get distribution status
   */
  getDistributionStatus(): {
    totalAgents: number;
    totalPatterns: number;
    distributionRate: number;
    certificationRate: number;
  } {
    const totalPatterns = this.patterns.size;
    const totalAgents = this.agents.size;

    let totalDistributions = 0;
    let totalCertifications = 0;

    for (const agent of this.agents.values()) {
      totalDistributions += agent.patterns.length;
      totalCertifications += agent.certifications.length;
    }

    return {
      totalAgents,
      totalPatterns,
      distributionRate: totalDistributions / (totalPatterns * totalAgents) || 0,
      certificationRate: totalCertifications / totalDistributions || 0
    };
  }
}

export const agentRegistry = new AgentRegistry();

// Auto-register initial patterns
agentRegistry.registerPattern({
  name: 'Visual Editor Pattern',
  description: 'Replit-style visual editor with AI code generation',
  category: 'ui-editing',
  documentation: 'See /docs/visual-editor-pattern.md',
  applicableAgents: [78, 73, 75] // Visual Editor, Core AI, Context Awareness
});

agentRegistry.registerPattern({
  name: 'User Context Intelligence',
  description: 'Aggregate user data for contextual AI conversations',
  category: 'ai-intelligence',
  documentation: 'See /docs/user-context-pattern.md',
  applicableAgents: [73, 75, 77] // Core AI, Context Awareness, Learning Integration
});

agentRegistry.registerPattern({
  name: 'Auto-Healing Services',
  description: 'Self-healing service monitoring and recovery',
  category: 'reliability',
  documentation: 'See /docs/auto-healing-pattern.md',
  applicableAgents: [72, 66, 59] // Error Recovery, Performance, Security
});
