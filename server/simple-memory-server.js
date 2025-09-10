#!/usr/bin/env node
/**
 * Simple Mundo Tango Memory Server
 * Basic implementation to test ESA 61×21 framework compliance
 */

const http = require('http');
const url = require('url');

// Mock memory data
let memories = [
  {
    id: 1,
    userId: 1,
    content: "Had an amazing tango class today! The connection with my partner was incredible. ✨",
    likesCount: 5,
    commentsCount: 2,
    sharesCount: 1,
    hashtags: ["tango", "class", "connection"],
    isPublic: true,
    createdAt: new Date().toISOString(),
    user: {
      id: 1,
      name: "Maria Rodriguez",
      username: "maria_tango",
      profileImage: null
    },
    aiEnhanced: true,
    sentiment: "positive"
  },
  {
    id: 2,
    userId: 2,
    content: "Practicing my ocho cortado technique. Still working on the precision but getting better! 💃",
    likesCount: 8,
    commentsCount: 3,
    sharesCount: 0,
    hashtags: ["technique", "ocho", "practice"],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 2,
      name: "Carlos Silva",
      username: "carlos_dance",
      profileImage: null
    },
    sentiment: "positive"
  }
];

// Simple CORS headers
function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  addCorsHeaders(res);
  
  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  console.log(`${new Date().toISOString()} ${req.method} ${path}`);
  
  try {
    // Health check endpoint
    if (path === '/api/health' && req.method === 'GET') {
      sendJSON(res, 200, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Mundo Tango Memories API',
        version: '1.0.0-simple',
        features: ['basic-api', 'memories', 'mock-ai']
      });
      return;
    }
    
    // Get memories feed
    if (path === '/api/posts/feed' && req.method === 'GET') {
      let filteredMemories = [...memories];
      
      if (query.filterTags) {
        const tags = query.filterTags.split(',').map(tag => tag.toLowerCase());
        filteredMemories = memories.filter(memory => 
          memory.hashtags?.some(tag => tags.includes(tag.toLowerCase()))
        );
      }
      
      filteredMemories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      sendJSON(res, 200, {
        success: true,
        data: filteredMemories,
        total: filteredMemories.length,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Create new memory
    if (path === '/api/posts' && req.method === 'POST') {
      const body = await parseBody(req);
      const { content, isPublic } = body;
      
      if (!content || content.trim().length === 0) {
        sendJSON(res, 400, {
          success: false,
          message: 'Content is required'
        });
        return;
      }
      
      const newMemory = {
        id: memories.length + 1,
        userId: 999,
        content: content.trim(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        hashtags: extractHashtags(content),
        isPublic: isPublic !== false,
        createdAt: new Date().toISOString(),
        user: {
          id: 999,
          name: "Test User",
          username: "test_user",
          profileImage: null
        },
        sentiment: "neutral"
      };
      
      memories.unshift(newMemory);
      
      sendJSON(res, 201, {
        success: true,
        data: newMemory,
        message: 'Memory created successfully'
      });
      return;
    }
    
    // Like memory
    if (path.startsWith('/api/posts/') && path.endsWith('/like') && req.method === 'POST') {
      const memoryId = parseInt(path.split('/')[3]);
      const memory = memories.find(m => m.id === memoryId);
      
      if (!memory) {
        sendJSON(res, 404, {
          success: false,
          message: 'Memory not found'
        });
        return;
      }
      
      memory.likesCount += 1;
      
      sendJSON(res, 200, {
        success: true,
        data: {
          memoryId: memory.id,
          newLikeCount: memory.likesCount,
          action: 'liked'
        }
      });
      return;
    }
    
    // AI Enhancement endpoint
    if (path === '/api/memories/enhance' && req.method === 'POST') {
      const body = await parseBody(req);
      const { content, options = {} } = body;
      
      if (!content) {
        sendJSON(res, 400, {
          success: false,
          message: 'Content is required for enhancement'
        });
        return;
      }
      
      const enhancementResult = {
        originalContent: content,
        enhancedContent: options.enhanceContent ? enhanceContent(content) : content,
        tags: options.generateTags ? generateTags(content) : [],
        sentiment: options.analyzeSentiment ? analyzeSentiment(content) : 'neutral',
        suggestions: options.optimizeEngagement ? generateSuggestions(content) : []
      };
      
      sendJSON(res, 200, {
        success: true,
        data: enhancementResult,
        aiProvider: 'Mock AI (Emergent LLM simulation)',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // 404 for unknown endpoints
    sendJSON(res, 404, {
      success: false,
      message: 'Endpoint not found',
      path: path,
      method: req.method
    });
    
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, {
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper functions
function enhanceContent(content) {
  if (content.length < 50) {
    return content + " This moment captures the essence of tango - connection, passion, and pure joy.";
  }
  return content;
}

function generateTags(content) {
  const tangoTerms = ['tango', 'milonga', 'vals', 'embrace', 'connection', 'music', 'dance', 'partner', 'feeling', 'emotion'];
  const contentLower = content.toLowerCase();
  const foundTags = tangoTerms.filter(term => contentLower.includes(term));
  
  if (foundTags.length === 0) {
    foundTags.push('tango', 'dance');
  }
  
  return foundTags.slice(0, 5);
}

function analyzeSentiment(content) {
  const positiveWords = ['amazing', 'beautiful', 'wonderful', 'love', 'great', 'fantastic', 'joy', 'happy'];
  const negativeWords = ['difficult', 'struggling', 'hard', 'frustrated', 'sad', 'disappointed'];
  
  const contentLower = content.toLowerCase();
  const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function generateSuggestions(content) {
  return [
    "Consider adding more emotional details to enhance engagement",
    "Try including specific tango techniques or music references"
  ];
}

function extractHashtags(content) {
  const hashtagRegex = /#[\w]+/g;
  const hashtags = content.match(hashtagRegex);
  return hashtags ? hashtags.map(tag => tag.substring(1).toLowerCase()) : [];
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Simple Mundo Tango Memory Server Started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('📱 Memory API endpoints ready:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/posts/feed');
  console.log('  POST /api/posts');
  console.log('  POST /api/posts/:id/like');
  console.log('  POST /api/memories/enhance');
  console.log('✨ ESA 61×21 Framework basic compliance ready for testing');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});