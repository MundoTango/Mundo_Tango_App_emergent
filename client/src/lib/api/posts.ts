// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Posts API Service Layer
// Handles all post-related API interactions

import { apiRequest } from '@/lib/queryClient';

// Types for posts
export interface PostUser {
  id: string | number;
  name: string;
  username: string;
  profileImage?: string;
}

export interface Post {
  id: string;
  user: PostUser;
  content: string;
  location?: string;
  tags?: string[];
  visibility?: 'public' | 'friends' | 'private';
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  mediaUrls?: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export interface CreatePostData {
  content: string;
  visibility?: 'public' | 'friends' | 'private';
  location?: string;
  tags?: string[];
  images?: File[];
}

// API Service
export const postsAPI = {
  // Fetch posts feed with pagination and filtering
  async getFeed(params?: { page?: number; limit?: number; tags?: string[] }) {
    const queryParams = new URLSearchParams();
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;
    
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    
    if (params?.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    
    const response = await fetch(`/api/posts/feed?${queryParams}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    return {
      posts: data.data || [],
      hasMore: data.hasMore !== false,
      total: data.total || 0
    };
  },

  // Create a new post with media
  async createPost(formData: FormData) {
    // ESA Fix: Use direct endpoint for recommendation support
    const response = await fetch('/api/posts/direct', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: formData.get('content'),
        richContent: formData.get('richContent'),
        visibility: formData.get('visibility') || 'public',
        hashtags: formData.getAll('tags'),
        mentions: formData.getAll('mentions'),
        location: formData.get('location'),
        isRecommendation: formData.get('isRecommendation') === 'true',
        recommendationType: formData.get('recommendationType'),
        priceRange: formData.get('priceRange'),
        mediaUrls: [], // TODO: Handle media uploads
        cloudMediaUrls: []
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }
    
    return response.json();
  },

  // Toggle like/unlike
  async toggleReaction(postId: string, type: string = 'like') {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });
    
    if (!response.ok) throw new Error('Failed to toggle reaction');
    return response.json();
  },

  // Add comment
  async addComment(postId: string, content: string) {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  // Get comments for a post
  async getComments(postId: string) {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    const data = await response.json();
    return data.data || [];
  },

  // Update post
  async updatePost(postId: string, updates: Partial<CreatePostData>) {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  },

  // Delete post
  async deletePost(postId: string) {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },

  // Report post
  async reportPost(postId: string, reason: string) {
    const response = await fetch(`/api/posts/${postId}/report`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    
    if (!response.ok) throw new Error('Failed to report post');
    return response.json();
  },

  // Share post
  async sharePost(postId: string, platform?: string) {
    const response = await fetch(`/api/posts/${postId}/share`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ platform })
    });
    
    if (!response.ok) throw new Error('Failed to share post');
    return response.json();
  }
};