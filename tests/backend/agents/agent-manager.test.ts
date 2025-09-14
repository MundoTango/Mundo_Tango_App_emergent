/**
 * ESA LIFE CEO 61x21 - Agent Manager Tests
 * Comprehensive testing for the 16 Life CEO agents
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentManager, LIFE_CEO_AGENTS } from '@server/ai/agent-manager';
import { db } from '@server/db';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock AI response',
              role: 'assistant'
            }
          }]
        })
      }
    }
  }))
}));

// Mock database
vi.mock('@server/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    transaction: vi.fn()
  }
}));

describe('AgentManager', () => {
  let agentManager: AgentManager;

  beforeEach(() => {
    vi.clearAllMocks();
    agentManager = new AgentManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with all 16 Life CEO agents', async () => {
      const agents = await agentManager.getAllAgents();
      expect(agents).toHaveLength(16);
      
      // Verify all agents are present
      const agentIds = agents.map(a => a.id);
      Object.keys(LIFE_CEO_AGENTS).forEach(key => {
        expect(agentIds).toContain(LIFE_CEO_AGENTS[key].id);
      });
    });

    it('should initialize each agent with correct properties', async () => {
      const healthAdvisor = await agentManager.getAgent('health-advisor');
      
      expect(healthAdvisor).toBeDefined();
      expect(healthAdvisor.name).toBe('Health & Wellness Advisor');
      expect(healthAdvisor.category).toBe('health');
      expect(healthAdvisor.capabilities).toContain('health-tracking');
      expect(healthAdvisor.personality.tone).toBe('supportive');
    });

    it('should handle database initialization errors gracefully', async () => {
      vi.mocked(db.insert).mockRejectedValueOnce(new Error('DB Error'));
      
      const result = await agentManager.initializeAgents();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Agent Interactions', () => {
    it('should process user message with appropriate agent', async () => {
      const response = await agentManager.processMessage({
        userId: 'test-user',
        agentId: 'health-advisor',
        message: 'I need help with my fitness routine'
      });

      expect(response.success).toBe(true);
      expect(response.response).toBeDefined();
      expect(response.agentId).toBe('health-advisor');
    });

    it('should select correct agent based on intent', async () => {
      const testCases = [
        { message: 'Help me with my budget', expectedAgent: 'financial-advisor' },
        { message: 'I want to improve my sleep', expectedAgent: 'sleep-optimizer' },
        { message: 'Plan my trip to Paris', expectedAgent: 'travel-planner' },
        { message: 'I need career advice', expectedAgent: 'career-coach' }
      ];

      for (const testCase of testCases) {
        const agent = await agentManager.selectAgentByIntent(testCase.message);
        expect(agent.id).toBe(testCase.expectedAgent);
      }
    });

    it('should maintain conversation context', async () => {
      const userId = 'test-user';
      const agentId = 'career-coach';

      // First message
      await agentManager.processMessage({
        userId,
        agentId,
        message: 'I want to switch careers'
      });

      // Second message - should have context
      const response = await agentManager.processMessage({
        userId,
        agentId,
        message: 'What skills do I need?'
      });

      expect(response.hasContext).toBe(true);
      expect(response.contextLength).toBeGreaterThan(0);
    });

    it('should handle multi-agent collaboration', async () => {
      const response = await agentManager.collaborateAgents({
        userId: 'test-user',
        primaryAgent: 'life-strategist',
        supportingAgents: ['career-coach', 'financial-advisor'],
        goal: 'Create a 5-year life plan'
      });

      expect(response.success).toBe(true);
      expect(response.collaboration).toBeDefined();
      expect(response.collaboration.agents).toHaveLength(3);
    });
  });

  describe('Memory Systems', () => {
    it('should store semantic memories', async () => {
      const memory = await agentManager.storeMemory({
        userId: 'test-user',
        agentId: 'health-advisor',
        type: 'preference',
        content: 'User prefers morning workouts',
        importance: 0.8
      });

      expect(memory.id).toBeDefined();
      expect(memory.importance).toBe(0.8);
    });

    it('should retrieve relevant memories', async () => {
      // Store test memories
      await agentManager.storeMemory({
        userId: 'test-user',
        agentId: 'health-advisor',
        type: 'fact',
        content: 'User has knee injury'
      });

      const memories = await agentManager.getRelevantMemories({
        userId: 'test-user',
        agentId: 'health-advisor',
        query: 'exercise recommendations'
      });

      expect(memories).toBeDefined();
      expect(memories.length).toBeGreaterThan(0);
    });

    it('should handle memory consolidation', async () => {
      const result = await agentManager.consolidateMemories('test-user');
      
      expect(result.success).toBe(true);
      expect(result.consolidated).toBeDefined();
    });
  });

  describe('Decision Support', () => {
    it('should provide decision recommendations', async () => {
      const decision = await agentManager.getDecisionSupport({
        userId: 'test-user',
        agentId: 'financial-advisor',
        decision: 'Should I invest in stocks or bonds?',
        context: {
          age: 30,
          riskTolerance: 'moderate',
          timeline: '10 years'
        }
      });

      expect(decision.recommendation).toBeDefined();
      expect(decision.pros).toBeDefined();
      expect(decision.cons).toBeDefined();
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it('should track decision outcomes', async () => {
      const outcome = await agentManager.trackDecisionOutcome({
        userId: 'test-user',
        decisionId: 'test-decision',
        outcome: 'positive',
        feedback: 'The recommendation worked well'
      });

      expect(outcome.recorded).toBe(true);
    });
  });

  describe('Agent Categories', () => {
    it('should group agents by category', async () => {
      const categories = await agentManager.getAgentsByCategory();
      
      expect(categories['health']).toBeDefined();
      expect(categories['health']).toContain('health-advisor');
      expect(categories['health']).toContain('fitness-trainer');
      
      expect(categories['finance']).toBeDefined();
      expect(categories['finance']).toContain('financial-advisor');
    });

    it('should provide category recommendations', async () => {
      const recommendations = await agentManager.getCategoryRecommendations({
        userId: 'test-user',
        currentFocus: 'health'
      });

      expect(recommendations).toBeDefined();
      expect(recommendations.primary).toBeDefined();
      expect(recommendations.complementary).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should track agent performance', async () => {
      const metrics = await agentManager.getAgentMetrics('health-advisor');
      
      expect(metrics).toBeDefined();
      expect(metrics.totalInteractions).toBeDefined();
      expect(metrics.averageResponseTime).toBeDefined();
      expect(metrics.userSatisfaction).toBeDefined();
    });

    it('should optimize agent responses based on feedback', async () => {
      await agentManager.provideFeedback({
        userId: 'test-user',
        agentId: 'career-coach',
        messageId: 'test-message',
        rating: 5,
        feedback: 'Very helpful advice'
      });

      const agent = await agentManager.getAgent('career-coach');
      expect(agent.optimization.feedbackCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors', async () => {
      vi.mocked(OpenAI).mockImplementationOnce(() => {
        throw new Error('API Key Invalid');
      });

      const response = await agentManager.processMessage({
        userId: 'test-user',
        agentId: 'health-advisor',
        message: 'Test message'
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('API');
    });

    it('should handle invalid agent IDs', async () => {
      const response = await agentManager.processMessage({
        userId: 'test-user',
        agentId: 'invalid-agent',
        message: 'Test message'
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Agent not found');
    });

    it('should handle rate limiting', async () => {
      const promises = [];
      
      // Simulate rapid requests
      for (let i = 0; i < 100; i++) {
        promises.push(agentManager.processMessage({
          userId: 'test-user',
          agentId: 'health-advisor',
          message: `Message ${i}`
        }));
      }

      const results = await Promise.all(promises);
      const rateLimited = results.filter(r => r.rateLimited);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with 61-Layer System', () => {
    it('should integrate with Layer 35 AI Agent Management', async () => {
      const integration = await agentManager.integrateWithLayer35();
      
      expect(integration.connected).toBe(true);
      expect(integration.layer).toBe(35);
      expect(integration.agents).toHaveLength(16);
    });

    it('should provide agent health status', async () => {
      const health = await agentManager.getHealthStatus();
      
      expect(health.healthy).toBe(true);
      expect(health.agents).toHaveLength(16);
      health.agents.forEach(agent => {
        expect(agent.status).toBe('operational');
      });
    });

    it('should handle agent coordination requests', async () => {
      const coordination = await agentManager.coordinateAgents({
        task: 'Complete lifestyle optimization',
        requiredCapabilities: ['health-tracking', 'budgeting', 'habit-design']
      });

      expect(coordination.selectedAgents).toContain('health-advisor');
      expect(coordination.selectedAgents).toContain('financial-advisor');
      expect(coordination.selectedAgents).toContain('habit-architect');
    });
  });
});