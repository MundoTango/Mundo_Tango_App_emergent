/**
 * ESA LIFE CEO 61×21 - Life CEO Agents Integration Tests
 * Testing integration between 16 Life CEO agents and 61 ESA layers
 */

import request from 'supertest';
import { z } from 'zod';
import {
  API_BASE_URL,
  TEST_USERS,
  PERF_THRESHOLDS,
  validateResponseTime,
  validateSchema,
  createAuthenticatedRequest,
  setupTestDatabase,
  cleanupTestDatabase,
  TestUtils
} from '../api/contract/test-setup';

// Import schemas from contract tests
import { AgentSchema, ChatResponseSchema } from '../api/contract/agents.contract.test';
import { PostSchema, EnhancedContentSchema } from '../api/contract/posts.contract.test';
import { EventSchema } from '../api/contract/events.contract.test';

// Layer integration mappings for each agent
const AGENT_LAYER_MAPPINGS = {
  'health-advisor': {
    layers: ['ESA-13', 'ESA-35', 'ESA-11'],
    description: 'Files, AI, Real-time'
  },
  'financial-advisor': {
    layers: ['ESA-20', 'ESA-18', 'ESA-35'],
    description: 'Payments, Analytics, AI'
  },
  'career-coach': {
    layers: ['ESA-35', 'ESA-26'],
    description: 'AI, Recommendations'
  },
  'relationship-counselor': {
    layers: ['ESA-35', 'ESA-11', 'ESA-24'],
    description: 'AI, Real-time, Social'
  },
  'education-mentor': {
    layers: ['ESA-35', 'ESA-13', 'ESA-26'],
    description: 'AI, Files, Recommendations'
  },
  'productivity-optimizer': {
    layers: ['ESA-35', 'ESA-18', 'ESA-31'],
    description: 'AI, Analytics, Tasks'
  },
  'mindfulness-guide': {
    layers: ['ESA-35', 'ESA-11', 'ESA-33'],
    description: 'AI, Real-time, Meditation'
  },
  'creative-catalyst': {
    layers: ['ESA-35', 'ESA-13', 'ESA-28'],
    description: 'AI, Files, Media'
  },
  'travel-planner': {
    layers: ['ESA-35', 'ESA-26', 'ESA-19'],
    description: 'AI, Recommendations, Maps'
  },
  'home-organizer': {
    layers: ['ESA-35', 'ESA-31', 'ESA-13'],
    description: 'AI, Tasks, Files'
  },
  'nutrition-specialist': {
    layers: ['ESA-35', 'ESA-13', 'ESA-18'],
    description: 'AI, Files, Analytics'
  },
  'fitness-trainer': {
    layers: ['ESA-35', 'ESA-11', 'ESA-18'],
    description: 'AI, Real-time, Analytics'
  },
  'sleep-optimizer': {
    layers: ['ESA-35', 'ESA-18', 'ESA-11'],
    description: 'AI, Analytics, Real-time'
  },
  'habit-architect': {
    layers: ['ESA-35', 'ESA-31', 'ESA-18'],
    description: 'AI, Tasks, Analytics'
  },
  'emergency-advisor': {
    layers: ['ESA-35', 'ESA-11', 'ESA-15'],
    description: 'AI, Real-time, Notifications'
  },
  'life-strategist': {
    layers: ['ESA-35', 'ESA-26', 'ESA-18'],
    description: 'AI, Recommendations, Analytics'
  }
};

