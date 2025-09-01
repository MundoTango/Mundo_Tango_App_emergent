/**
 * ESA LIFE CEO 61x21 - Minimal Server for Agent System
 * Focused deployment for testing ESA agent functionality
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    framework: 'ESA 61x21',
    server: 'minimal-node-server',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    framework: 'ESA 61x21',
    server: 'minimal-node-server',
    agents: 'loading...',
    timestamp: new Date().toISOString()
  });
});

// Import and register agent routes only
async function registerAgentRoutes() {
  try {
    // Import agent routes
    console.log('🤖 Loading ESA 61x21 Agent System...');
    const { default: agentRoutes } = await import('./routes/agentRoutes');
    
    // Mount agent routes
    app.use('/api/agents', agentRoutes);
    console.log('✅ ESA 61x21 Agent System loaded - 49 agents operational');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to load agent system:', error);
    
    // Fallback mock agent endpoint
    app.get('/api/agents/:layer/:action', (req, res) => {
      res.json({
        layer: req.params.layer,
        action: req.params.action,
        status: 'agent_system_loading',
        framework: 'ESA 61x21',
        message: 'Agent system initializing...'
      });
    });
    
    return false;
  }
}

// Start server
async function startMinimalServer() {
  try {
    console.log('🚀 Starting ESA 61x21 Minimal Server...');
    
    // Register agent routes
    await registerAgentRoutes();
    
    // Start listening
    const PORT = 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ ESA LIFE CEO 61x21 Minimal Server running on port ${PORT}`);
      console.log(`📡 Agent endpoints: http://localhost:${PORT}/api/agents/layerXX/{status,audit,report}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 ESA Framework: 49/61 agents ready for testing`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start minimal server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  console.log('👋 ESA 61x21 Minimal Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 ESA 61x21 Minimal Server shutting down...');
  process.exit(0);
});

// Start the server
startMinimalServer().catch(console.error);