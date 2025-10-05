/**
 * ESA 61x21 Multi-Agent System Server Integration
 * Integrates the ESA agent system with the main application server
 */

import { Express } from 'express';
import { Server as SocketServer } from 'socket.io';
import { 
  agentRouter, 
  initializeAgentSystem,
  initializeAgentWebSockets,
  shutdownAgentSystem 
} from './api-integration';

/**
 * Integrate ESA Agent System with Express App
 */
export async function integrateESAAgentSystem(app: Express, io?: SocketServer) {
  try {
    console.log('🚀 Integrating ESA 61x21 Multi-Agent System...');
    
    // Initialize the agent system
    await initializeAgentSystem();
    
    // Register API routes
    app.use('/api/esa-agents', agentRouter);
    console.log('✅ ESA Agent API routes registered at /api/esa-agents');
    
    // Initialize WebSocket handlers if Socket.IO is available
    if (io) {
      initializeAgentWebSockets(io);
      console.log('✅ ESA Agent WebSocket handlers initialized');
    }
    
    // Register graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Gracefully shutting down ESA Agent System...');
      await shutdownAgentSystem();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('🛑 Gracefully shutting down ESA Agent System...');
      await shutdownAgentSystem();
      process.exit(0);
    });
    
    console.log('🎯 ESA Multi-Agent System integration complete!');
    console.log('📚 Documentation: /api/esa-agents/status');
    console.log('📊 Knowledge Graph: /api/esa-agents/knowledge-graph');
    console.log('🤖 Agent Domains: /api/esa-agents/agents');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to integrate ESA Agent System:', error);
    throw error;
  }
}

/**
 * Quick test endpoints for verification
 */
export function registerTestEndpoints(app: Express) {
  // Test parallel execution
  app.post('/api/esa-test/parallel', async (req, res) => {
    try {
      const testTasks = [
        { agentId: 'infrastructure', jobName: 'optimize', data: { target: 'database' } },
        { agentId: 'frontend', jobName: 'cache_invalidate', data: { components: ['PostFeed'] } },
        { agentId: 'analytics', jobName: 'search', data: { query: 'test' } }
      ];
      
      const response = await fetch('http://localhost:5000/api/esa-agents/execute/parallel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: testTasks })
      });
      
      const result = await response.json();
      res.json({ test: 'parallel', result });
    } catch (error) {
      res.status(500).json({ error: 'Test failed', details: (error as Error).message });
    }
  });
  
  // Test agent health
  app.get('/api/esa-test/health', async (req, res) => {
    try {
      const response = await fetch('http://localhost:5000/api/esa-agents/status');
      const result = await response.json();
      res.json({ test: 'health', result });
    } catch (error) {
      res.status(500).json({ error: 'Health check failed', details: (error as Error).message });
    }
  });
  
  console.log('✅ ESA test endpoints registered at /api/esa-test');
}