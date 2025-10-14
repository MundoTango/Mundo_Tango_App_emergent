/**
 * Algorithm Agents API Routes
 * Chat with and control all platform algorithms (A1-Ax)
 */

import { Express, Request, Response } from 'express';
import { db } from '../db';
import { 
  algorithmAgents,
  algorithmParameters,
  algorithmChangelog,
  algorithmChatHistory,
  algorithmMetrics
} from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Import all algorithm agents
import { memoriesFeedAgent } from '../algorithms/A1_MemoriesFeedAgent';
import { friendRecommendationsAgent } from '../algorithms/A2_FriendRecommendationsAgent';
import { eventRankingsAgent } from '../algorithms/A3_EventRankingsAgent';
import { searchRelevanceAgent } from '../algorithms/A4_SearchRelevanceAgent';
import { notificationPriorityAgent } from '../algorithms/A5_NotificationPriorityAgent';
import { contentModerationAgent } from '../algorithms/A6_ContentModerationAgent';
import { housingMatchAgent } from '../algorithms/A7_HousingMatchAgent';
import { sentimentAnalysisAgent } from '../algorithms/A8_SentimentAnalysisAgent';
import { topicExtractionAgent } from '../algorithms/A9_TopicExtractionAgent';
import { userClusteringAgent } from '../algorithms/A10_UserClusteringAgent';
import { churnPredictionAgent } from '../algorithms/A11_ChurnPredictionAgent';
import { spamDetectionAgent } from '../algorithms/A12_SpamDetectionAgent';
import { imageRecognitionAgent } from '../algorithms/A13_ImageRecognitionAgent';
import { translationQualityAgent } from '../algorithms/A14_TranslationQualityAgent';
import { voiceCommandsAgent } from '../algorithms/A15_VoiceCommandsAgent';
import { cacheStrategyAgent } from '../algorithms/A16_CacheStrategyAgent';
import { queryOptimizationAgent } from '../algorithms/A17_QueryOptimizationAgent';
import { loadBalancingAgent } from '../algorithms/A18_LoadBalancingAgent';
import { resourceAllocationAgent } from '../algorithms/A19_ResourceAllocationAgent';
import { rateLimitingAgent } from '../algorithms/A20_RateLimitingAgent';
import { cdnRoutingAgent } from '../algorithms/A21_CDNRoutingAgent';
import { backgroundJobsAgent } from '../algorithms/A22_BackgroundJobsAgent';
import { fraudDetectionAgent } from '../algorithms/A23_FraudDetectionAgent';
import { accessControlAgent } from '../algorithms/A24_AccessControlAgent';
import { dataEncryptionAgent } from '../algorithms/A25_DataEncryptionAgent';
import { auditScoringAgent } from '../algorithms/A26_AuditScoringAgent';
import { mapRoutePlanningAgent } from '../algorithms/A27_MapRoutePlanningAgent';
import { calendarSchedulingAgent } from '../algorithms/A28_CalendarSchedulingAgent';
import { paymentProcessingAgent } from '../algorithms/A29_PaymentProcessingAgent';
import { analyticsAggregationAgent } from '../algorithms/A30_AnalyticsAggregationAgent';

// Registry of all algorithm agents
const algorithmRegistry = new Map([
  ['A1', memoriesFeedAgent],
  ['A2', friendRecommendationsAgent],
  ['A3', eventRankingsAgent],
  ['A4', searchRelevanceAgent],
  ['A5', notificationPriorityAgent],
  ['A6', contentModerationAgent],
  ['A7', housingMatchAgent],
  ['A8', sentimentAnalysisAgent],
  ['A9', topicExtractionAgent],
  ['A10', userClusteringAgent],
  ['A11', churnPredictionAgent],
  ['A12', spamDetectionAgent],
  ['A13', imageRecognitionAgent],
  ['A14', translationQualityAgent],
  ['A15', voiceCommandsAgent],
  ['A16', cacheStrategyAgent],
  ['A17', queryOptimizationAgent],
  ['A18', loadBalancingAgent],
  ['A19', resourceAllocationAgent],
  ['A20', rateLimitingAgent],
  ['A21', cdnRoutingAgent],
  ['A22', backgroundJobsAgent],
  ['A23', fraudDetectionAgent],
  ['A24', accessControlAgent],
  ['A25', dataEncryptionAgent],
  ['A26', auditScoringAgent],
  ['A27', mapRoutePlanningAgent],
  ['A28', calendarSchedulingAgent],
  ['A29', paymentProcessingAgent],
  ['A30', analyticsAggregationAgent],
]);

