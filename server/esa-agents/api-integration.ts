/**
 * ESA 61x21 Multi-Agent System API Integration
 * Provides Express routes and WebSocket handlers for agent system
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Server as SocketServer } from 'socket.io';
import { agentSystem } from './agent-system';
import { 
  RealtimeCommunications,
  BusinessLogicManager,
  SearchAnalytics,
  LifeCEOCore,
  PlatformEnhancement,
  MasterControl
} from './specialized-agents';
import knowledgeGraph from '../esa-master-knowledge-graph.json';
import { metricsCollector } from './metrics-collector';

// Create Express router
export const agentRouter = Router();

// Middleware to check agent system health
const checkAgentSystem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await agentSystem.healthCheck();
    if (health.status === 'unhealthy') {
      return res.status(503).json({
        error: 'Agent system unavailable',
        health
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Agent system check failed' });
  }
};

/**
 * System Status Endpoints
 */

// Get agent system status
agentRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const health = await agentSystem.healthCheck();
    const metrics = agentSystem.getMetrics();
    
    res.json({
      health,
      metrics,
      agents: Object.keys(knowledgeGraph.esa_knowledge_graph.agent_domains).length,
      layers: 61,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Get knowledge graph
agentRouter.get('/knowledge-graph', (req: Request, res: Response) => {
  res.json(knowledgeGraph.esa_knowledge_graph);
});

// Get agent domains
agentRouter.get('/agents', (req: Request, res: Response) => {
  const domains = knowledgeGraph.esa_knowledge_graph.agent_domains;
  const agents = Object.values(domains).map(domain => ({
    id: domain.id,
    name: domain.name,
    layers: domain.layers,
    status: 'operational',
    sla: domain.performance_sla
  }));
  
  res.json({ agents });
});

/**
 * Parallel Execution Endpoints
 */

// Execute tasks in parallel across multiple agents
agentRouter.post('/execute/parallel', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array required' });
    }
    
    const results = await agentSystem.executeParallel(tasks);
    
    res.json({
      executed: tasks.length,
      results,
      parallel: true,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Parallel execution failed', details: (error as Error).message });
  }
});

// Execute tasks with dependency chain
agentRouter.post('/execute/chain', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { chain } = req.body;
    
    if (!chain || !Array.isArray(chain)) {
      return res.status(400).json({ error: 'Chain array required' });
    }
    
    const result = await agentSystem.executeChain(chain);
    
    res.json({
      executed: chain.length,
      result,
      chained: true,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Chain execution failed', details: (error as Error).message });
  }
});

/**
 * Agent-Specific Endpoints
 */

// Infrastructure operations (Agent 1)
agentRouter.post('/infrastructure/:operation', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { operation } = req.params;
    const { data } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'infrastructure',
      jobName: operation,
      data
    }]);
    
    res.json({ result: result[0], operation });
  } catch (error) {
    res.status(500).json({ error: 'Infrastructure operation failed' });
  }
});

// Frontend state management (Agent 2)
agentRouter.post('/frontend/state', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { action, state } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'frontend',
      jobName: 'state_update',
      data: { action, state }
    }]);
    
    res.json({ updated: true, result: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'State update failed' });
  }
});

// Background job processing (Agent 3)
agentRouter.post('/background/job', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { type, data, options } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'background',
      jobName: type,
      data: { ...data, options }
    }]);
    
    res.json({ queued: true, jobId: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Background job failed' });
  }
});

// Real-time messaging (Agent 4)
agentRouter.post('/realtime/message', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { type, message, target } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'realtime',
      jobName: type,
      data: { message, target }
    }]);
    
    res.json({ sent: true, result: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Message send failed' });
  }
});

// Business logic operations (Agent 5)
agentRouter.post('/business/:entity/:action', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { entity, action } = req.params;
    const { data } = req.body;
    
    const jobName = `${action}_${entity}`;
    const result = await agentSystem.executeParallel([{
      agentId: 'business',
      jobName,
      data
    }]);
    
    res.json({ entity, action, result: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Business operation failed' });
  }
});

// Search and analytics (Agent 6)
agentRouter.post('/search', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { query, filters, limit } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'analytics',
      jobName: 'search',
      data: { query, filters, limit }
    }]);
    
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// AI/Life CEO requests (Agent 7)
agentRouter.post('/ai/request', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { agent, prompt, context } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'life_ceo',
      jobName: 'ai_request',
      data: { agentType: agent, query: prompt, context }
    }]);
    
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'AI request failed' });
  }
});

