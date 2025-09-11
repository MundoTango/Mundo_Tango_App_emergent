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
    
    // Get current user profile data
    if (path === '/api/user' && req.method === 'GET') {
      const mockUser = {
        id: 1,
        name: "John Smith",
        username: "johnsmith_tango",
        email: "john.smith@example.com",
        profileImage: null,
        backgroundImage: null,
        bio: "Passionate tango dancer from Buenos Aires. I love the connection and artistry of tango - it's not just a dance, it's a conversation between souls. Teaching and sharing the beauty of tango with the world. ¡Vamos a bailar! 💃🕺",
        city: "Buenos Aires",
        country: "Argentina",
        tangoRoles: ["leader", "teacher", "organizer"],
        yearsOfDancing: 8,
        leaderLevel: 4,
        followerLevel: 2,
        languages: ["Spanish", "English", "Portuguese"],
        socialLinks: {
          instagram: "@johnsmith_tango",
          facebook: "facebook.com/johnsmith.tango",
          website: "https://johnsmithtango.com"
        },
        createdAt: "2020-03-15T10:30:00.000Z",
        isOnline: true,
        lastSeen: new Date().toISOString()
      };
      
      sendJSON(res, 200, {
        success: true,
        data: mockUser,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Get user's own posts
    if (path === '/api/user/posts' && req.method === 'GET') {
      const userMemories = memories.filter(memory => memory.userId === 1); // Mock user's posts
      
      sendJSON(res, 200, {
        success: true,
        data: userMemories,
        total: userMemories.length,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Get user statistics
    if (path === '/api/user/stats' && req.method === 'GET') {
      const mockStats = {
        postsCount: memories.length,
        friendsCount: 42,
        eventsCount: 8,
        eventsAttended: 15,
        hostingCount: 3,
        attendedCount: 12,
        rolesAccepted: 6,
        likesReceived: 156,
        commentsReceived: 89,
        sharesReceived: 23,
        profileViews: 234,
        followersCount: 67,
        followingCount: 89
      };
      
      sendJSON(res, 200, {
        success: true,
        data: mockStats,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Get guest profile data  
    if (path === '/api/guest-profiles' && req.method === 'GET') {
      const mockGuestProfile = {
        id: 1,
        userId: 1,
        isVerified: true,
        verificationDate: "2024-01-15T10:30:00.000Z",
        hostingPreferences: {
          petFriendly: false,
          smokingAllowed: false,
          maxGuests: 2,
          availableDates: ["2025-02-01", "2025-02-15", "2025-03-01"]
        },
        guestPreferences: {
          dietary: ["vegetarian"],
          accessibility: [],
          languages: ["Spanish", "English"]
        },
        reviews: {
          averageRating: 4.8,
          totalReviews: 12,
          asHost: 8,
          asGuest: 4
        },
        status: "active"
      };
      
      sendJSON(res, 200, {
        success: true,
        data: mockGuestProfile,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Update user profile
    if (path === '/api/user/profile' && req.method === 'PUT') {
      const body = await parseBody(req);
      
      // Mock successful update
      sendJSON(res, 200, {
        success: true,
        message: "Profile updated successfully",
        data: {
          id: 1,
          ...body,
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Authentication check endpoint
    if (path === '/api/auth/me' && req.method === 'GET') {
      const mockUser = {
        id: 1,
        name: "John Smith",
        username: "johnsmith_tango",
        email: "john.smith@example.com",
        profileImage: null,
        backgroundImage: null,
        bio: "Passionate tango dancer from Buenos Aires. I love the connection and artistry of tango - it's not just a dance, it's a conversation between souls. Teaching and sharing the beauty of tango with the world. ¡Vamos a bailar! 💃🕺",
        city: "Buenos Aires",
        country: "Argentina",
        tangoRoles: ["leader", "teacher", "organizer"],
        yearsOfDancing: 8,
        leaderLevel: 4,
        followerLevel: 2,
        languages: ["Spanish", "English", "Portuguese"],
        socialLinks: {
          instagram: "@johnsmith_tango",
          facebook: "facebook.com/johnsmith.tango",
          website: "https://johnsmithtango.com"
        },
        createdAt: "2020-03-15T10:30:00.000Z",
        isOnline: true,
        lastSeen: new Date().toISOString()
      };
      
      sendJSON(res, 200, {
        success: true,
        data: mockUser,
        authenticated: true,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Alternative auth endpoint patterns that frontend might expect
    if (path === '/api/me' && req.method === 'GET') {
      const mockUser = {
        id: 1,
        name: "John Smith",
        username: "johnsmith_tango",
        email: "john.smith@example.com",
        profileImage: null,
        backgroundImage: null,
        bio: "Passionate tango dancer from Buenos Aires. I love the connection and artistry of tango - it's not just a dance, it's a conversation between souls. Teaching and sharing the beauty of tango with the world. ¡Vamos a bailar! 💃🕺",
        city: "Buenos Aires",
        country: "Argentina",
        tangoRoles: ["leader", "teacher", "organizer"],
        yearsOfDancing: 8,
        leaderLevel: 4,
        followerLevel: 2,
        languages: ["Spanish", "English", "Portuguese"],
        socialLinks: {
          instagram: "@johnsmith_tango",
          facebook: "facebook.com/johnsmith.tango",
          website: "https://johnsmithtango.com"
        },
        createdAt: "2020-03-15T10:30:00.000Z",
        isOnline: true,
        lastSeen: new Date().toISOString()
      };
      
      sendJSON(res, 200, {
        success: true,
        data: mockUser,
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
  console.log('  GET  /api/user');
  console.log('  GET  /api/user/posts');
  console.log('  GET  /api/user/stats');
  console.log('  GET  /api/guest-profiles');
  console.log('  PUT  /api/user/profile');
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