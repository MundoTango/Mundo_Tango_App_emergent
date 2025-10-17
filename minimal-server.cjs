#!/usr/bin/env node
/**
 * ESA LIFE CEO 61×21 - Minimal Emergency Server
 * Provides basic API connectivity during recovery phase
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5000;

// Mock user for testing
const mockUser = {
  id: 'recovery-user-001',
  username: 'Recovery User',
  email: 'recovery@mundotango.com',
  role: 'admin',
  city: 'Buenos Aires',
  framework: 'ESA 61×21'
};

// Mock memories for testing
const mockMemories = [
  {
    id: 1,
    title: 'System Recovery in Progress',
    content: 'ESA 61×21 Emergency Recovery Protocol activated',
    author: mockUser,
    created_at: new Date().toISOString(),
    city: 'Buenos Aires',
    type: 'system'
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  // Health check endpoints
  if (path === '/health' || path === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      mode: 'emergency_recovery',
      framework: 'ESA Life CEO 61×21',
      timestamp: new Date().toISOString(),
      server: 'minimal'
    }));
    return;
  }

  // Authentication endpoint
  if (path === '/api/auth/user' || path === '/api/user') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      user: mockUser,
      authenticated: true,
      mode: 'recovery'
    }));
    return;
  }

  // Memories endpoint
  if (path === '/api/memories' || path.startsWith('/api/memories')) {
    if (method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        memories: mockMemories,
        total: mockMemories.length,
        mode: 'recovery'
      }));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const memoryData = JSON.parse(body);
          const newMemory = {
            id: Date.now(),
            ...memoryData,
            author: mockUser,
            created_at: new Date().toISOString(),
            mode: 'recovery'
          };
          mockMemories.push(newMemory);
          
          res.writeHead(201);
          res.end(JSON.stringify({
            success: true,
            memory: newMemory
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid JSON'
          }));
        }
      });
    }
    return;
  }

  // Groups endpoint
  if (path === '/api/groups' || path.startsWith('/api/groups')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      groups: [
        {
          id: 1,
          name: 'Buenos Aires Tango',
          city: 'Buenos Aires',
          members: 1,
          mode: 'recovery'
        }
      ],
      mode: 'recovery'
    }));
    return;
  }

  // Events endpoint
  if (path === '/api/events' || path.startsWith('/api/events')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      events: [
        {
          id: 1,
          title: 'System Recovery Complete',
          date: new Date().toISOString(),
          location: 'Platform',
          mode: 'recovery'
        }
      ],
      mode: 'recovery'
    }));
    return;
  }

  // Default API response
  if (path.startsWith('/api/')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'ESA 61×21 Minimal Recovery Server',
      endpoint: path,
      mode: 'recovery',
      framework: 'ESA Life CEO 61×21'
    }));
    return;
  }

  // 404 for non-API routes
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: 'Endpoint not found',
    path: path,
    mode: 'recovery'
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ESA 61×21 Minimal Recovery Server running on port ${PORT}`);
  console.log(`🔧 Mode: Emergency Recovery`);
  console.log(`🌊 Framework: ESA Life CEO 61×21`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/user`);
  console.log(`💭 Memories: http://localhost:${PORT}/api/memories`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Minimal server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});