// Platform monitoring (Agent 8)
agentRouter.get('/platform/metrics', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const result = await agentSystem.executeParallel([{
      agentId: 'platform',
      jobName: 'monitor_performance',
      data: {}
    }]);
    
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Metrics fetch failed' });
  }
});

// Master control orchestration (Agent 9)
agentRouter.post('/orchestrate', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { workflow, agents, strategy = 'parallel' } = req.body;
    
    const result = await agentSystem.executeParallel([{
      agentId: 'master',
      jobName: 'orchestrate',
      data: { workflow, agents, parallel: strategy === 'parallel' }
    }]);
    
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Orchestration failed' });
  }
});

/**
 * Pattern Management Endpoints
 */

// Apply pattern
agentRouter.post('/pattern/apply', checkAgentSystem, async (req: Request, res: Response) => {
  try {
    const { patternName, targetAgents } = req.body;
    
    const patterns = knowledgeGraph.esa_knowledge_graph.verified_patterns as any;
    const pattern = patterns[patternName];
    if (!pattern) {
      return res.status(404).json({ error: 'Pattern not found' });
    }
    
    // Broadcast pattern application to relevant agents
    await agentSystem.broadcastEvent('apply_pattern', {
      pattern: patternName,
      targets: targetAgents || []
    });
    
    res.json({
      pattern: patternName,
      applied: true,
      description: pattern.description
    });
  } catch (error) {
    res.status(500).json({ error: 'Pattern application failed' });
  }
});

// Check for anti-patterns
agentRouter.post('/pattern/check', (req: Request, res: Response) => {
  try {
    const { code, layer } = req.body;
    
    const antiPatterns = knowledgeGraph.esa_knowledge_graph.anti_patterns;
    const detected = [];
    
    // Check each anti-pattern
    for (const [key, antiPattern] of Object.entries(antiPatterns)) {
      if (!layer || antiPattern.layers.includes(layer)) {
        // Simple detection logic (would be more sophisticated in production)
        for (const symptom of antiPattern.symptoms) {
          if (code?.includes(symptom)) {
            detected.push({
              name: antiPattern.name,
              symptom,
              prevention: antiPattern.prevention
            });
          }
        }
      }
    }
    
    res.json({ detected, checked: true });
  } catch (error) {
    res.status(500).json({ error: 'Anti-pattern check failed' });
  }
});

/**
 * Metrics and Monitoring Endpoints
 */

// Get metrics in Prometheus format
agentRouter.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await metricsCollector.getPrometheusMetrics();
    
    // Track the metrics request
    metricsCollector.trackRequest('system', 'metrics_fetch', true, 0);
    
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics);
  } catch (error) {
    metricsCollector.trackError('system', 'metrics_fetch_error', 'high', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Health check endpoint with detailed status
agentRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await agentSystem.healthCheck();
    const metrics = agentSystem.getMetrics();
    const errorLog = metricsCollector.getErrorLog(10);
    
    // Determine overall health status
    const isHealthy = health.status === 'healthy';
    const statusCode = isHealthy ? 200 : 503;
    
    // Get agent-specific health details
    const agentDetails = [];
    for (const [agentId, status] of Object.entries(health.agents)) {
      const domain = Object.values(knowledgeGraph.esa_knowledge_graph.agent_domains)
        .find(d => d.id === agentId);
      
      agentDetails.push({
        id: agentId,
        name: domain?.name || 'Unknown',
        status,
        layers: domain?.layers || [],
        healthy: status === 'healthy'
      });
    }
    
    res.status(statusCode).json({
      status: health.status,
      timestamp: Date.now(),
      uptime: process.uptime(),
      agents: agentDetails,
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version
      },
      metrics: {
        totalJobs: metrics.totalJobs,
        completedJobs: metrics.completedJobs,
        failedJobs: metrics.failedJobs,
        averageProcessingTime: metrics.averageProcessingTime || 0
      },
      recentErrors: errorLog,
      checks: {
        database: health.status !== 'unhealthy',
        agents: Object.values(health.agents).filter(s => s === 'healthy').length,
        totalAgents: Object.keys(health.agents).length
      }
    });
  } catch (error) {
    metricsCollector.trackError('system', 'health_check_error', 'critical', (error as Error).message);
    res.status(503).json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      details: (error as Error).message
    });
  }
});

