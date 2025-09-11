/**
 * ESA LIFE CEO 61x21 - Fixed Posts Routes
 * Ensures media is properly returned with posts and handles file uploads
 */

import { Router } from 'express';
import { storage } from '../storage';
import { getUserId } from '../utils/authHelper';
import { openaiService } from '../services/openaiService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for handling file uploads
const uploadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Get user ID from request, reject if not authenticated
    const userId = await getUserId(req);
    if (!userId) {
      return cb(new Error('Authentication required'), '');
    }
    const uploadDir = path.join('uploads', 'posts', String(userId));
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const ext = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 3 // Max 3 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isValid = allowedTypes.test(ext);
    
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

/**
 * Get all posts - main endpoint
 */
router.get('/api/posts', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const posts = await storage.getFeedPosts(userId, limit, offset);
    
    res.json({
      success: true,
      data: posts || []
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.json({
      success: false,
      data: []
    });
  }
});

/**
 * Get posts feed with media support
 */
router.get('/api/posts/feed', async (req: any, res) => {
  try {
    // Posts feed requested
    
    // Get user from session - require authentication
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // ESA LIFE CEO 56x21 - Get posts from database using correct method
    const posts = await storage.getFeedPosts(userId, limit, offset);
    
    // ESA LIFE CEO 56x21 - Ensure media URLs are properly formatted
    const postsWithMedia = posts.map(post => {
      const formattedPost: any = {
        ...post,
        id: post.id || post.memoryId,
        content: post.content || '',
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        sharesCount: post.sharesCount || 0,
        createdAt: post.createdAt,
        user: post.user || {
          id: post.userId,
          name: post.userName || 'Unknown',
          username: post.userUsername || 'unknown',
          profileImage: post.userProfileImage
        }
      };

      // ESA LIFE CEO 56x21 - Ensure media URLs are properly formatted
      // First check mediaEmbeds (where we store all media URLs)
      if (post.mediaEmbeds && Array.isArray(post.mediaEmbeds) && post.mediaEmbeds.length > 0) {
        // Use mediaEmbeds as the source for all media URLs
        formattedPost.mediaUrls = post.mediaEmbeds.map((url: string) => 
          url.startsWith('/') ? url : `/${url}`
        );
        // Set imageUrl/videoUrl from mediaUrls for backward compatibility
        if (!formattedPost.imageUrl && formattedPost.mediaUrls.length > 0) {
          formattedPost.imageUrl = formattedPost.mediaUrls[0];
        }
        // Find and set video URL if exists
        const videoUrl = formattedPost.mediaUrls.find((url: string) =>
          url.toLowerCase().endsWith('.mp4') || 
          url.toLowerCase().endsWith('.mov') ||
          url.toLowerCase().endsWith('.webm') ||
          url.toLowerCase().endsWith('.avi')
        );
        if (videoUrl) {
          formattedPost.videoUrl = videoUrl;
        }
      } else if (post.imageUrl) {
        // Fallback to constructing from imageUrl/videoUrl
        const imageUrl = post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`;
        formattedPost.imageUrl = imageUrl;
        
        // Add to mediaUrls array for multiple media support
        formattedPost.mediaUrls = [imageUrl];
        
        // Also check for additional media
        if (post.videoUrl) {
          const videoUrl = post.videoUrl.startsWith('/') ? post.videoUrl : `/${post.videoUrl}`;
          formattedPost.mediaUrls.push(videoUrl);
          formattedPost.videoUrl = videoUrl;
        }
      } else if (post.media && Array.isArray(post.media)) {
        // Handle posts with media array
        formattedPost.mediaUrls = post.media.map((url: string) => 
          url.startsWith('/') ? url : `/${url}`
        );
        formattedPost.imageUrl = formattedPost.mediaUrls[0]; // Use first as primary
      }
      
      // ESA LIFE CEO 56x21 - Ensure mediaUrls is always an array
      if (!formattedPost.mediaUrls) {
        formattedPost.mediaUrls = [];
      }

      return formattedPost;
    });
    
    // Returning posts with media
    if (postsWithMedia.length > 0) {
      // Debug - First post media info logged
    }
    
    res.json({ 
      success: true, 
      data: postsWithMedia 
    });
    
  } catch (error: any) {
    console.error('❌ Posts feed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch posts',
      error: error.message 
    });
  }
});

/**
 * Get single post with media
 */
router.get('/api/posts/:id', async (req: any, res) => {
  try {
    const postId = req.params.id;
    const post = await storage.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    // Format post with media
    const formattedPost = {
      ...post,
      mediaUrls: post.imageUrl ? [post.imageUrl] : []
    };
    
    res.json({ 
      success: true, 
      data: formattedPost 
    });
    
  } catch (error: any) {
    console.error('❌ Get post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get post',
      error: error.message 
    });
  }
});

/**
 * Authentication middleware for file uploads
 */
const requireAuth = async (req: any, res: any, next: any) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  req.userId = userId;
  next();
};

/**
 * Create new post with media upload support
 */
router.post('/api/posts', requireAuth, upload.array('images', 3), async (req: any, res) => {
  try {
    // Use userId from requireAuth middleware
    const userId = req.userId || await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Handle file uploads if present
    const mediaUrls: string[] = [];
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // Generate relative URL for the uploaded file
        const relativeUrl = `/uploads/posts/${userId}/${file.filename}`;
        mediaUrls.push(relativeUrl);
        
        // Set imageUrl for the first image, videoUrl for the first video
        const ext = path.extname(file.filename).toLowerCase();
        if (!imageUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(ext)) {
          imageUrl = relativeUrl;
        } else if (!videoUrl && /\.(mp4|mov|avi|webm)$/i.test(ext)) {
          videoUrl = relativeUrl;
        }
      }
    }
    
    // Handle single file upload from 'image' field for backward compatibility
    if (req.file) {
      const relativeUrl = `/uploads/posts/${userId}/${req.file.filename}`;
      mediaUrls.push(relativeUrl);
      imageUrl = relativeUrl;
    }
    
    const postData = {
      content: req.body.content || '',
      userId,
      imageUrl,
      videoUrl,
      mediaEmbeds: mediaUrls,
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
      hashtags: req.body.hashtags ? (Array.isArray(req.body.hashtags) ? req.body.hashtags : [req.body.hashtags]) : [],
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    
    const newPost = await storage.createPost(postData);
    
    res.json({
      success: true,
      data: newPost
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

/**
 * Create new post (alternative endpoint for single image)
 */
router.post('/api/posts/with-image', requireAuth, upload.single('image'), async (req: any, res) => {
  try {
    // Use userId from requireAuth middleware
    const userId = req.userId || await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Handle single file upload
    let imageUrl: string | null = null;
    const mediaUrls: string[] = [];
    
    if (req.file) {
      const relativeUrl = `/uploads/posts/${userId}/${req.file.filename}`;
      mediaUrls.push(relativeUrl);
      imageUrl = relativeUrl;
    }
    
    const postData = {
      content: req.body.content || '',
      userId,
      imageUrl,
      mediaEmbeds: mediaUrls,
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
      hashtags: req.body.hashtags ? (Array.isArray(req.body.hashtags) ? req.body.hashtags : [req.body.hashtags]) : [],
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    
    const newPost = await storage.createPost(postData);
    
    res.json({
      success: true,
      data: newPost
    });
  } catch (error: any) {
    console.error('Error creating post with image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

/**
 * Update post
 */
router.put('/api/posts/:id', async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Verify ownership
    const post = await storage.getPostById(postId);
    if (!post || post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this post'
      });
    }
    
    const updatedPost = await storage.updatePost(postId, req.body);
    
    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
});

/**
 * Delete post
 */
router.delete('/api/posts/:id', async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Verify ownership
    const post = await storage.getPostById(postId);
    if (!post || post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this post'
      });
    }
    
    await storage.deletePost(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

/**
 * Like/Unlike post toggle
 */
router.post('/api/posts/:id/like', async (req: any, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if post exists
    const post = await storage.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user already liked the post
    const existingLike = await storage.checkPostLike(postId, userId);
    
    if (existingLike) {
      // Unlike the post
      await storage.unlikePost(postId, userId);
      res.json({
        success: true,
        liked: false,
        message: 'Post unliked successfully'
      });
    } else {
      // Like the post
      await storage.likePost(postId, userId);
      res.json({
        success: true,
        liked: true,
        message: 'Post liked successfully'
      });
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
});

/**
 * AI Enhancement endpoint for posts
 */
router.post('/api/posts/:id/enhance', async (req: any, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if post exists and user owns it
    const post = await storage.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to enhance this post'
      });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        enhanced: false,
        message: 'AI enhancement not available - no API key configured',
        original: post.content,
        enhanced: post.content
      });
    }
    
    try {
      // Use OpenAI service to enhance content
      const enhancementPrompt = [
        {
          role: 'system',
          content: 'You are a helpful assistant that enhances social media posts for a tango community platform. Make the content more engaging, add relevant emojis, and improve readability while keeping the original meaning. Keep it authentic and not overly promotional.'
        },
        {
          role: 'user',
          content: `Please enhance this tango community post: "${post.content}"`
        }
      ];
      
      const completion = await openaiService.createCompletion(enhancementPrompt);
      const enhancedContent = completion.choices[0]?.message?.content || post.content;
      
      res.json({
        success: true,
        enhanced: true,
        message: 'Content enhanced successfully',
        original: post.content,
        enhanced: enhancedContent.trim()
      });
      
    } catch (aiError: any) {
      console.error('AI enhancement error:', aiError);
      res.json({
        success: true,
        enhanced: false,
        message: 'AI enhancement temporarily unavailable',
        original: post.content,
        enhanced: post.content,
        error: aiError.message
      });
    }
    
  } catch (error: any) {
    console.error('Error enhancing post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance post',
      error: error.message
    });
  }
});

/**
 * AI Enhancement for new content (before posting)
 */
router.post('/api/posts/enhance-content', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for enhancement'
      });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        enhanced: false,
        message: 'AI enhancement not available - no API key configured',
        original: content,
        enhanced: content
      });
    }
    
    try {
      // Use OpenAI service to enhance content
      const enhancementPrompt = [
        {
          role: 'system',
          content: 'You are a helpful assistant that enhances social media posts for a tango community platform called Mundo Tango. Make the content more engaging, add relevant emojis, and improve readability while keeping the original meaning. Focus on tango culture, community, and passion. Keep it authentic and not overly promotional.'
        },
        {
          role: 'user',
          content: `Please enhance this tango community post: "${content}"`
        }
      ];
      
      const completion = await openaiService.createCompletion(enhancementPrompt);
      const enhancedContent = completion.choices[0]?.message?.content || content;
      
      res.json({
        success: true,
        enhanced: true,
        message: 'Content enhanced successfully',
        original: content,
        enhanced: enhancedContent.trim()
      });
      
    } catch (aiError: any) {
      console.error('AI enhancement error:', aiError);
      res.json({
        success: true,
        enhanced: false,
        message: 'AI enhancement temporarily unavailable',
        original: content,
        enhanced: content,
        error: aiError.message
      });
    }
    
  } catch (error: any) {
    console.error('Error enhancing content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance content',
      error: error.message
    });
  }
});

export default router;