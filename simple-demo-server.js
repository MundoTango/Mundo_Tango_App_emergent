/**
 * ESA Life CEO 61x21 Framework - Simple Demo Server
 * Minimal working server to demonstrate the platform functionality
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    framework: 'ESA Life CEO 61x21',
    timestamp: new Date().toISOString(),
    message: 'Life CEO & Mundo Tango Platform Demo Server'
  });
});

// API routes for demo
app.get('/api/status', (req, res) => {
  res.json({
    platform: 'Life CEO & Mundo Tango',
    framework: '61 Technical Layers × 21 Implementation Phases',
    status: 'Demo Mode Active',
    features: {
      aiAgents: '16 specialized agents (demo)',
      socialFeatures: 'Community management (demo)',
      realtime: 'WebSocket support (demo)',
      authentication: 'Replit OAuth (demo)',
      payments: 'Stripe integration (demo)'
    }
  });
});

app.get('/api/agents', (req, res) => {
  res.json({
    agents: [
      { id: 1, name: 'Mundo Tango CEO', status: 'active', role: 'Platform Management' },
      { id: 2, name: 'Finance CEO', status: 'active', role: 'Financial Operations' },
      { id: 3, name: 'Travel CEO', status: 'active', role: 'Travel Planning' },
      { id: 4, name: 'Security Agent', status: 'active', role: 'Platform Security' },
      { id: 5, name: 'Memory Agent', status: 'active', role: 'Data Management' }
    ]
  });
});

app.get('/api/community', (req, res) => {
  res.json({
    groups: [
      { id: 1, name: 'Buenos Aires Tango', members: 156, location: 'Buenos Aires, Argentina' },
      { id: 2, name: 'New York Tango', members: 89, location: 'New York, USA' },
      { id: 3, name: 'Paris Tango', members: 124, location: 'Paris, France' }
    ],
    events: [
      { id: 1, title: 'Weekly Milonga', date: '2025-09-01', location: 'Buenos Aires' },
      { id: 2, title: 'Tango Workshop', date: '2025-09-03', location: 'New York' }
    ]
  });
});

// Serve the frontend
app.use(express.static(path.join(__dirname, 'client/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ESA 61x21] Life CEO Demo Server running on port ${PORT}`);
  console.log(`[ESA 61x21] Platform: Life CEO & Mundo Tango`);
  console.log(`[ESA 61x21] Framework: 61 Technical Layers × 21 Implementation Phases`);
  console.log(`[ESA 61x21] Mode: Demo - All features available for testing`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[ESA 61x21] Demo server shutting down...');
  process.exit(0);
});