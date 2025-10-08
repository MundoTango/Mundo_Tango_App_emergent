import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/auth-context';
import { useMemorySocket, useMemoryRealtimeEvents } from '../../hooks/useSocket';
import ModernMemoriesHeader from '@/components/modern/ModernMemoriesHeader';
import ModernPostComposer from '@/components/modern/ModernPostComposer';
import EnhancedPostItem from '@/components/moments/EnhancedPostItem';
import ModernTagFilter from '@/components/modern/ModernTagFilter';
import ModernLoadingState from '@/components/modern/ModernLoadingState';
import { apiRequest } from '@/lib/queryClient';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Share2, Eye, Sparkles } from 'lucide-react';
import { usePostLike } from '@/hooks/usePostLike';
import { GlassCard } from '@/components/glass/GlassComponents';


interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags?: string[] | null;
  isPublic?: boolean | null;
  createdAt: string;
  updatedAt?: string | null;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  aiEnhanced?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  engagementScore?: number;
  isLiked?: boolean; // ESA Layer 7: Track per-user like status
  likes?: number; // For compatibility with standardized hook
}

interface AIEnhancementResult {
  enhancedContent: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: string[];
}

export default function EnhancedMemoriesRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [aiEnhancementEnabled, setAiEnhancementEnabled] = useState(true);
  
  // Real-time socket connection
  const memorySocket = useMemorySocket('general-feed', user?.id?.toString());
  const liveUpdates = useMemoryRealtimeEvents();

  // Track online users and typing indicators
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Fetch posts with real-time updates
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', { filterTags: activeTags }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTags.length > 0) {
        params.append('filterTags', activeTags.join(','));
      }
      const response = await fetch(`/api/posts/feed?${params.toString()}`);
      const result = await response.json();
      return result.data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds as backup to real-time
  });

  // AI-enhanced memory creation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageFile, useAI }: { 
      content: string; 
      imageFile?: File; 
      useAI?: boolean; 
    }) => {
      let finalContent = content;
      let aiResults: AIEnhancementResult | null = null;

      // AI Enhancement Pipeline
      if (useAI && aiEnhancementEnabled) {
        try {
          toast.loading('🤖 AI enhancing your memory...', { id: 'ai-enhance' });
          
          const enhanceResponse = await fetch('/api/memories/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content,
              options: {
                enhanceContent: true,
                generateTags: true,
                analyzeSentiment: true,
                optimizeEngagement: true
              }
            })
          });
          
          if (enhanceResponse.ok) {
            aiResults = await enhanceResponse.json();
            if (aiResults) {
              finalContent = aiResults.enhancedContent;
            }
            toast.success('✨ AI enhanced your memory!', { id: 'ai-enhance' });
          } else {
            toast.dismiss('ai-enhance');
          }
        } catch (error) {
          console.error('AI enhancement failed:', error);
          toast.dismiss('ai-enhance');
        }
      }

      // Create memory with enhanced content
      const formData = new FormData();
      formData.append('content', finalContent);
      formData.append('isPublic', 'true');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Add AI-generated tags if available
      if (aiResults?.tags) {
        formData.append('aiTags', JSON.stringify(aiResults.tags));
      }

      if (aiResults?.sentiment) {
        formData.append('sentiment', aiResults.sentiment);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const result = await response.json();
      
      // Emit real-time memory creation event
      if (memorySocket.socket && user) {
        memorySocket.socket.emit('memory:created', {
          memoryId: result.id,
          userId: user.id,
          username: user.name,
          content: finalContent
        });
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast.success('Memory shared successfully! ✨', {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '16px',
        },
      });
      setShowComposer(false);
    },
    onError: () => {
      toast.error('Failed to share memory', {
        style: {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '16px',
        },
      });
    },
  });

  // ESA Layer 7 & 14: Use standardized like hook with real-time events
  const { mutate: toggleLike, isPending: isLiking } = usePostLike();
  
  const handleLikePost = (postId: number) => {
    const post = posts?.find((p: Post) => p.id === postId);
    if (!post) return;
    
    // ESA Layer 7 & 14: Use per-user like status, NOT aggregate count
    toggleLike({ 
      postId, 
      isLiked: post.isLiked || false // Actual per-user like status
    });
    
    // Emit real-time like event
    if (memorySocket.socket && user) {
      memorySocket.emitLike({
        memoryId: postId.toString(),
        userId: user.id.toString(),
        username: user.name,
        memoryOwnerId: post.userId.toString()
      });
    }
  };

  // Handle real-time events
  useEffect(() => {
    if (!memorySocket.socket) return;

    // Listen for live memory updates
    memorySocket.socket.on('memory:new', (data) => {
      console.log('📱 New memory received in real-time:', data);
      // Trigger query refetch to include new memory
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      
      toast.success(`${data.username} shared a new memory!`, {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
        }
      });
    });

    // Listen for user presence updates
    memorySocket.socket.on('user:presence', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    return () => {
      memorySocket.socket?.off('memory:new');
      memorySocket.socket?.off('user:presence');
    };
  }, [memorySocket.socket, queryClient]);

  // Handle memory interactions
  const handleCreatePost = (content: string, mediaFile?: File) => {
    createPostMutation.mutate({ 
      content, 
      imageFile: mediaFile, 
      useAI: aiEnhancementEnabled 
    });
  };

  // Removed old handleComment - now defined with handleShare/handleBookmark below

  const handleShare = (arg: any) => {
    // Handle both post object and postId
    const postId = typeof arg === 'number' ? arg : arg?.id;
    const post = posts?.find((p: Post) => p.id === postId);
    
    if (memorySocket.socket && user && post) {
      memorySocket.emitShare({
        memoryId: postId.toString(),
        userId: user.id.toString(),
        username: user.name,
        memoryOwnerId: post.userId.toString()
      });
      
      toast.success('Memory shared! 🔄', {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
        }
      });
    }
  };

  const handleBookmark = (arg: any) => {
    // Handle both post object and postId
    const postId = typeof arg === 'number' ? arg : arg?.id;
    console.log('Bookmark post:', postId);
    toast('🔖 Bookmarking coming soon!');
  };

  const handleComment = (arg: any) => {
    // Handle both post object and postId
    const postId = typeof arg === 'number' ? arg : arg?.id;
    console.log('Comment on post:', postId);
    toast('💬 Real-time comments coming soon!');
  };

  const handleAddTag = (tag: string) => {
    setActiveTags(prev => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setActiveTags(prev => prev.filter(t => t !== tag));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50" style={{
        backgroundImage: 'linear-gradient(135deg, #5EEAD4 0%, #E0F2FE 50%, #155E75 100%)'
      }}>
        <ModernLoadingState message="Loading your memories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50" style={{
        backgroundImage: 'linear-gradient(135deg, #5EEAD4 0%, #E0F2FE 50%, #155E75 100%)'
      }}>
      {/* Enhanced Header with Real-time Status */}
      <ModernMemoriesHeader onCreatePost={() => setShowComposer(true)} />
      
      {/* Real-time Status Bar */}
      <GlassCard depth={1} className="border-b border-white/30">
        <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${memorySocket.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-600">
                {memorySocket.isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            {/* Online Users Count */}
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {onlineUsers.size} online
              </span>
            </div>
          </div>
          
          {/* AI Enhancement Toggle */}
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${aiEnhancementEnabled ? 'text-purple-500' : 'text-gray-400'}`} />
            <button
              onClick={() => setAiEnhancementEnabled(!aiEnhancementEnabled)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                aiEnhancementEnabled 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              AI Enhancement
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enhanced Post Composer Modal */}
        {showComposer && (
          <GlassCard depth={1} className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <GlassCard depth={2} className="max-w-2xl w-full max-h-[90vh] overflow-auto rounded-2xl border border-white/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Share a Memory
                  </h2>
                  <div className="flex items-center gap-2">
                    {aiEnhancementEnabled && (
                      <div className="flex items-center gap-1 text-purple-600 text-sm">
                        <Sparkles className="w-4 h-4" />
                        AI Enhanced
                      </div>
                    )}
                    <button
                      onClick={() => setShowComposer(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <ModernPostComposer 
                  onSubmit={handleCreatePost}
                  onClose={() => setShowComposer(false)}
                />
              </div>
            </GlassCard>
          </GlassCard>
        )}

        {/* Tag Filter */}
        <ModernTagFilter
          activeTags={activeTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Live Activity Feed */}
        {liveUpdates.likes.length > 0 && (
          <GlassCard depth={1} className="mb-6 p-4 rounded-xl border border-white/40">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Live Activity</h3>
            <div className="space-y-1">
              {liveUpdates.likes.slice(-3).map((like, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500" />
                  Someone liked a memory
                  <span className="text-xs text-gray-400">just now</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Posts Feed */}
        <div className="space-y-8">
          {isLoading ? (
            <ModernLoadingState type="posts" />
          ) : posts && posts.length > 0 ? (
            posts.map((post: Post) => {
              // Map to EnhancedPostItem's expected Post format
              // Preserve optimistic 'likes' value from hook, fallback to likesCount
              const mappedPost = {
                ...post,
                imageUrl: post.imageUrl ?? undefined, // Convert null to undefined
                videoUrl: post.videoUrl ?? undefined,
                likes: post.likes ?? post.likesCount, // Preserve optimistic updates
                commentsCount: post.commentsCount,
              };
              
              const handleLikeWrapper = (arg: any) => {
                const postId = typeof arg === 'number' ? arg : arg.id;
                handleLikePost(postId);
              };

              return (
              <div key={post.id} className="relative">
                <EnhancedPostItem
                  post={mappedPost as any}
                  onLike={handleLikeWrapper as any}
                  onComment={handleComment as any}
                  onShare={handleShare as any}
                  onBookmark={handleBookmark as any}
                />
                
                {/* Real-time Engagement Overlay */}
                {liveUpdates.likes.some(like => like.memoryId === post.id.toString()) && (
                  <div className="absolute top-2 right-2 bg-red-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Live
                  </div>
                )}
              </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <GlassCard depth={1} className="rounded-3xl shadow-lg border border-white/30 p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl 
                                flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    No memories found
                  </h3>
                  <p className="text-teal-600 mb-6">
                    {activeTags.length > 0 
                      ? 'No memories match your current filters. Try adjusting your search.'
                      : 'Start sharing your tango journey with the community!'
                    }
                  </p>
                  <button
                    onClick={() => setShowComposer(true)}
                    className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 
                             text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    Share Your First Memory
                  </button>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}