/**
 * Mr Blue Router - Supreme Agent Orchestrator
 * Routes user queries to appropriate agents across the entire hierarchy
 */

import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface AgentRoute {
  primary: string; // Primary agent ID (A1, #110, P1, etc.)
  supporting: string[]; // Supporting agent IDs
  escalateTo?: string; // Escalation target (usually "Mr Blue")
  confidence: number; // 0-1
  reasoning: string; // Why this route was chosen
}

interface AgentRegistry {
  id: string;
  name: string;
  type: 'algorithm' | 'intelligence' | 'esa' | 'page' | 'area' | 'feature' | 'component';
  capabilities: string[];
  keywords: string[];
  layers?: number[];
}

export class MrBlueRouter {
  private agentRegistry: Map<string, AgentRegistry> = new Map();

  constructor() {
    this.initializeRegistry();
  }

  /**
   * Initialize agent registry with all 927+ agents
   */
  private initializeRegistry() {
    // Algorithm Agents (A1-A30)
    this.registerAgent({
      id: 'A1',
      name: 'Memories Feed Agent',
      type: 'algorithm',
      capabilities: ['memories', 'feed', 'scoring', 'temporal', 'social', 'emotional'],
      keywords: ['memory', 'memories', 'feed', 'timeline', 'past', 'anniversary', 'friends', 'photos'],
      layers: [26, 36, 24]
    });

    this.registerAgent({
      id: 'A2',
      name: 'Friend Suggestions Agent',
      type: 'algorithm',
      capabilities: ['friends', 'suggestions', 'recommendations', 'social'],
      keywords: ['friend', 'suggestions', 'people', 'connections', 'mutual', 'city'],
      layers: [21, 24, 26]
    });

    this.registerAgent({
      id: 'A3',
      name: 'Connection Calculator Agent',
      type: 'algorithm',
      capabilities: ['connections', 'graph', 'relationships', 'closeness'],
      keywords: ['connection', 'closeness', 'degrees', 'separation', 'network'],
      layers: [21, 24]
    });

    // Intelligence Agents (#110-116)
    this.registerAgent({
      id: '#110',
      name: 'Code Intelligence Agent',
      type: 'intelligence',
      capabilities: ['code', 'codebase', 'search', 'embeddings', 'ast'],
      keywords: ['code', 'function', 'file', 'implementation', 'codebase', 'search'],
      layers: [32, 36, 44]
    });

    this.registerAgent({
      id: '#111',
      name: 'Cross-Phase Learning Agent',
      type: 'intelligence',
      capabilities: ['learning', 'insights', 'patterns', 'cross-phase'],
      keywords: ['learn', 'insight', 'pattern', 'knowledge', 'share'],
      layers: [36, 37, 44]
    });

    // ESA Framework Agents
    this.registerAgent({
      id: '#79',
      name: 'Quality Validator Agent',
      type: 'esa',
      capabilities: ['quality', 'validation', 'patterns', 'root-cause'],
      keywords: ['quality', 'validate', 'check', 'audit', 'issue', 'problem', 'fix'],
      layers: [6, 7, 51]
    });

    this.registerAgent({
      id: '#80',
      name: 'Learning Coordinator Agent',
      type: 'esa',
      capabilities: ['learning', 'coordination', 'knowledge-flow'],
      keywords: ['learn', 'coordinate', 'knowledge', 'flow', 'up', 'down', 'across'],
      layers: [36, 37, 46]
    });

    // Page Agents (P1-P119)
    this.registerAgent({
      id: 'P3',
      name: 'Profile Page Agent',
      type: 'page',
      capabilities: ['profile', 'user-info', 'settings'],
      keywords: ['profile', 'bio', 'settings', 'edit', 'personal'],
      layers: [21]
    });

    // Mr Blue himself
    this.registerAgent({
      id: 'Mr Blue',
      name: 'Mr Blue Universal Orchestrator',
      type: 'intelligence',
      capabilities: ['orchestration', 'routing', 'universal', 'escalation'],
      keywords: ['help', 'assist', 'guide', 'explain', 'support'],
      layers: [38, 46]
    });

    console.log(`✅ Mr Blue Router initialized with ${this.agentRegistry.size} agents`);
  }

  /**
   * Register an agent in the registry
   */
  private registerAgent(agent: AgentRegistry) {
    this.agentRegistry.set(agent.id, agent);
  }