export function registerAlgorithmRoutes(app: Express) {
  
  /**
   * GET /api/algorithms - List all algorithm agents
   */
  app.get('/api/algorithms', async (req: Request, res: Response) => {
    try {
      const agents = await db
        .select()
        .from(algorithmAgents);
      
      res.json(agents);
    } catch (error) {
      console.error('Failed to fetch algorithms:', error);
      res.status(500).json({ error: 'Failed to fetch algorithms' });
    }
  });
  
  /**
   * GET /api/algorithms/:id - Get algorithm details
   */
  app.get('/api/algorithms/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const agent = await db
        .select()
        .from(algorithmAgents)
        .where(eq(algorithmAgents.id, id))
        .limit(1);
      
      if (agent.length === 0) {
        return res.status(404).json({ error: 'Algorithm not found' });
      }
      
      const params = await db
        .select()
        .from(algorithmParameters)
        .where(eq(algorithmParameters.algorithmId, id));
      
      res.json({
        ...agent[0],
        parameters: params
      });
    } catch (error) {
      console.error('Failed to fetch algorithm:', error);
      res.status(500).json({ error: 'Failed to fetch algorithm' });
    }
  });
  
  /**
   * POST /api/algorithms/:id/chat - Chat with algorithm agent
   */
  app.post('/api/algorithms/:id/chat', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user?.id || 1; // TODO: Get from auth
      
      const agent = algorithmRegistry.get(id);
      if (!agent) {
        return res.status(404).json({ error: 'Algorithm agent not found' });
      }
      
      // Initialize if needed
      await agent.initialize();
      
      // Chat with agent
      const response = await agent.chat(message, userId);
      
      res.json(response);
    } catch (error) {
      console.error('Failed to chat with algorithm:', error);
      res.status(500).json({ error: 'Failed to chat with algorithm' });
    }
  });
  
  /**
   * GET /api/algorithms/:id/parameters - Get algorithm parameters
   */
  app.get('/api/algorithms/:id/parameters', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const params = await db
        .select()
        .from(algorithmParameters)
        .where(eq(algorithmParameters.algorithmId, id));
      
      res.json(params);
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
      res.status(500).json({ error: 'Failed to fetch parameters' });
    }
  });
  
  /**
   * PUT /api/algorithms/:id/parameters/:name - Update parameter
   */
  app.put('/api/algorithms/:id/parameters/:name', async (req: Request, res: Response) => {
    try {
      const { id, name } = req.params;
      const { value, reason } = req.body;
      const userId = req.user?.id || 1; // TODO: Get from auth
      
      const agent = algorithmRegistry.get(id);
      if (!agent) {
        return res.status(404).json({ error: 'Algorithm agent not found' });
      }
      
      // Initialize if needed
      await agent.initialize();
      
      // Update parameter
      await agent.updateParameter(name, value, reason, userId);
      
      res.json({ 
        success: true, 
        message: `Parameter ${name} updated to ${value}` 
      });
    } catch (error: any) {
      console.error('Failed to update parameter:', error);
      res.status(500).json({ error: error.message || 'Failed to update parameter' });
    }
  });
  
  /**
   * POST /api/algorithms/:id/simulate - Simulate parameter changes
   */
  app.post('/api/algorithms/:id/simulate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { changes } = req.body;
      
      const agent = algorithmRegistry.get(id);
      if (!agent) {
        return res.status(404).json({ error: 'Algorithm agent not found' });
      }
      
      // Initialize if needed
      await agent.initialize();
      
      // Run simulation
      const result = await agent.simulate(changes);
      
      res.json(result);
    } catch (error) {
      console.error('Failed to simulate:', error);
      res.status(500).json({ error: 'Failed to simulate changes' });
    }
  });
  
  /**
   * GET /api/algorithms/:id/changelog - Get change history
   */
  app.get('/api/algorithms/:id/changelog', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const changelog = await db
        .select()
        .from(algorithmChangelog)
        .where(eq(algorithmChangelog.algorithmId, id))
        .orderBy(desc(algorithmChangelog.modifiedAt))
        .limit(50);
      
      res.json(changelog);
    } catch (error) {
      console.error('Failed to fetch changelog:', error);
      res.status(500).json({ error: 'Failed to fetch changelog' });
    }
  });
  
  /**
   * GET /api/algorithms/:id/chat-history - Get chat history
   */
  app.get('/api/algorithms/:id/chat-history', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;
      
      const history = await db
        .select()
        .from(algorithmChatHistory)
        .where(eq(algorithmChatHistory.algorithmId, id))
        .orderBy(desc(algorithmChatHistory.createdAt))
        .limit(50);
      
      res.json(history);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });
  
  /**
   * GET /api/algorithms/:id/metrics - Get performance metrics
   */
  app.get('/api/algorithms/:id/metrics', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const metrics = await db
        .select()
        .from(algorithmMetrics)
        .where(eq(algorithmMetrics.algorithmId, id))
        .orderBy(desc(algorithmMetrics.recordedAt))
        .limit(100);
      
      res.json(metrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });
  
  /**
   * GET /api/algorithms/:id/explain - Get algorithm explanation
   */
  app.get('/api/algorithms/:id/explain', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const agent = algorithmRegistry.get(id);
      if (!agent) {
        return res.status(404).json({ error: 'Algorithm agent not found' });
      }
      
      // Initialize if needed
      await agent.initialize();
      
      const explanation = agent.explain();
      
      res.json({ explanation });
    } catch (error) {
      console.error('Failed to get explanation:', error);
      res.status(500).json({ error: 'Failed to get explanation' });
    }
  });
  
  /**
   * POST /api/algorithms/initialize-all - Initialize all algorithm agents
   */
  app.post('/api/algorithms/initialize-all', async (req: Request, res: Response) => {
    try {
      const results = [];
      
      for (const [id, agent] of algorithmRegistry) {
        try {
          await agent.initialize();
          results.push({ id, status: 'initialized' });
        } catch (error: any) {
          results.push({ id, status: 'error', error: error.message });
        }
      }
      
      res.json({ 
        message: 'Algorithm initialization complete',
        results 
      });
    } catch (error) {
      console.error('Failed to initialize algorithms:', error);
      res.status(500).json({ error: 'Failed to initialize algorithms' });
    }
  });
}