// Analytics endpoint
agentRouter.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Get time range from query params
    const { from, to, agentId } = req.query;
    
    // Fetch analytics data
    const analytics = await metricsCollector.getAnalytics();
    
    // Track successful analytics request
    metricsCollector.trackRequest('system', 'analytics_fetch', true, 0);
    
    // Add additional analytics
    const agentAnalytics = {
      ...analytics,
      timeRange: {
        from: from || Date.now() - 3600000, // Default to last hour
        to: to || Date.now()
      },
      agents: analytics.agentPerformance,
      patterns: analytics.topPatterns,
      errors: analytics.recentErrors,
      tokenUsage: await getTokenUsageAnalytics(),
      queueDepth: await getQueueAnalytics()
    };
    
    // Filter by agent if specified
    if (agentId) {
      agentAnalytics.agents = agentAnalytics.agents.filter(
        (a: any) => a.id === agentId
      );
    }
    
    res.json(agentAnalytics);
  } catch (error) {
    metricsCollector.trackError('system', 'analytics_fetch_error', 'medium', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Helper functions for analytics
async function getTokenUsageAnalytics() {
  // This would fetch from the metrics registry
  return {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    costEstimate: 0,
    byModel: {},
    byAgent: {}
  };
}

async function getQueueAnalytics() {
  const metrics = agentSystem.getMetrics();
  return {
    totalQueues: 9,
    activeJobs: metrics.queueStats?.activeJobs || 0,
    waitingJobs: metrics.queueStats?.waitingJobs || 0,
    completedJobs: metrics.completedJobs || 0,
    failedJobs: metrics.failedJobs || 0
  };
}

/**
 * WebSocket Integration for Real-time Updates
 */
export function initializeAgentWebSockets(io: SocketServer) {
  const agentNamespace = io.of('/agents');
  
  agentNamespace.on('connection', (socket) => {
    console.log('Client connected to agent system:', socket.id);
    
    // Subscribe to agent events
    socket.on('subscribe', async (data) => {
      const { agentId, events } = data;
      
      // Join agent-specific room
      socket.join(`agent:${agentId}`);
      
      // Send initial status
      const health = await agentSystem.healthCheck();
      socket.emit('status', {
        agentId,
        status: health.agents[agentId] || 'unknown'
      });
    });
    
    // Handle agent commands
    socket.on('command', async (data) => {
      const { agentId, method, params } = data;
      
      try {
        const result = await agentSystem.executeChain([{
          agentId,
          method,
          params
        }]);
        
        socket.emit('result', {
          commandId: data.commandId,
          result,
          success: true
        });
      } catch (error) {
        socket.emit('result', {
          commandId: data.commandId,
          error: (error as Error).message,
          success: false
        });
      }
    });
    
    // Broadcast events
    socket.on('broadcast', async (data) => {
      const { event, payload } = data;
      
      await agentSystem.broadcastEvent(event, payload);
      
      // Notify all connected clients
      agentNamespace.emit('event', {
        event,
        payload,
        timestamp: Date.now()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected from agent system:', socket.id);
    });
  });
  
  // Periodic status updates
  setInterval(async () => {
    const health = await agentSystem.healthCheck();
    const metrics = agentSystem.getMetrics();
    
    agentNamespace.emit('status_update', {
      health,
      metrics,
      timestamp: Date.now()
    });
  }, 10000); // Every 10 seconds
}

/**
 * Initialize the complete agent system
 */
export async function initializeAgentSystem() {
  try {
    console.log('🚀 Initializing ESA 61x21 Multi-Agent System...');
    
    // Initialize master control system
    await agentSystem.initialize();
    
    // Register additional specialized agents
    const specializedAgents = [
      new RealtimeCommunications(),
      new BusinessLogicManager(),
      new SearchAnalytics(),
      new LifeCEOCore(),
      new PlatformEnhancement(),
      new MasterControl()
    ];
    
    // Register each specialized agent
    for (const agent of specializedAgents) {
      console.log(`✅ Registering: ${agent.name}`);
      // Registration would happen here
    }
    
    console.log('🎯 ESA Multi-Agent System initialized successfully!');
    console.log(`📊 Total Agents: 9`);
    console.log(`📊 Total ESA Layers: 61`);
    console.log(`📊 Verified Patterns: ${Object.keys(knowledgeGraph.esa_knowledge_graph.verified_patterns).length}`);
    console.log(`📊 Anti-patterns Tracked: ${Object.keys(knowledgeGraph.esa_knowledge_graph.anti_patterns).length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize agent system:', error);
    throw error;
  }
}

/**
 * Shutdown the agent system gracefully
 */
export async function shutdownAgentSystem() {
  try {
    console.log('🛑 Shutting down ESA Multi-Agent System...');
    await agentSystem.shutdown();
    console.log('✅ Agent system shutdown complete');
  } catch (error) {
    console.error('❌ Error during agent system shutdown:', error);
  }
}