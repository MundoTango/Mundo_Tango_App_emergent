// ESA LIFE CEO 61x21 - Tag Management Routes
import { Router } from 'express';
import { db } from '../db';
import { posts } from '../../shared/schema';
import { sql, desc } from 'drizzle-orm';

const router = Router();

// Get trending tags (most used in last 24 hours)
router.get('/api/tags/trending', async (req, res) => {
  try {
    // Get posts from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentPosts = await db
      .select({
        hashtags: posts.hashtags
      })
      .from(posts)
      .where(sql`${posts.createdAt} > ${oneDayAgo}`)
      .limit(100);
    
    // Count hashtag occurrences
    const tagCounts = new Map<string, number>();
    recentPosts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().replace('#', '');
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
        });
      }
    });
    
    // Sort by count and get top 10
    const trendingTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({
        name: tag,
        count,
        trending: true
      }));
    
    res.json({
      success: true,
      data: trendingTags
    });
  } catch (error: any) {
    console.error('Error fetching trending tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending tags',
      error: error.message
    });
  }
});

// Get recent tags (from most recent posts)
router.get('/api/tags/recent', async (req, res) => {
  try {
    const recentPosts = await db
      .select({
        hashtags: posts.hashtags,
        createdAt: posts.createdAt
      })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(20);
    
    // Extract unique recent tags
    const recentTagsSet = new Set<string>();
    recentPosts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().replace('#', '');
          recentTagsSet.add(normalizedTag);
        });
      }
    });
    
    const recentTags = Array.from(recentTagsSet)
      .slice(0, 10)
      .map(tag => ({
        name: tag,
        recent: true
      }));
    
    res.json({
      success: true,
      data: recentTags
    });
  } catch (error: any) {
    console.error('Error fetching recent tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent tags',
      error: error.message
    });
  }
});

// Get popular tags (most used overall)
router.get('/api/tags/popular', async (req, res) => {
  try {
    const allPosts = await db
      .select({
        hashtags: posts.hashtags
      })
      .from(posts)
      .limit(500);
    
    // Count all hashtag occurrences
    const tagCounts = new Map<string, number>();
    allPosts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().replace('#', '');
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
        });
      }
    });
    
    // Sort by count and get top 10
    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({
        name: tag,
        count,
        popular: true
      }));
    
    res.json({
      success: true,
      data: popularTags
    });
  } catch (error: any) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular tags',
      error: error.message
    });
  }
});

// Search tags (autocomplete)
router.get('/api/tags/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json({ success: true, data: [] });
    }
    
    const searchTerm = q.toLowerCase().replace('#', '');
    
    // Get all posts with hashtags
    const postsWithTags = await db
      .select({
        hashtags: posts.hashtags
      })
      .from(posts)
      .limit(200);
    
    // Extract unique matching tags
    const matchingTagsSet = new Set<string>();
    postsWithTags.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().replace('#', '');
          if (normalizedTag.includes(searchTerm)) {
            matchingTagsSet.add(normalizedTag);
          }
        });
      }
    });
    
    const matchingTags = Array.from(matchingTagsSet)
      .slice(0, 10)
      .map(tag => ({
        name: tag,
        match: true
      }));
    
    res.json({
      success: true,
      data: matchingTags
    });
  } catch (error: any) {
    console.error('Error searching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search tags',
      error: error.message
    });
  }
});

export default router;