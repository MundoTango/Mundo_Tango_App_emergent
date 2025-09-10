#!/usr/bin/env node
/**
 * Mundo Tango Minimal Server for ESA 61×21 Testing
 * This server integrates Socket.io real-time features and AI agent functionality
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8001'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Mundo Tango Memories API',
    version: '1.0.0',
    features: ['socket.io', 'ai-integration', 'memories']
  });
});

// Mock memory endpoints for testing
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

// Get memories feed
app.get('/api/posts/feed', (req, res) => {
  console.log('📱 GET /api/posts/feed - Fetching memories feed');
  
  const { filterTags } = req.query;
  let filteredMemories = [...memories];
  
  if (filterTags) {
    const tags = filterTags.split(',').map(tag => tag.toLowerCase());
    filteredMemories = memories.filter(memory => 
      memory.hashtags?.some(tag => tags.includes(tag.toLowerCase()))
    );
  }
  
  // Sort by creation date (newest first)
  filteredMemories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    success: true,
    data: filteredMemories,
    total: filteredMemories.length,
    timestamp: new Date().toISOString()
  });
});

// Create new memory
app.post('/api/posts', (req, res) => {
  console.log('✨ POST /api/posts - Creating new memory');
  
  const { content, isPublic } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Content is required'
    });
  }
  
  const newMemory = {
    id: memories.length + 1,
    userId: 999, // Mock user ID
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
  
  // Emit real-time event to all connected clients
  if (io) {
    io.emit('memory:new', {
      memoryId: newMemory.id,
      userId: newMemory.userId,
      username: newMemory.user.name,
      content: newMemory.content,
      timestamp: newMemory.createdAt
    });
  }
  
  res.status(201).json({
    success: true,
    data: newMemory,
    message: 'Memory created successfully'
  });
});

// Like memory
app.post('/api/posts/:id/like', (req, res) => {
  console.log(`👍 POST /api/posts/${req.params.id}/like - Liking memory`);
  
  const memoryId = parseInt(req.params.id);
  const memory = memories.find(m => m.id === memoryId);
  
  if (!memory) {
    return res.status(404).json({
      success: false,
      message: 'Memory not found'
    });
  }
  
  // Toggle like (simple implementation)
  memory.likesCount += 1;
  
  res.json({
    success: true,
    data: {
      memoryId: memory.id,
      newLikeCount: memory.likesCount,
      action: 'liked'
    }
  });
});

// AI Enhancement endpoint
app.post('/api/memories/enhance', async (req, res) => {
  console.log('🤖 POST /api/memories/enhance - AI enhancing content');
  
  const { content, options = {} } = req.body;
  
  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Content is required for enhancement'
    });
  }
  
  try {
    // Simulate AI enhancement (since we can't connect to real Emergent LLM without proper setup)
    const enhancementResult = {
      originalContent: content,
      enhancedContent: options.enhanceContent ? enhanceContent(content) : content,
      tags: options.generateTags ? generateTags(content) : [],
      sentiment: options.analyzeSentiment ? analyzeSentiment(content) : 'neutral',
      suggestions: options.optimizeEngagement ? generateSuggestions(content) : []
    };
    
    res.json({
      success: true,
      data: enhancementResult,
      aiProvider: 'Mock AI (Emergent LLM simulation)',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'AI enhancement failed',
      error: error.message
    });
  }
});

// Helper functions for AI simulation
function enhanceContent(content) {
  // Simple content enhancement - add emotional context
  if (content.length < 50) {
    return content + " This moment captures the essence of tango - connection, passion, and pure joy.";
  }
  return content;
}

function generateTags(content) {
  const tangoTerms = ['tango', 'milonga', 'vals', 'embrace', 'connection', 'music', 'dance', 'partner', 'feeling', 'emotion', 'performance', 'practice', 'class', 'teacher', 'technique'];
  const contentLower = content.toLowerCase();
  const foundTags = tangoTerms.filter(term => contentLower.includes(term));
  
  // Add some common tango tags
  if (foundTags.length === 0) {
    foundTags.push('tango', 'dance');
  }
  
  return foundTags.slice(0, 5);
}

function analyzeSentiment(content) {
  const positiveWords = ['amazing', 'beautiful', 'wonderful', 'love', 'great', 'fantastic', 'joy', 'happy', 'incredible', 'perfect'];
  const negativeWords = ['difficult', 'struggling', 'hard', 'frustrated', 'sad', 'disappointed', 'tired'];
  
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
    "Try including specific tango techniques or music references",
    "Adding location context can make memories more vivid"
  ];
}

function extractHashtags(content) {
  const hashtagRegex = /#[\w]+/g;
  const hashtags = content.match(hashtagRegex);
  return hashtags ? hashtags.map(tag => tag.substring(1).toLowerCase()) : [];
}

// Socket.io setup for real-time features
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

console.log('🔌 Setting up Socket.io real-time features...');

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  // Join user rooms
  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined personal room`);
  });
  
  socket.on('join:memory', (memoryId) => {
    socket.join(`memory:${memoryId}`);
    console.log(`User joined memory room: ${memoryId}`);
  });
  
  // Handle memory likes with real-time broadcasting
  socket.on('memory:like', (data) => {
    console.log('📍 Memory like event:', data);
    
    socket.to(`memory:${data.memoryId}`).emit('memory:liked', {
      memoryId: data.memoryId,
      userId: data.userId,
      timestamp: new Date().toISOString(),
      type: 'like'
    });
    
    // Update the memory in our mock data
    const memory = memories.find(m => m.id === parseInt(data.memoryId));
    if (memory) {
      memory.likesCount += 1;
    }
  });
  
  // Handle real-time comments
  socket.on('memory:comment', (data) => {
    console.log('💬 Memory comment event:', data);
    
    const commentData = {
      memoryId: data.memoryId,
      userId: data.userId,
      username: data.data?.username,
      comment: data.data?.comment,
      timestamp: new Date().toISOString(),
      commentId: Date.now().toString()
    };
    
    socket.to(`memory:${data.memoryId}`).emit('memory:commented', commentData);
  });
  
  // Handle typing indicators
  socket.on('memory:typing', (data) => {
    console.log('⌨️ Typing event:', data);
    
    socket.to(`memory:${data.memoryId}`).emit('memory:user_typing', {
      memoryId: data.memoryId,
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle memory sharing
  socket.on('memory:share', (data) => {
    console.log('🔄 Memory share event:', data);
    
    io.emit('memory:shared', {
      memoryId: data.memoryId,
      userId: data.userId,
      username: data.data?.username,
      timestamp: new Date().toISOString()
    });
    
    // Update share count
    const memory = memories.find(m => m.id === parseInt(data.memoryId));
    if (memory) {
      memory.sharesCount += 1;
    }
  });
  
  // Handle new memory creation broadcasts
  socket.on('memory:created', (data) => {
    console.log('✨ New memory created:', data);
    
    socket.broadcast.emit('memory:new', {
      memoryId: data.memoryId,
      userId: data.userId,
      username: data.username,
      content: data.content,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle user presence
  socket.on('user:online', (userId) => {
    socket.broadcast.emit('user:presence', {
      userId,
      status: 'online',
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Mundo Tango Memories Server Started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('🔌 Socket.io real-time features enabled');
  console.log('🤖 AI memory enhancement available');
  console.log('📱 Memory API endpoints ready');
  console.log('✨ ESA 61×21 Framework compliance testing ready');
});

// Graceful shutdown
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

module.exports = { app, server, io };