import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import ModernMemoriesHeader from '@/components/modern/ModernMemoriesHeader';
import EnhancedPostComposer from '@/components/moments/EnhancedPostComposer';
import ModernPostCard from '@/components/modern/ModernPostCard';
import ModernTagFilter from '@/components/modern/ModernTagFilter';
import ModernLoadingState from '@/components/modern/ModernLoadingState';
// ESA Layer 7: Removed ModernEditMemoryModal - using ModernPostComposer for both create and edit
import ModernDeleteConfirmModal from '@/components/modern/ModernDeleteConfirmModal';
import ModernCommentsSection from '@/components/modern/ModernCommentsSection';
import { apiRequest } from '@/lib/queryClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
}

interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export default function ModernMemoriesPageV2() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // State management
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState<'create' | 'edit'>('create');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [memories, setMemories] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMemory, setEditingMemory] = useState<Post | null>(null);
  const [deletingMemoryId, setDeletingMemoryId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [postComments, setPostComments] = useState<{ [key: number]: Comment[] }>({});

  // Fetch posts with tag filtering
  const fetchMemories = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeTags.length > 0) {
        params.append('filterTags', activeTags.join(','));
      }
      const response = await fetch(`/api/posts/feed?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch memories');
      }
      const result = await response.json();
      setMemories(result.data || []);
    } catch (err) {
      setError('Could not load memories. Please try again later.');
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a specific post
  const fetchCommentsForPost = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        // Handle both direct array and {data: [...]} response formats
        const comments = result.data || result;
        setPostComments(prev => ({ ...prev, [postId]: Array.isArray(comments) ? comments : [] }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Check authentication and fetch memories
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (!response.ok) {
          navigate('/login');
          return;
        }
        const userData = await response.json();
        if (!userData || !userData.id) {
          navigate('/login');
          return;
        }
        // Fetch memories after auth check
        fetchMemories();
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Refetch when tags change
  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [activeTags]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageFile }: { content: string; imageFile?: File }) => {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('isPublic', 'true');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      fetchMemories();
      toast.success('Memory shared successfully!', {
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
      toast.error('Failed to share memory');
    },
  });

  // Edit post mutation - ESA Layer 7: Support media updates with FormData
  const editPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      let body: any;
      let headers: any = {};
      
      // Use FormData if media is being updated
      if (data.imageFile || data.removeMedia) {
        const formData = new FormData();
        formData.append('content', data.content || '');
        formData.append('isPublic', String(data.isPublic !== undefined ? data.isPublic : true));
        
        if (data.imageFile) {
          formData.append('image', data.imageFile);
        }
        if (data.removeMedia) {
          formData.append('removeMedia', 'true');
        }
        
        body = formData;
        // Don't set Content-Type for FormData - let browser set it with boundary
      } else {
        // Use JSON for text-only updates
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await apiRequest(`/api/posts/${id}`, { 
        method: 'PUT',
        body: body,
        headers: headers,
      });
      return response;
    },
    onSuccess: () => {
      fetchMemories();
      toast.success('Memory updated successfully!', {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
          borderRadius: '16px',
        },
      });
      setEditingMemory(null);
    },
    onError: () => {
      toast.error('Failed to update memory');
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
      return response;
    },
    onSuccess: () => {
      fetchMemories();
      toast.success('Memory deleted successfully!', {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
          borderRadius: '16px',
        },
      });
      setDeletingMemoryId(null);
      setIsDeleting(false);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error?.message || 'Failed to delete memory');
      setIsDeleting(false);
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest(`/api/posts/${postId}/like`, { method: 'POST' });
      return response;
    },
    onSuccess: () => {
      fetchMemories();
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await apiRequest(`/api/posts/${postId}/comments`, { 
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    },
    onSuccess: (data, variables) => {
      fetchCommentsForPost(variables.postId);
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const response = await apiRequest(`/api/comments/${commentId}`, { 
        method: 'PUT',
        body: JSON.stringify({ content }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    },
    onSuccess: () => {
      // Refresh comments for all expanded posts
      expandedComments.forEach(postId => {
        fetchCommentsForPost(postId);
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest(`/api/comments/${commentId}`, { method: 'DELETE' });
      return response;
    },
    onSuccess: () => {
      // Refresh comments for all expanded posts
      expandedComments.forEach(postId => {
        fetchCommentsForPost(postId);
      });
    },
  });

  // Handler functions
  const handleCreatePost = (content: string, mediaFile?: File) => {
    createPostMutation.mutate({ content, imageFile: mediaFile });
  };

  const handleLike = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleEditMemory = (memory: Post) => {
    console.log('[ESA DEBUG] handleEditMemory called with:', {
      memoryId: memory.id,
      memoryContent: memory.content?.substring(0, 50),
      hasImageUrl: !!memory.imageUrl,
      hasVideoUrl: !!memory.videoUrl
    });
    setEditingMemory(memory);
    setComposerMode('edit');
    setShowComposer(true);
    console.log('[ESA DEBUG] State after handleEditMemory:', {
      composerMode: 'edit',
      showComposer: true,
      editingMemory: memory
    });
  };

  const handleSaveEdit = (id: number, data: any) => {
    editPostMutation.mutate({ id, data });
  };

  const handleDeleteMemory = (memoryId: number) => {
    setDeletingMemoryId(memoryId);
  };

  const confirmDelete = () => {
    if (deletingMemoryId) {
      setIsDeleting(true);
      deletePostMutation.mutate(deletingMemoryId);
    }
  };

  const handleComment = (postId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!postComments[postId]) {
        fetchCommentsForPost(postId);
      }
    }
    setExpandedComments(newExpanded);
  };

  const handleAddComment = (postId: number, content: string) => {
    addCommentMutation.mutate({ postId, content });
  };

  const handleEditComment = (commentId: number, content: string) => {
    editCommentMutation.mutate({ commentId, content });
  };

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleAddTag = (tag: string) => {
    setActiveTags(prev => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setActiveTags(prev => prev.filter(t => t !== tag));
  };

  const handleShare = (postId: number) => {
    const url = `${window.location.origin}/memories/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleBookmark = (postId: number) => {
    toast.success('Bookmarked!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50" style={{
        backgroundImage: 'linear-gradient(135deg, #5EEAD4 0%, #E0F2FE 50%, #155E75 100%)'
      }}>
        <ModernLoadingState message="Redirecting to login..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50" style={{
        backgroundImage: 'linear-gradient(135deg, #5EEAD4 0%, #E0F2FE 50%, #155E75 100%)'
      }}>
      {/* Header */}
      <ModernMemoriesHeader onCreatePost={() => {
        setComposerMode('create');
        setEditingMemory(null);
        setShowComposer(true);
      }} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Unified Post Composer Modal - ESA Layer 7 Compliance */}
        {showComposer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
              <EnhancedPostComposer 
                editMode={composerMode === 'edit'}
                existingPost={composerMode === 'edit' ? editingMemory : undefined}
                onPostCreated={composerMode === 'create' ? () => {
                  fetchMemories();
                  setShowComposer(false);
                  setComposerMode('create');
                  setEditingMemory(null);
                } : undefined}
                onPostUpdated={composerMode === 'edit' ? (id: number, data: any) => {
                  fetchMemories();
                  setShowComposer(false);
                  setEditingMemory(null);
                  setComposerMode('create');
                } : undefined}
                onClose={() => {
                  setShowComposer(false);
                  setEditingMemory(null);
                  setComposerMode('create');
                }}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ModernDeleteConfirmModal
          isOpen={!!deletingMemoryId}
          onClose={() => setDeletingMemoryId(null)}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />

        {/* Tag Filter */}
        <ModernTagFilter
          activeTags={activeTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Posts Feed */}
        <div className="space-y-8" data-testid="list-memories-feed">
          {loading ? (
            <ModernLoadingState type="posts" />
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              {error}
            </div>
          ) : memories && memories.length > 0 ? (
            memories.map((memory: Post) => (
              <div key={memory.id} data-testid={`card-memory-${memory.id}`}>
                <ModernPostCard
                  post={memory}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onBookmark={handleBookmark}
                  isOwner={memory.userId === user?.id}
                  onEdit={handleEditMemory}
                  onDelete={() => handleDeleteMemory(memory.id)}
                />
                
                {/* Comments Section */}
                {expandedComments.has(memory.id) && (
                  <div className="mt-4" data-testid={`comments-section-${memory.id}`}>
                    <ModernCommentsSection
                      postId={memory.id}
                      comments={postComments[memory.id] || []}
                      currentUserId={user?.id}
                      onAddComment={handleAddComment}
                      onEditComment={handleEditComment}
                      onDeleteComment={handleDeleteComment}
                      isAddingComment={addCommentMutation.isPending}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400/20 to-cyan-600/20 rounded-3xl 
                                flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No memories found
                  </h3>
                  <p className="text-white/60 mb-6">
                    {activeTags.length > 0 
                      ? 'No memories match your current filters. Try adjusting your search.'
                      : 'Start sharing your tango journey with the community!'
                    }
                  </p>
                  <button
                    onClick={() => {
                    setComposerMode('create');
                    setEditingMemory(null);
                    setShowComposer(true);
                  }}
                    data-testid="button-create-memory"
                    className="bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 
                             text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Share Your First Memory
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}