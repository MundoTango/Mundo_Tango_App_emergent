/**
 * TEST DATA ROUTES - Development/Testing Only
 * MB.MD COMPLETENESS LAW FIX: Oct 27, 2025
 * 
 * CRITICAL: Gated behind NODE_ENV check to prevent mock data in production
 * 
 * These routes provide mock data for development and testing purposes.
 * They will NOT work in production to prevent fake data pollution.
 */

import { Router } from 'express';

const router = Router();

// 🚨 MB.MD SAFETY: Only enable in development/test environments
const isDevelopment = process.env.NODE_ENV === 'development' || 
                      process.env.NODE_ENV === 'test' ||
                      !process.env.NODE_ENV; // Default to dev if not set

if (!isDevelopment) {
  console.warn('⚠️ [TEST DATA] Routes disabled in production mode');
}

// Mock test data for development
const mockMemories = [
  {
    id: '1',
    content: 'Just finished an amazing milonga at Salon Canning! The energy was incredible and the live orchestra made it unforgettable.',
    userId: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userName: 'Scott Boddye',
    userUsername: 'admin3304',
    userProfileImage: null,
    emotionTags: ['joyful', 'excited', 'grateful'],
    location: {
      name: 'Salon Canning',
      formatted_address: 'Av. Raúl Scalabrini Ortiz 1331, Buenos Aires, Argentina'
    },
    reactions: {
      love: 5,
      like: 12,
      wow: 3
    },
    userReaction: 'love',
    commentCount: 7,
    shareCount: 2
  },
  {
    id: '2',
    content: 'Learning the subtle art of cabeceo at a traditional milonga. It\'s fascinating how much communication happens without words in tango culture.',
    userId: 1,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userName: 'Scott Boddye',
    userUsername: 'admin3304',
    userProfileImage: null,
    emotionTags: ['curious', 'thoughtful', 'inspired'],
    location: {
      name: 'La Viruta',
      formatted_address: 'Armenia 1366, Buenos Aires, Argentina'
    },
    reactions: {
      like: 8,
      love: 2
    },
    userReaction: null,
    commentCount: 3,
    shareCount: 0
  },
  {
    id: '3',
    content: 'My first time dancing to Di Sarli\'s orchestra recordings. The pauses, the walks, the emotion - now I understand why he\'s called El Señor del Tango.',
    userId: 1,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    userName: 'Scott Boddye',
    userUsername: 'admin3304',
    userProfileImage: null,
    emotionTags: ['moved', 'nostalgic', 'passionate'],
    location: {
      name: 'Milonga del Indio',
      formatted_address: 'Virrey Cevallos 265, Buenos Aires, Argentina'
    },
    reactions: {
      love: 15,
      wow: 7,
      like: 20
    },
    userReaction: 'wow',
    commentCount: 12,
    shareCount: 5
  }
];

// 🚨 PRODUCTION SAFETY: Block mock endpoints in production
const ensureDevelopment = (req: any, res: any, next: any) => {
  if (!isDevelopment) {
    return res.status(403).json({
      error: 'Test data routes are disabled in production',
      message: 'These mock endpoints only work in development/test environments',
      environment: process.env.NODE_ENV || 'production'
    });
  }
  next();
};

// Apply development-only middleware to all routes
router.use(ensureDevelopment);

// Get test memories for feed
router.get('/api/posts/feed', (req, res) => {
  const filterBy = (req.query.filterBy as string) || 'all';
  const filterTags = (req.query.filterTags as string[]) || [];
  
  console.log('⚠️ [DEV MODE] Serving mock feed data');
  
  // Filter by tags if provided
  let filteredMemories = mockMemories;
  if (filterTags && Array.isArray(filterTags) && filterTags.length > 0) {
    filteredMemories = mockMemories.filter(memory => 
      filterTags.every(tag => memory.emotionTags.includes(tag))
    );
  }
  
  res.json({
    code: 200,
    message: '⚠️ DEV MODE: Test memories (mock data)',
    data: filteredMemories.map(memory => ({
      ...memory,
      user: {
        id: memory.userId,
        name: memory.userName,
        username: memory.userUsername,
        profileImage: memory.userProfileImage,
        tangoRoles: ['dancer', 'teacher', 'organizer']
      }
    }))
  });
});

// Get test comments for a memory
router.get('/api/memories/:id/comments', (req, res) => {
  console.log('⚠️ [DEV MODE] Serving mock comments');
  
  const mockComments = [
    {
      id: '1',
      memoryId: req.params.id,
      userId: 2,
      userName: 'Maria Garcia',
      content: 'That sounds amazing! Salon Canning is one of my favorite venues too.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      memoryId: req.params.id,
      userId: 3,
      userName: 'Carlos Rodriguez',
      content: 'The live orchestras there are always incredible. Which orchestra was playing?',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];
  
  res.json({
    code: 200,
    message: '⚠️ DEV MODE: Comments (mock data)',
    data: mockComments
  });
});

// Add reaction to memory
router.post('/api/memories/:id/reactions', (req, res) => {
  console.log('⚠️ [DEV MODE] Mock reaction endpoint');
  
  const { type } = req.body;
  res.json({
    code: 200,
    message: `⚠️ DEV MODE: Reaction ${type} (mock)`,
    data: { type, memoryId: req.params.id }
  });
});

// Add comment to memory
router.post('/api/memories/:id/comments', (req, res) => {
  console.log('⚠️ [DEV MODE] Mock comment endpoint');
  
  const { content } = req.body;
  res.json({
    code: 200,
    message: '⚠️ DEV MODE: Comment added (mock)',
    data: {
      id: Date.now().toString(),
      content,
      userId: 1,
      userName: 'Scott Boddye',
      createdAt: new Date().toISOString()
    }
  });
});

// Share memory
router.post('/api/memories/:id/share', (req, res) => {
  console.log('⚠️ [DEV MODE] Mock share endpoint');
  
  const { text } = req.body;
  res.json({
    code: 200,
    message: '⚠️ DEV MODE: Memory shared (mock)',
    data: {
      sharedMemoryId: req.params.id,
      shareText: text,
      sharedAt: new Date().toISOString()
    }
  });
});

export default router;
