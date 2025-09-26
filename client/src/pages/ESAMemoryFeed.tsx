// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Memory Feed (Unified) - Main "/" Route Implementation
// Following ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md specifications
// WITH RESILIENCE ARCHITECTURE - Prevents component failures and blank screens

// ESA Fix: Import React and hooks together to prevent null reference errors
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import io from 'socket.io-client';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { postsAPI } from '@/lib/api/posts';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/hooks/useAuth'; // ESA Framework Layer 4: Use existing auth

// RESILIENCE IMPORTS - Platform-wide protection
import { useResilientQuery } from '@/hooks/useResilientQuery';
import { withResilience } from '@/components/resilient/ResilientBoundary';
import { PostsFeedResponseSchema, normalizePostsResponse } from '@shared/schemas/posts';
import { safe, safeArray } from '@shared/resilience/guards';

// ESA Framework Canonical Components - Using standard layouts for consistency
import DashboardLayout from '@/layouts/DashboardLayout';
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
// ESA LIFE CEO 61×21 - Using unified feed component following Layer 9 UI Framework
const UnifiedPostFeed = lazy(() => import('@/components/moments/UnifiedPostFeed'));
const UpcomingEventsSidebar = lazy(() => import('@/components/esa/UpcomingEventsSidebar'));
const FloatingCreateButton = lazy(() => import('@/components/esa/FloatingCreateButton'));
const ShareModal = lazy(() => import('@/components/modern/ShareModal'));

