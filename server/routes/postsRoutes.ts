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
    
    // ESA LIFE CEO 61x21 - Debug media fields
    if (posts && posts.length > 0) {
      console.log('🔍 ESA Layer 13: Posts fetched with media fields:');
      posts.forEach((post: any, index: number) => {
        if (post.mediaEmbeds || post.imageUrl || post.videoUrl) {
          console.log(`  Post ${post.id}: mediaEmbeds=${JSON.stringify(post.mediaEmbeds)}, imageUrl=${post.imageUrl}, videoUrl=${post.videoUrl}`);
        }
      });
    }
    
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
    console.log(`📊 Fetching feed posts for userId: ${userId}, limit: ${limit}, offset: ${offset}`);
    const posts = await storage.getFeedPosts(userId, limit, offset);
    console.log(`✅ Found ${posts.length} posts in database`);
    
    // ESA LIFE CEO 56x21 - Ensure media URLs are properly formatted
    const postsWithMedia = posts.map(post => {
      // ESA LIFE CEO 61×21 - Debug friendship data flow
      if (post.user && (post.user.id === 1 || post.user.id === 5)) {
        console.log('🔍 [ESA API Layer 2] Friend post data:', {
          postId: post.id,
          userId: post.user.id,
          userName: post.user.name,
          friendshipStatus: post.user.friendshipStatus,
          connectionType: post.user.connectionType
        });
      }
      
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
          profileImage: post.userProfileImage,
          // ESA LIFE CEO 61×21 - Layer 2: Include friendship data for "See Friendship" button
          friendshipStatus: post.user?.friendshipStatus || 'none',
          connectionType: post.user?.connectionType,
          tangoRoles: post.user?.tangoRoles,
          leaderLevel: post.user?.leaderLevel,
          followerLevel: post.user?.followerLevel
        }
      };

      // ESA LIFE CEO 56x21 - Ensure media URLs are properly formatted
      // First check mediaEmbeds (where we store all media URLs)
      if (post.mediaEmbeds && Array.isArray(post.mediaEmbeds) && post.mediaEmbeds.length > 0) {
        // ESA Layer 13: Handle both string and object formats in mediaEmbeds
        formattedPost.mediaUrls = post.mediaEmbeds.map((media: any) => {
          // If it's an object with url property (new format)
          if (typeof media === 'object' && media.url) {
            const url = media.url;
            return url.startsWith('/') ? url : `/${url}`;
          }
          // If it's a string (old format)
          else if (typeof media === 'string') {
            return media.startsWith('/') ? media : `/${media}`;
          }
          return null;
        }).filter(Boolean); // Remove any null values
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
    
    // ESA LIFE CEO 61×21 - Layer 2: Complete API data contracts
    // Calculate pagination metadata
    const totalPosts = await storage.getTotalPostsCount ? 
      await storage.getTotalPostsCount(userId) : 
      100; // Default to 100 if method doesn't exist
    const currentPage = Math.floor(offset / limit) + 1;
    // ESA Fix: Correct hasMore calculation - check if there are more posts beyond current offset
    const hasMore = (offset + postsWithMedia.length) < totalPosts;
    
    // ESA Layer 2: Return structure matching frontend expectations
    res.json({ 
      posts: postsWithMedia,
      hasMore: hasMore,
      total: totalPosts,
      page: currentPage
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
    
    // ESA Layer 16: Extract and validate mentions from content
    const mentions = req.body.mentions ? 
      (Array.isArray(req.body.mentions) ? req.body.mentions : [req.body.mentions]) : [];
    
    // Validate mentioned users exist
    const validMentions = mentions.length > 0 ? 
      await storage.validateUserIds(mentions) : [];
    
    const postData = {
      content: req.body.content || '',
      richContent: req.body.richContent || null,
      plainText: req.body.content || '', // ESA Layer 9: Plain text for search
      userId,
      imageUrl,
      videoUrl,
      mediaEmbeds: mediaUrls,
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
      hashtags: req.body.hashtags ? (Array.isArray(req.body.hashtags) ? req.body.hashtags : [req.body.hashtags]) : [],
      mentions: validMentions.map(id => id.toString()), // ESA Layer 16: Store validated mentions
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    
    const newPost = await storage.createPost(postData);
    
    // ESA Layer 16: Create mention notifications for tagged users
    if (validMentions.length > 0) {
      const notificationData = validMentions
        .filter(mentionId => mentionId !== userId) // Don't notify self-mentions
        .map(mentionedUserId => ({
          postId: newPost.id,
          mentionedUserId,
          mentioningUserId: userId
        }));
      
      if (notificationData.length > 0) {
        await storage.batchCreateMentionNotifications(notificationData);
        console.log(`📢 Created ${notificationData.length} mention notifications for post ${newPost.id}`);
      }
    }
    
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
    
    // ESA Layer 16: Extract and validate mentions
    const mentions = req.body.mentions ? 
      (Array.isArray(req.body.mentions) ? req.body.mentions : [req.body.mentions]) : [];
    const validMentions = mentions.length > 0 ? 
      await storage.validateUserIds(mentions) : [];
    
    const postData = {
      content: req.body.content || '',
      richContent: req.body.richContent || null,
      plainText: req.body.content || '', // ESA Layer 9: Plain text for search
      userId,
      imageUrl,
      mediaEmbeds: mediaUrls,
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
      hashtags: req.body.hashtags ? (Array.isArray(req.body.hashtags) ? req.body.hashtags : [req.body.hashtags]) : [],
      mentions: validMentions.map(id => id.toString()),
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
 * ESA Layer 13 Fix: Create post with direct media URLs (no file upload)
 * This endpoint accepts cloud media URLs directly without processing files
 */
router.post('/api/posts/direct', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { 
      content,
      richContent, 
      mediaUrls = [], 
      cloudMediaUrls = [],
      isPublic = true,
      hashtags = [],
      mentions = [],
      location,
      visibility = 'public',
      isRecommendation = false,
      recommendationType,
      priceRange 
    } = req.body;
    
    // ESA LIFE CEO 61x21 - Extract user IDs from @mentions in content
    const extractedMentions: string[] = [];
    if (content) {
      const mentionRegex = /@\[([^\]]+)\]\(user:(\d+)\)/g;
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        extractedMentions.push(match[2]); // Extract user ID
      }
    }
    
    // Combine extracted mentions with any provided mentions
    const allMentions = [...new Set([...extractedMentions, ...(Array.isArray(mentions) ? mentions : [])])];
    
    // Combine all media URLs
    const allMediaUrls = [...mediaUrls, ...cloudMediaUrls];
    
    // Extract first image and video URL for backward compatibility
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;
    
    for (const url of allMediaUrls) {
      const ext = path.extname(url).toLowerCase();
      if (!imageUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(ext)) {
        imageUrl = url;
      } else if (!videoUrl && /\.(mp4|mov|avi|webm)$/i.test(ext)) {
        videoUrl = url;
      }
    }
    
    const postData = {
      content: content || '',
      richContent: richContent || null,
      plainText: content || '', // ESA Layer 9: Plain text for search
      userId: Number(userId),
      imageUrl,
      videoUrl,
      mediaEmbeds: allMediaUrls,
      isPublic: visibility === 'public' || isPublic,
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      mentions: allMentions,
      location,
      visibility,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    
    const newPost = await storage.createPost(postData);
    
    // ESA Fix: Create recommendation in city groups if isRecommendation is true
    if (isRecommendation && newPost) {
      try {
        // Get user's city from their profile
        const user = await storage.getUser(Number(userId));
        if (user && user.city) {
          // Extract title from content (first line or first 100 chars)
          const title = content.split('\n')[0].substring(0, 100) || 'Recommendation';
          
          // Find the city group
          const cityGroup = await storage.getGroupBySlug(user.city.toLowerCase().replace(/\s+/g, '-'));
          
          // Create recommendation entry
          const recommendationData = {
            userId: Number(userId),
            postId: newPost.id,
            groupId: cityGroup?.id || null,
            title,
            description: content,
            type: recommendationType || 'general',
            address: location || null,
            city: user.city,
            state: user.state || null,
            country: user.country || 'Argentina',
            photos: allMediaUrls,
            tags: hashtags,
            isActive: true
          };
          
          await storage.createRecommendation(recommendationData);
          console.log('✅ Recommendation created for city:', user.city);
        }
      } catch (error) {
        console.error('⚠️ Failed to create recommendation:', error);
        // Don't fail the post creation if recommendation fails
      }
    }
    
    // ESA LIFE CEO 61x21 - Process @mentions and send notifications
    if (newPost && content) {
      try {
        const { MentionNotificationService } = await import('../services/mentionNotificationService');
        await MentionNotificationService.processMentions(
          content,
          Number(userId),
          'post',
          newPost.id,
          `/posts/${newPost.id}` // Action URL for notification click
        );
        console.log('✅ @mention notifications processed');
      } catch (error) {
        console.error('⚠️ Failed to process @mentions:', error);
        // Don't fail the post creation if mentions fail
      }
    }
    
    console.log('✅ Post created successfully via /api/posts/direct');
    
    res.json({
      success: true,
      data: newPost
    });
  } catch (error: any) {
    console.error('❌ Error creating post via direct endpoint:', error);
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

/**
 * ESA Layer 24: Entity mention filtering endpoints
 */

// Get posts mentioning a city
router.get('/api/posts/mentions/city/:cityId', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { cityId } = req.params;
    const { filter } = req.query; // 'residents' | 'visitors' | 'all'
    
    let posts = await storage.getPostsByMention('city', Number(cityId));
    
    // Apply membership filtering
    if (filter === 'residents') {
      const filtered = [];
      for (const post of posts) {
        const isResident = await storage.isUserInCity(post.userId, Number(cityId));
        if (isResident) filtered.push(post);
      }
      posts = filtered;
    } else if (filter === 'visitors') {
      const filtered = [];
      for (const post of posts) {
        const isResident = await storage.isUserInCity(post.userId, Number(cityId));
        if (!isResident) filtered.push(post);
      }
      posts = filtered;
    }
    
    res.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error fetching city mention posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

// Get posts mentioning a professional group
router.get('/api/posts/mentions/group/:groupId', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { groupId } = req.params;
    const { filter } = req.query; // 'members' | 'non-members' | 'all'
    
    let posts = await storage.getPostsByMention('group', Number(groupId));
    
    // Apply membership filtering
    if (filter === 'members') {
      const filtered = [];
      for (const post of posts) {
        const isMember = await storage.isUserInGroup(post.userId, Number(groupId));
        if (isMember) filtered.push(post);
      }
      posts = filtered;
    } else if (filter === 'non-members') {
      const filtered = [];
      for (const post of posts) {
        const isMember = await storage.isUserInGroup(post.userId, Number(groupId));
        if (!isMember) filtered.push(post);
      }
      posts = filtered;
    }
    
    res.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error fetching group mention posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

// Get posts mentioning an event
router.get('/api/posts/mentions/event/:eventId', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { eventId } = req.params;
    const { filter } = req.query; // 'participants' | 'guests' | 'all'
    
    let posts = await storage.getPostsByMention('event', Number(eventId));
    
    // Apply participant filtering
    if (filter === 'participants') {
      const filtered = [];
      for (const post of posts) {
        const isParticipant = await storage.isUserEventParticipant(post.userId, Number(eventId));
        if (isParticipant) filtered.push(post);
      }
      posts = filtered;
    } else if (filter === 'guests') {
      const filtered = [];
      for (const post of posts) {
        const isParticipant = await storage.isUserEventParticipant(post.userId, Number(eventId));
        if (!isParticipant) filtered.push(post);
      }
      posts = filtered;
    }
    
    res.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error fetching event mention posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

/**
 * ESA Framework - Tag System Endpoints
 */

// Get trending tags
router.get('/api/tags/trending', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get tags from posts in the last 7 days with counts
    const posts = await storage.getAllPosts();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const tagCounts = new Map();
    const previousCounts = new Map();
    
    // Count tags from recent posts
    posts.forEach(post => {
      if (new Date(post.createdAt) > sevenDaysAgo && post.hashtags) {
        post.hashtags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    // Get previous period for trend calculation
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    posts.forEach(post => {
      const postDate = new Date(post.createdAt);
      if (postDate > fourteenDaysAgo && postDate <= sevenDaysAgo && post.hashtags) {
        post.hashtags.forEach(tag => {
          previousCounts.set(tag, (previousCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    // Calculate trending tags with trend direction
    const trendingTags = Array.from(tagCounts.entries())
      .map(([name, count]) => {
        const prevCount = previousCounts.get(name) || 0;
        let trend = 'stable' as 'up' | 'down' | 'stable';
        let percentChange = 0;
        
        if (prevCount > 0) {
          percentChange = Math.round(((count - prevCount) / prevCount) * 100);
          trend = percentChange > 10 ? 'up' : percentChange < -10 ? 'down' : 'stable';
        } else {
          trend = 'up'; // New tag
          percentChange = 100;
        }
        
        return {
          name,
          count,
          trend,
          percentChange
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    res.json(trendingTags);
  } catch (error: any) {
    console.error('Error fetching trending tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending tags',
      error: error.message
    });
  }
});

// Get recent tags
router.get('/api/tags/recent', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const posts = await storage.getAllPosts();
    const recentTags = new Set();
    
    // Sort posts by creation date and get recent unique tags
    posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50) // Last 50 posts
      .forEach(post => {
        if (post.hashtags) {
          post.hashtags.forEach(tag => recentTags.add(tag));
        }
      });
    
    res.json(Array.from(recentTags).slice(0, 20));
  } catch (error: any) {
    console.error('Error fetching recent tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent tags',
      error: error.message
    });
  }
});

// Get popular tags
router.get('/api/tags/popular', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const posts = await storage.getAllPosts();
    const tagCounts = new Map();
    
    // Count all tags
    posts.forEach(post => {
      if (post.hashtags) {
        post.hashtags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    // Sort by count and get top tags
    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name);
    
    res.json(popularTags);
  } catch (error: any) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular tags',
      error: error.message
    });
  }
});

// Share post endpoint
router.post('/api/posts/share', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { postId, comment } = req.body;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    // Get the original post
    const originalPost = await storage.getPostById(postId);
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create a shared post with optional comment
    const sharedContent = comment 
      ? `${comment}\n\n---\nShared from @${originalPost.user.username}: ${originalPost.content}`
      : `Shared from @${originalPost.user.username}: ${originalPost.content}`;

    const sharedPost = await storage.createPost({
      userId,
      content: sharedContent,
      imageUrl: originalPost.imageUrl,
      videoUrl: originalPost.videoUrl,
      mediaEmbeds: originalPost.mediaEmbeds || [],
      isPublic: true,
      hashtags: originalPost.hashtags || [],
      sharedFromId: postId,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    });

    // Increment share count on original post
    await storage.updatePost(postId, {
      sharesCount: (originalPost.sharesCount || 0) + 1
    });

    res.json({
      success: true,
      post: sharedPost,
      message: 'Post shared successfully'
    });
  } catch (error: any) {
    console.error('Error sharing post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post',
      error: error.message
    });
  }
});

/**
 * ESA Layer 2: Get posts where current user is mentioned
 */
router.get('/api/mentions', async (req: any, res) => {
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

    const posts = await storage.getPostsWhereMentioned(userId, limit, offset);

    res.json({
      success: true,
      data: posts
    });
  } catch (error: any) {
    console.error('Error getting mention posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mention posts',
      error: error.message
    });
  }
});

/**
 * ESA Layer 16: Get mention notifications for current user
 */
router.get('/api/mentions/notifications', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const notifications = await storage.getMentionNotifications(userId);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error('Error getting mention notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mention notifications',
      error: error.message
    });
  }
});

/**
 * ESA Layer 16: Get unread mention notifications count
 */
router.get('/api/mentions/notifications/count', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const count = await storage.getUnreadMentionNotificationsCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    console.error('Error getting mention notifications count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mention notifications count',
      error: error.message
    });
  }
});

/**
 * ESA Layer 16: Mark mention notification as read
 */
router.patch('/api/mentions/notifications/:id/read', async (req: any, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const notificationId = parseInt(req.params.id);
    await storage.markMentionAsRead(notificationId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

export default router;