// ESA LIFE CEO 61x21 - Optimized Post Routes with full update support
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { getUserId } from '../utils/authHelper';
import { db } from '../db';
import { posts, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// ESA LIFE CEO 56x21 - Delete post endpoint (missing functionality)
router.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
  // DELETE /api/posts/:id initiated
  
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    let user = await storage.getUser(userId);
    if (!user && typeof userId === 'string') {
      user = await storage.getUserByReplitId(userId);
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if post exists and user owns it
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }
    
    // Check ownership or admin status
    const isOwner = post.userId === user.id;
    const isAdmin = user.username === 'admin' || user.email?.includes('admin');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to delete this post' 
      });
    }
    
    // Delete the post
    await db.delete(posts).where(eq(posts.id, postId));
    
    // Post deleted successfully
    
    return res.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
    
  } catch (error: any) {
    console.error('Delete post error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to delete post',
      error: error.message 
    });
  }
});

// ESA LIFE CEO 61x21 - Full-featured update post endpoint
const updatePostHandler = async (req: any, res: any) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserId(req);
    const { 
      content, 
      location, 
      visibility,
      mediaEmbeds,
      mentions,
      hashtags,
      isPublic,
      imageUrl,
      videoUrl
    } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    let user = await storage.getUser(userId);
    if (!user && typeof userId === 'string') {
      user = await storage.getUserByReplitId(userId);
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if post exists and user owns it
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }
    
    if (post.userId !== user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only edit your own posts' 
      });
    }
    
    // Build update object with all provided fields
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Only update fields that were provided
    if (content !== undefined) updateData.content = content;
    if (location !== undefined) updateData.location = location;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (hashtags !== undefined) updateData.hashtags = Array.isArray(hashtags) ? hashtags : [];
    
    // Handle visibility/isPublic conversion
    if (visibility !== undefined) {
      updateData.isPublic = visibility === 'public';
    } else if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }
    
    // Handle mediaEmbeds - extract image and video URLs
    if (mediaEmbeds && Array.isArray(mediaEmbeds)) {
      const images = mediaEmbeds.filter(m => m.type === 'image');
      const videos = mediaEmbeds.filter(m => m.type === 'video');
      if (images.length > 0) updateData.imageUrl = images[0].url;
      if (videos.length > 0) updateData.videoUrl = videos[0].url;
    }
    
    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();
    
    // Get updated post with user info for response
    const [fullPost] = await db
      .select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        location: posts.location,
        hashtags: posts.hashtags,
        isPublic: posts.isPublic,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        userId: posts.userId,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);
    
    return res.json({ 
      success: true,
      message: 'Post updated successfully',
      data: fullPost 
    });
    
  } catch (error: any) {
    console.error('Update post error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update post',
      error: error.message 
    });
  }
};

// Support both PATCH and PUT methods for compatibility
router.patch('/api/posts/:id', isAuthenticated, updatePostHandler);
router.put('/api/posts/:id', isAuthenticated, updatePostHandler);

export default router;