// Core component without error boundary
function ESAMemoryFeedCore() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth(); // ESA Framework Layer 4: Get authenticated user
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  // Grid view removed per requirements - using feed only
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  
  // ESA LIFE CEO 61x21 - Memoize filters object to prevent React Query key instability
  const feedFilters = useMemo(() => ({
    filterType: 'all' as 'all' | 'following' | 'nearby',
    tags: [] as string[],
    visibility: 'all' as 'all' | 'public' | 'friends' | 'private'
  }), []);
  const [socket, setSocket] = useState<any>(null);
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [shareModalPost, setShareModalPost] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // ESA LIFE CEO 61×21 - Layer 9: Edit functionality with rich text editor
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Use ref for toast to prevent closure issues (ESA Framework pattern)
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // ESA Framework Layer 4: Set currentUserId from authenticated user
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(String(user.id));
      console.log('[ESA Debug] User authenticated from context, ID:', user.id);
    }
  }, [user]);

  // Initialize Socket.io connection ONCE on mount (ESA Framework pattern)
  useEffect(() => {
    // Connect to Socket.io server
    const socketConnection = io('/', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    setSocket(socketConnection);

    // Join memory feed room for updates
    socketConnection.emit('join-feed', { room: 'global-memories' });

    // Cleanup on unmount only
    return () => {
      socketConnection.emit('leave-feed', { room: 'global-memories' });
      socketConnection.disconnect();
    };
  }, []); // Empty dependency array - connect once!

  // Handle Socket.io real-time events with current state (ESA Framework pattern)
  useEffect(() => {
    if (!socket) return;

    // Remove old listeners before adding new ones to prevent memory leaks
    socket.off('new-post');
    socket.off('post-liked');
    socket.off('post-commented');
    socket.off('post-deleted');
    socket.off('user-typing');

    // Handle new posts
    const handleNewPost = (newPost: any) => {
      // Only add to feed if on first page
      if (page === 1) {
        setAllPosts(prev => [newPost, ...prev]);
        // Use toastRef for stable reference (ESA Framework pattern)
        toastRef.current({
          title: "New memory shared!",
          description: `${newPost.user?.name || 'Someone'} just posted a new tango moment`,
          duration: 3000
        });
      }
    };

    // Handle post likes
    const handlePostLiked = (data: { postId: string, likesCount: number }) => {
      setAllPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, likesCount: data.likesCount }
          : post
      ));
    };

    // Handle post comments
    const handlePostCommented = (data: { postId: string, commentsCount: number }) => {
      setAllPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, commentsCount: data.commentsCount }
          : post
      ));
    };

    // Handle post deletions
    const handlePostDeleted = (postId: string) => {
      setAllPosts(prev => prev.filter(post => post.id !== postId));
    };

    // Handle typing indicators
    const handleUserTyping = (data: { userId: string, postId: string, isTyping: boolean }) => {
      // Could be used to show typing indicators in comments
      console.log('User typing:', data);
    };

    // Register event listeners
    socket.on('new-post', handleNewPost);
    socket.on('post-liked', handlePostLiked);
    socket.on('post-commented', handlePostCommented);
    socket.on('post-deleted', handlePostDeleted);
    socket.on('user-typing', handleUserTyping);

    // Cleanup function to remove listeners
    return () => {
      socket.off('new-post', handleNewPost);
      socket.off('post-liked', handlePostLiked);
      socket.off('post-commented', handlePostCommented);
      socket.off('post-deleted', handlePostDeleted);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, page]); // ESA Framework: Keep dependencies minimal for stability


  // RESILIENT DATA FETCHING - Protected with validation and fallbacks
  const { 
    data: feedResponse, 
    isLoading, 
    isFetching, 
    error,
    isOffline,
    isDegraded,
    hasFallback 
  } = useResilientQuery({
    endpoint: `/api/posts/feed?limit=20&offset=${(page - 1) * 20}`,
    schema: PostsFeedResponseSchema,
    queryKey: ['/api/posts/feed', page],
    cacheKey: `posts-feed-page-${page}`,
    fallback: { posts: [], hasMore: false, total: 0, page },
    staleTime: 30 * 1000, // 30 seconds - use cached data when fresh
    retry: true // Enable resilient retry with exponential backoff
  });


  // ESA Framework: Process feed response and manage pagination
  useEffect(() => {
    if (feedResponse?.posts && Array.isArray(feedResponse.posts)) {
      const posts = feedResponse.posts;
      
      if (page > 1) {
        setAllPosts(prev => [...prev, ...posts]);
      } else {
        setAllPosts(posts);
      }
      
      // Update hasMore based on response
      const hasMorePosts = feedResponse.hasMore || posts.length === 20;
      setHasMore(hasMorePosts);
    }
  }, [feedResponse, page]);

  // RESILIENCE: Safe extraction with fallback to cached posts
  const posts = useMemo(() => {
    if (feedResponse?.posts && Array.isArray(feedResponse.posts)) {
      // ESA Layer 2: API Structure - Log full data contract
      console.log('[ESA MemoryFeed] Processing feed response:', {
        postsCount: feedResponse.posts.length,
        firstPost: feedResponse.posts[0],
        friendshipStatuses: feedResponse.posts.slice(0, 3).map((p: any) => ({
          userId: p.user?.id,
          userName: p.user?.name,
          friendshipStatus: p.user?.friendshipStatus
        }))
      });
      return feedResponse.posts;
    }
    // Fallback to accumulated posts if response is invalid
    return allPosts;
  }, [feedResponse, allPosts]);


  // ESA Framework Layer 9: Removed unused memoriesForGrid transformation - posts passed directly with user data intact

  // Create post mutation with FormData support
  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => postsAPI.createPost(formData),
    onSuccess: () => {
      toast({ 
        title: "Memory shared!",
        description: "Your tango moment has been posted successfully."
      });
      // Refresh the feed from the beginning
      setPage(1);
      setAllPosts([]);
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to share your memory. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle post submission
  const handleCreatePost = async (formData: FormData) => {
    createPostMutation.mutate(formData);
  };

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore && isInfiniteScrollEnabled) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore, isInfiniteScrollEnabled]);

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    if (!isInfiniteScrollEnabled) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isFetching && hasMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.8 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore, isFetching, hasMore, isInfiniteScrollEnabled]);

  // Keyboard shortcuts for navigation and actions
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Keyboard shortcuts
      switch(e.key.toLowerCase()) {
        case 'n':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Focus on post creator
            const creator = document.querySelector('[data-testid="post-creator"]') as HTMLElement;
            creator?.focus();
          }
          break;
        case 'g':
          if (!e.ctrlKey && !e.metaKey) {
            // Grid view removed - feed only
          }
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Refresh feed
            setPage(1);
            setAllPosts([]);
            queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
          }
          break;
        case 'escape':
          // Close any open modals
          setShowCreateModal(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  // Handle reactions with optimistic updates
  const handleReaction = async (postId: string, type: string) => {
    // Optimistic update on allPosts state
    setAllPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likesCount: isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 1) - 1)
        };
      }
      return post;
    }));

    try {
      await postsAPI.toggleReaction(postId, type);
    } catch (error) {
      // Rollback optimistic update on error
      setAllPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 1) - 1)
          };
        }
        return post;
      }));
      console.error('Failed to toggle reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };

  // Handle comment with Socket.io
  const handleComment = async (postId: string) => {
    const comment = prompt('Add your comment:');
    if (!comment) return;
    
    // Emit typing start event
    socket?.emit('typing-start', { postId });

    try {
      await postsAPI.addComment(postId, comment);
      toast({ 
        title: "Comment added!",
        description: "Your comment has been posted."
      });
      // Update local state optimistically
      setAllPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
          : post
      ));
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({ 
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      // Emit typing end event
      socket?.emit('typing-end', { postId });
    }
  };

  // Handle share with internal ShareModal
  const handleShare = async (postId: string) => {
    // Emit share event for real-time stats
    socket?.emit('post-shared', { postId });
    
    // Find the post data for the modal
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
      toast({
        title: "Error",
        description: "Could not find post to share",
        variant: "destructive"
      });
      return;
    }
    
    // Open the share modal with the post data
    setShareModalPost({
      id: post.id,
      content: post.content,
      user: {
        name: post.user?.name || 'Tango Dancer'
      }
    });
    setIsShareModalOpen(true);
    
    // Track the share on backend
    try {
      await postsAPI.sharePost(postId);
      // Refresh to update share count
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    } catch (err) {
      console.error('Failed to track share:', err);
    }
  };

  // ESA LIFE CEO 61×21 - Layer 9: Handle post edit with rich text editor
  const handleEditPost = (post: any) => {
    console.log('[ESA Layer 9] Opening edit modal with react-quill for post:', post.id);
    setEditingPost(post);
    setShowEditModal(true);
  };

  // ESA LIFE CEO 61×21 - Layer 9: BeautifulPostCreator handles edit internally
  // No need for separate saveEditedPost - BeautifulPostCreator manages the API call

  // Handle post delete with Socket.io
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postsAPI.deletePost(postId);
      toast({
        title: "Post deleted",
        description: "Your post has been removed."
      });
      // Remove from local state immediately
      setAllPosts(prev => prev.filter(post => post.id !== postId));
      // Emit delete event for other users
      socket?.emit('post-delete', { postId });
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  // Handle post report
  const handleReportPost = async (postId: string, reason?: string) => {
    const reportReason = reason || prompt('Please provide a reason for reporting this post:');
    if (!reportReason) return;
    
    try {
      await postsAPI.reportPost(postId, reportReason);
      toast({
        title: "Post reported",
        description: "Thank you for helping keep our community safe."
      });
    } catch (error) {
      console.error('Failed to report post:', error);
      toast({
        title: "Error",
        description: "Failed to report post",
        variant: "destructive"
      });
    }
  };

  // Current user for dashboard
  const currentUser = {
    id: currentUserId,
    name: 'Pierre Dubois',
    username: 'pdubois',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre',
    role: 'Professional',
    city: 'Paris',
    country: 'France'
  };

  return (
    <>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Page Header - Feed Only */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-teal-500" />
                Memories
              </h1>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Grid or Feed View */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Post Creator - Always visible per ESA Framework */}
                  {!showCreateModal && (
                    <BeautifulPostCreator 
                      user={{
                        id: parseInt(currentUserId) || 1,
                        name: 'Pierre Dubois',
                        username: 'pierre_dancer',
                        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre'
                      }}
                      onSubmit={(data) => {
                        // Convert structured data to FormData for API
                        const formData = new FormData();
                        formData.append('content', data.content);
                        formData.append('visibility', data.visibility);
                        if (data.location) formData.append('location', data.location);
                        if (data.tags.length > 0) formData.append('tags', JSON.stringify(data.tags));
                        if (data.emotions && data.emotions.length > 0) {
                          formData.append('emotions', JSON.stringify(data.emotions));
                        }
                        if (data.isRecommendation) {
                          formData.append('isRecommendation', 'true');
                          if (data.recommendationType) {
                            formData.append('recommendationType', data.recommendationType);
                          }
                        }
                        // Add media files
                        data.media.forEach(file => {
                          formData.append('images', file);
                        });
                        createPostMutation.mutate(formData);
                      }}
                      onPostCreated={() => {
                        // Optional callback after successful post
                        setShowCreateModal(false);
                      }}
                      context={{ type: 'feed' }}
                    />
                  )}
                  
                  {/* Posts Display */}
                  <Suspense fallback={
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                    </div>
                  }>
                    {/* Posts Feed - Feed Only Mode */}
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                      </div>
                    ) : (
                      <>
                        <UnifiedPostFeed 
                          showFilters={true} // ESA Layer 9: Show filter buttons for main feed
                          showSearch={true} // ESA Layer 9: Show search bar for main feed
                          posts={posts} // ESA Framework: Pass the actual posts data!
                          currentUserId={currentUserId} // ESA Framework Layer 4: Pass authenticated user ID
                          filters={feedFilters}
                          onEdit={handleEditPost} // ESA Layer 9: Pass edit handler with rich text editor
                          hasMore={hasMore}
                          onLoadMore={() => setPage(prev => prev + 1)}
                        />
                        {/* Infinite scroll trigger */}
                        <div ref={loadMoreRef} className="h-10" />
                        {/* Loading more indicator */}
                        {isFetching && (
                          <div className="flex justify-center py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Loading more memories...
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </Suspense>
                </div>
              </div>

              {/* Right Sidebar - Events */}
              <div className="lg:col-span-1">
                <Suspense fallback={
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                }>
                  <UpcomingEventsSidebar />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Floating Create Button - ESA Framework Required Feature */}
      <Suspense fallback={null}>
        <FloatingCreateButton 
        onClick={() => {
          // Scroll to top where the creator is in feed view
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
          theme={theme}
        />
      </Suspense>

      {/* Share Modal - Internal sharing options */}
      {shareModalPost && (
        <Suspense fallback={null}>
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setShareModalPost(null);
            }}
            post={shareModalPost}
          />
        </Suspense>
      )}

      {/* ESA LIFE CEO 61×21 - Layer 9: Edit Modal with Rich Text Editor (react-quill) */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-8">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingPost(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ✏️ Edit Your Memory
            </h2>
            
            {/* BeautifulPostCreator with edit mode and react-quill */}
            <BeautifulPostCreator
              editMode={true}
              existingPost={{
                id: editingPost.id,
                content: editingPost.content,
                location: editingPost.location,
                media: editingPost.mediaEmbeds?.map((url: string) => ({ url, type: 'image' })) || 
                       (editingPost.imageUrl ? [{ url: editingPost.imageUrl, type: 'image' }] : []),
                hashtags: editingPost.hashtags
              }}
              onEditComplete={() => {
                // ESA Layer 9: Edit completed successfully
                console.log('[ESA Layer 9] Post edited successfully');
                toast({
                  title: "Post updated!",
                  description: "Your changes have been saved."
                });
                queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
                queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
                setRefreshKey(prev => prev + 1);
                setShowEditModal(false);
                setEditingPost(null);
              }}
              context={{ type: 'feed' }}
            />
          </div>
        </div>
      )}
    </>
  );
}

// RESILIENCE: Export component wrapped with error boundary for protection
// This ensures the memory feed never shows a blank screen on errors
export default withResilience(
  ESAMemoryFeedCore,
  'ESAMemoryFeed',
  {
    fallback: (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Memory Feed Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we load your tango memories
            </p>
          </div>
        </div>
      </DashboardLayout>
    ),
    maxRetries: 3,
    showError: false // Don't show technical errors to users
  }
);