describe('Life CEO Agents Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Agent-Layer Integration Tests', () => {
    Object.entries(AGENT_LAYER_MAPPINGS).forEach(([agentId, mapping]) => {
      describe(`${agentId} integration with ${mapping.description}`, () => {
        
        it(`should integrate with ${mapping.layers.join(', ')}`, async () => {
          const authRequest = await createAuthenticatedRequest('user');
          const startTime = Date.now();

          // Test agent interaction
          const response = await authRequest
            .post(`/api/agents/${agentId}/chat`)
            .send({
              message: `Test integration for ${agentId}`,
              testLayers: mapping.layers
            })
            .expect(200);

          validateResponseTime(startTime, PERF_THRESHOLDS.AGENT);
          validateSchema(response.body, ChatResponseSchema);
          
          // Verify layer interactions occurred
          if (response.body.metadata) {
            expect(response.body.metadata.layersUsed).toBeDefined();
            mapping.layers.forEach(layer => {
              expect(response.body.metadata.layersUsed).toContain(layer);
            });
          }
        });

        // Layer-specific tests
        if (mapping.layers.includes('ESA-11')) {
          it(`${agentId} should send real-time updates`, async () => {
            const authRequest = await createAuthenticatedRequest('user');
            
            // Connect to WebSocket
            const ws = new WebSocket(`ws://localhost:5000/socket.io`);
            const messageReceived = new Promise((resolve) => {
              ws.on('message', (data) => {
                const message = JSON.parse(data.toString());
                if (message.type === 'agent-update') {
                  resolve(message);
                }
              });
            });

            // Trigger agent action that should emit real-time update
            await authRequest
              .post(`/api/agents/${agentId}/chat`)
              .send({
                message: 'Send real-time update',
                realTime: true
              })
              .expect(200);

            // Verify real-time message received
            const rtMessage = await Promise.race([
              messageReceived,
              TestUtils.wait(2000).then(() => null)
            ]);

            expect(rtMessage).toBeDefined();
            ws.close();
          });
        }

        if (mapping.layers.includes('ESA-13')) {
          it(`${agentId} should handle file operations`, async () => {
            const authRequest = await createAuthenticatedRequest('user');
            
            const response = await authRequest
              .post(`/api/agents/${agentId}/chat`)
              .field('message', 'Process this file')
              .attach('file', Buffer.from('test data'), 'test.txt')
              .expect(200);

            expect(response.body.response).toContain('file');
          });
        }

        if (mapping.layers.includes('ESA-18')) {
          it(`${agentId} should track analytics`, async () => {
            const authRequest = await createAuthenticatedRequest('user');
            
            const response = await authRequest
              .post(`/api/agents/${agentId}/chat`)
              .send({
                message: 'Track this interaction',
                trackAnalytics: true
              })
              .expect(200);

            // Verify analytics were tracked
            const analyticsResponse = await authRequest
              .get(`/api/analytics/agents/${agentId}`)
              .expect(200);

            expect(analyticsResponse.body.interactions).toBeGreaterThan(0);
          });
        }

        if (mapping.layers.includes('ESA-20')) {
          it(`${agentId} should handle payment operations`, async () => {
            const authRequest = await createAuthenticatedRequest('user');
            
            const response = await authRequest
              .post(`/api/agents/${agentId}/chat`)
              .send({
                message: 'Create a payment plan',
                includePayment: true
              })
              .expect(200);

            expect(response.body.metadata?.paymentOptions).toBeDefined();
          });
        }

        if (mapping.layers.includes('ESA-26')) {
          it(`${agentId} should provide recommendations`, async () => {
            const authRequest = await createAuthenticatedRequest('user');
            
            const response = await authRequest
              .post(`/api/agents/${agentId}/chat`)
              .send({
                message: 'Give me recommendations',
                includeRecommendations: true
              })
              .expect(200);

            expect(response.body.metadata?.recommendations).toBeDefined();
            expect(response.body.metadata.recommendations.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe('Multi-Agent Collaboration', () => {
    it('should coordinate between health-advisor and nutrition-specialist', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const sessionId = `collab-${Date.now()}`;

      // Start with health advisor
      const healthResponse = await authRequest
        .post('/api/agents/health-advisor/chat')
        .send({
          message: 'I need a comprehensive health plan',
          sessionId,
          allowHandoff: true
        })
        .expect(200);

      expect(healthResponse.body.metadata?.handoffTo).toBe('nutrition-specialist');

      // Continue with nutrition specialist
      const nutritionResponse = await authRequest
        .post('/api/agents/nutrition-specialist/chat')
        .send({
          message: 'Continue the health plan discussion',
          sessionId,
          previousAgent: 'health-advisor'
        })
        .expect(200);

      expect(nutritionResponse.body.response).toContain('health');
      expect(nutritionResponse.body.metadata?.context).toContain('health-advisor');
    });

    it('should coordinate between career-coach and education-mentor', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const sessionId = `career-${Date.now()}`;

      // Start with career coach
      const careerResponse = await authRequest
        .post('/api/agents/career-coach/chat')
        .send({
          message: 'I want to change careers to tech',
          sessionId
        })
        .expect(200);

      // Hand off to education mentor
      const educationResponse = await authRequest
        .post('/api/agents/education-mentor/chat')
        .send({
          message: 'What should I learn for a tech career?',
          sessionId,
          context: careerResponse.body.response
        })
        .expect(200);

      expect(educationResponse.body.response.toLowerCase()).toContain('tech');
    });

    it('should handle emergency escalation', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      // Non-emergency query to health advisor
      const response = await authRequest
        .post('/api/agents/health-advisor/chat')
        .send({
          message: 'I have severe chest pain and difficulty breathing',
          detectEmergency: true
        })
        .expect(200);

      // Should escalate to emergency advisor
      expect(response.body.metadata?.escalatedTo).toBe('emergency-advisor');
      expect(response.body.metadata?.priority).toBe('urgent');
    });
  });

  describe('Agent Memory Integration', () => {
    it('should share memories between related agents', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const userId = TEST_USERS.user.email;

      // Store preference with health advisor
      await authRequest
        .post('/api/agents/health-advisor/memory')
        .send({
          type: 'semantic',
          content: 'User is vegetarian',
          shared: true
        })
        .expect(201);

      // Nutrition specialist should access shared memory
      const response = await authRequest
        .post('/api/agents/nutrition-specialist/chat')
        .send({
          message: 'Create a meal plan for me',
          useSharedMemory: true
        })
        .expect(200);

      expect(response.body.response.toLowerCase()).toContain('vegetarian');
    });

    it('should maintain episodic memory across sessions', async () => {
      const authRequest = await createAuthenticatedRequest('user');
      const agentId = 'life-strategist';

      // First session
      const session1 = await authRequest
        .post(`/api/agents/${agentId}/chat`)
        .send({
          message: 'My goal is to run a marathon',
          storeMemory: true
        })
        .expect(200);

      // Later session should recall
      const session2 = await authRequest
        .post(`/api/agents/${agentId}/chat`)
        .send({
          message: 'What was my fitness goal?',
          recallMemory: true
        })
        .expect(200);

      expect(session2.body.response.toLowerCase()).toContain('marathon');
    });
  });

  describe('Performance and Scaling', () => {
    it('should handle concurrent agent requests efficiently', async () => {
      const startTime = Date.now();
      const concurrentRequests = 10;

      const promises = Array(concurrentRequests).fill(null).map(async (_, i) => {
        const authRequest = await createAuthenticatedRequest('user');
        const agentId = Object.keys(AGENT_LAYER_MAPPINGS)[i % 16];
        
        return authRequest
          .post(`/api/agents/${agentId}/chat`)
          .send({ message: 'Concurrent test' });
      });

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time (avg < 500ms per request)
      expect(totalTime).toBeLessThan(concurrentRequests * 500);
    });

    it('should route to least busy agent', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      // Simulate busy agents
      const busyPromises = Array(5).fill(null).map(() =>
        authRequest
          .post('/api/agents/health-advisor/chat')
          .send({ message: 'Long running task', simulateDelay: 2000 })
      );

      // New request should route to alternative
      const routeResponse = await authRequest
        .post('/api/agents/route')
        .send({
          query: 'I need health advice',
          avoidBusy: true
        })
        .expect(200);

      // Should route to fitness-trainer or nutrition-specialist
      expect(['fitness-trainer', 'nutrition-specialist'].includes(routeResponse.body.selectedAgent)).toBe(true);

      await Promise.all(busyPromises);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle AI service failures gracefully', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      // Simulate AI service failure
      const response = await authRequest
        .post('/api/agents/career-coach/chat')
        .send({
          message: 'Test message',
          simulateAIFailure: true
        })
        .expect(200);

      // Should fallback to template response
      expect(response.body.fallback).toBe(true);
      expect(response.body.response).toContain('temporarily unavailable');
    });

    it('should handle memory service failures', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      const response = await authRequest
        .post('/api/agents/life-strategist/chat')
        .send({
          message: 'Remember this goal',
          simulateMemoryFailure: true
        })
        .expect(200);

      // Should continue without memory
      expect(response.body.metadata?.memoryDisabled).toBe(true);
      expect(response.body.response).toBeDefined();
    });

    it('should circuit break on repeated failures', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        await authRequest
          .post('/api/agents/health-advisor/chat')
          .send({
            message: 'Test',
            simulateFailure: true
          });
      }

      // Circuit should be open
      const response = await authRequest
        .post('/api/agents/health-advisor/chat')
        .send({ message: 'Normal request' })
        .expect(503);

      expect(response.body.error).toContain('circuit breaker');
    });
  });

  describe('Compliance and Security', () => {
    it('should not store sensitive health data without consent', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      const response = await authRequest
        .post('/api/agents/health-advisor/chat')
        .send({
          message: 'I have diabetes and take insulin',
          consentToStore: false
        })
        .expect(200);

      // Verify no health data was stored
      const memories = await authRequest
        .get('/api/agents/health-advisor/memories')
        .expect(200);

      const healthMemories = memories.body.memories.filter((m: any) => 
        m.content.includes('diabetes') || m.content.includes('insulin')
      );

      expect(healthMemories.length).toBe(0);
    });

    it('should encrypt sensitive financial data', async () => {
      const authRequest = await createAuthenticatedRequest('user');

      const response = await authRequest
        .post('/api/agents/financial-advisor/memory')
        .send({
          type: 'semantic',
          content: 'Bank account: 123456789',
          sensitive: true
        })
        .expect(201);

      // Raw memory should be encrypted
      expect(response.body.encrypted).toBe(true);
      expect(response.body.content).not.toContain('123456789');
    });
  });
});

export default AGENT_LAYER_MAPPINGS;