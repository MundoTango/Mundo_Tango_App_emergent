#!/usr/bin/env node
/**
 * Simple Mundo Tango Memory Server
 * Basic implementation to test ESA 61×21 framework compliance
 */

const http = require('http');
const url = require('url');
const { Server } = require('socket.io');

// Enhanced memory data for production testing
let memories = [
  {
    id: 1,
    userId: 1,
    content: "Had an amazing tango class today! The connection with my partner was incredible. ✨ The abrazo felt perfect and the music by D'Arienzo just carried us across the floor. #tango #class #connection #darienzo",
    likesCount: 15,
    commentsCount: 4,
    sharesCount: 2,
    hashtags: ["tango", "class", "connection", "darienzo"],
    location: "La Viruta, Buenos Aires",
    isPublic: true,
    createdAt: new Date().toISOString(),
    user: {
      id: 1,
      name: "Maria Rodriguez",
      username: "maria_tango",
      profileImage: null
    },
    aiEnhanced: true,
    sentiment: "positive",
    mediaEmbeds: []
  },
  {
    id: 2,
    userId: 2,
    content: "Practicing my ocho cortado technique. Still working on the precision but getting better! 💃 The key is in the dissociation and timing with the music. #technique #ocho #practice #milonga",
    likesCount: 12,
    commentsCount: 6,
    sharesCount: 1,
    hashtags: ["technique", "ocho", "practice", "milonga"],
    location: "Salon Canning, Buenos Aires",
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 2,
      name: "Carlos Silva",
      username: "carlos_dance",
      profileImage: null
    },
    sentiment: "positive",
    mediaEmbeds: []
  },
  {
    id: 3,
    userId: 1,
    content: "First time at Confitería Ideal and I'm speechless! 😍 The history in these walls, the incredible architecture, and the most authentic milonga atmosphere. Every step felt like dancing with the ghosts of tango legends. #confiteriaideal #milonga #authentic #tangohistory",
    likesCount: 28,
    commentsCount: 8,
    sharesCount: 5,
    hashtags: ["confiteriaideal", "milonga", "authentic", "tangohistory"],
    location: "Confitería Ideal, Buenos Aires",
    isPublic: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: 1,
      name: "John Smith",
      username: "johnsmith_tango",
      profileImage: null
    },
    sentiment: "positive",
    mediaEmbeds: []
  },
  {
    id: 4,
    userId: 3,
    content: "Teaching my first workshop this weekend! 🎓 So excited to share the secrets of the perfect giro and how to find your axis. Remember: it's not about the steps, it's about the connection to the ground and your partner. #teaching #workshop #giro #technique",
    likesCount: 22,
    commentsCount: 12,
    sharesCount: 3,
    hashtags: ["teaching", "workshop", "giro", "technique"],
    location: "Academia de Tango Moreno, Buenos Aires",
    isPublic: true,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    user: {
      id: 3,
      name: "Isabella Martinez",
      username: "isa_tango_teacher",
      profileImage: null
    },
    sentiment: "positive",
    mediaEmbeds: []
  },
  {
    id: 5,
    userId: 4,
    content: "Last night at El Querandí was pure magic! 🎭 The orchestra, the dancers, the atmosphere... This is why I fell in love with Buenos Aires. Every couple told a story with their dance. #elquerandi #tango #show #buenosaires #magic",
    likesCount: 35,
    commentsCount: 15,
    sharesCount: 8,
    hashtags: ["elquerandi", "tango", "show", "buenosaires", "magic"],
    location: "El Querandí, Buenos Aires",
    isPublic: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    user: {
      id: 4,
      name: "Sophie Laurent",
      username: "sophie_paris_tango",
      profileImage: null
    },
    sentiment: "positive",
    mediaEmbeds: []
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

const PORT = process.env.PORT || 5000;

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
    
    // Authentication check endpoint - MAIN ENDPOINT USED BY FRONTEND
    if (path === '/api/auth/user' && req.method === 'GET') {
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
        lastSeen: new Date().toISOString(),
        formStatus: 100,
        isOnboardingComplete: true,
        codeOfConductAccepted: true,
        roles: ["user", "dancer"]
      };
      
      // Return user directly (not wrapped in success/data structure)
      sendJSON(res, 200, mockUser);
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
      
      // Broadcast new memory via Socket.io for real-time updates
      io.emit('memory:new', {
        memoryId: newMemory.id,
        userId: newMemory.userId,
        content: newMemory.content,
        user: newMemory.user,
        timestamp: newMemory.createdAt
      });
      
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
      
      // Broadcast like event via Socket.io for real-time updates
      io.to(`memory:${memory.id}`).emit('memory:liked', {
        memoryId: memory.id,
        userId: 999, // Current user ID
        newLikeCount: memory.likesCount,
        timestamp: new Date().toISOString()
      });
      
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
    
    // AI Enhancement endpoint with real GPT-4o integration
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
      
      // Check for OpenAI API key
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey && openaiKey !== 'test-openai-key') {
        try {
          // Real OpenAI integration
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are a tango community expert. Enhance user memories about tango experiences, adding emotional depth and cultural context while preserving the original voice. Keep enhancements under 50 words additional.'
                },
                {
                  role: 'user', 
                  content: `Enhance this tango memory: "${content}"`
                }
              ],
              max_tokens: 200,
              temperature: 0.7
            })
          });
          
          if (response.ok) {
            const aiResult = await response.json();
            const enhancedContent = aiResult.choices[0]?.message?.content || content;
            
            sendJSON(res, 200, {
              success: true,
              data: {
                originalContent: content,
                enhancedContent: enhancedContent,
                tags: options.generateTags ? generateTags(content) : [],
                sentiment: options.analyzeSentiment ? analyzeSentiment(content) : 'neutral',
                suggestions: options.optimizeEngagement ? generateSuggestions(content) : [],
                aiProvider: 'OpenAI GPT-4o',
                enhanced: true
              },
              timestamp: new Date().toISOString()
            });
            return;
          }
        } catch (error) {
          console.error('OpenAI API error:', error);
        }
      }
      
      // Fallback to mock enhancement if no API key or error
      const enhancementResult = {
        originalContent: content,
        enhancedContent: options.enhanceContent ? enhanceContent(content) : content,
        tags: options.generateTags ? generateTags(content) : [],
        sentiment: options.analyzeSentiment ? analyzeSentiment(content) : 'neutral',
        suggestions: options.optimizeEngagement ? generateSuggestions(content) : [],
        aiProvider: openaiKey ? 'OpenAI GPT-4o (Fallback)' : 'Mock AI (No API Key)',
        enhanced: false
      };
      
      sendJSON(res, 200, {
        success: true,
        data: enhancementResult,
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
  console.log('  GET  /api/auth/user  (MAIN AUTH ENDPOINT)');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /api/me');
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