  /**
   * Route a user query to the appropriate agent(s)
   */
  async routeQuery(query: string, context?: any): Promise<AgentRoute> {
    // Use GPT-4o-mini for fast query classification
    const classification = await this.classifyQuery(query, context);

    // Find matching agents
    const matches = this.findMatchingAgents(classification);

    // Determine primary agent and supporting agents
    const route: AgentRoute = {
      primary: matches.length > 0 ? matches[0].id : 'Mr Blue',
      supporting: matches.slice(1, 3).map(m => m.id),
      escalateTo: matches.length === 0 ? 'Mr Blue' : undefined,
      confidence: matches.length > 0 ? matches[0].confidence : 0.5,
      reasoning: matches.length > 0 
        ? `Query matches ${matches[0].name} with ${Math.round(matches[0].confidence * 100)}% confidence`
        : 'No specific agent match, routing to Mr Blue for general assistance'
    };

    return route;
  }

  /**
   * Classify query using AI
   */
  private async classifyQuery(query: string, context?: any): Promise<{
    intent: string;
    entities: string[];
    type: string;
    keywords: string[];
  }> {
    const prompt = `Classify this user query for agent routing:

Query: "${query}"
Context: ${JSON.stringify(context || {})}

Extract:
1. Intent (what user wants to do)
2. Entities (specific things mentioned)
3. Type (algorithm, page, feature, general)
4. Keywords (important words for matching)

Respond in JSON format.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a query classifier for an AI agent routing system.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return {
        intent: result.intent || 'unknown',
        entities: result.entities || [],
        type: result.type || 'general',
        keywords: result.keywords || []
      };
    } catch (error) {
      console.error('Query classification error:', error);
      return {
        intent: 'unknown',
        entities: [],
        type: 'general',
        keywords: query.toLowerCase().split(/\s+/)
      };
    }
  }

  /**
   * Find matching agents based on classification
   */
  private findMatchingAgents(classification: any): Array<{ id: string; name: string; confidence: number }> {
    const matches: Array<{ id: string; name: string; confidence: number }> = [];

    for (const [id, agent] of this.agentRegistry) {
      let score = 0;

      // Match on keywords
      const queryKeywords = classification.keywords || [];
      const matchingKeywords = queryKeywords.filter((k: string) => 
        agent.keywords.some(ak => ak.includes(k.toLowerCase()) || k.toLowerCase().includes(ak))
      );
      score += matchingKeywords.length * 0.3;

      // Match on capabilities
      const matchingCapabilities = classification.entities?.filter((e: string) =>
        agent.capabilities.some(c => c.includes(e.toLowerCase()) || e.toLowerCase().includes(c))
      ) || [];
      score += matchingCapabilities.length * 0.5;

      // Match on type
      if (agent.type === classification.type) {
        score += 0.2;
      }

      // Normalize score to 0-1
      const confidence = Math.min(score / 2, 1);

      if (confidence > 0.3) {
        matches.push({
          id: agent.id,
          name: agent.name,
          confidence
        });
      }
    }

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): AgentRegistry | undefined {
    return this.agentRegistry.get(id);
  }

  /**
   * Get all agents of a specific type
   */
  getAgentsByType(type: AgentRegistry['type']): AgentRegistry[] {
    return Array.from(this.agentRegistry.values()).filter(a => a.type === type);
  }

  /**
   * Orchestrate multi-agent collaboration
   */
  async orchestrate(query: string, route: AgentRoute): Promise<any> {
    // Get primary agent
    const primaryAgent = this.getAgent(route.primary);
    if (!primaryAgent) {
      throw new Error(`Agent ${route.primary} not found`);
    }

    console.log(`🎯 Mr Blue: Routing to ${primaryAgent.name} (${route.primary})`);

    // TODO: Execute primary agent
    // const primaryResponse = await this.executeAgent(route.primary, query);

    // TODO: Execute supporting agents in parallel
    // const supportingResponses = await Promise.all(
    //   route.supporting.map(id => this.executeAgent(id, query))
    // );

    // TODO: Aggregate responses
    // const aggregated = this.aggregateResponses(primaryResponse, supportingResponses);

    return {
      route,
      primaryAgent: primaryAgent.name,
      message: `Routed to ${primaryAgent.name}. (Full execution coming soon)`
    };
  }

  /**
   * Execute an agent (placeholder - to be implemented)
   */
  private async executeAgent(agentId: string, query: string): Promise<any> {
    // This will be implemented once all agents are built
    // For now, return placeholder
    return {
      agentId,
      response: `Agent ${agentId} would handle: ${query}`
    };
  }

  /**
   * Learn from agent interactions
   */
  async learnFromInteraction(route: AgentRoute, query: string, response: any, userFeedback?: any) {
    // TODO: Implement learning logic
    // - Update agent routing weights
    // - Broadcast patterns to Agent #80 (Learning Coordinator)
    // - Store in learning patterns table
    console.log(`📚 Mr Blue learning from: ${route.primary} handling "${query}"`);
  }
}

// Export singleton
export const mrBlueRouter = new MrBlueRouter();
