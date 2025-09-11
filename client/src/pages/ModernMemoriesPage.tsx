import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import ModernMemoriesHeader from '@/components/modern/ModernMemoriesHeader';
import ModernPostComposer from '@/components/modern/ModernPostComposer';
import ModernPostCard from '@/components/modern/ModernPostCard';
import ModernTagFilter from '@/components/modern/ModernTagFilter';
import ModernLoadingState from '@/components/modern/ModernLoadingState';
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

export default function ModernMemoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, memoryId: null });

  const handleEditMemory = (memoryId) => {
    // TODO: Implement edit functionality
    console.log('Edit memory:', memoryId);
  };

  const handleDeleteMemory = (memoryId) => {
    setDeleteConfirm({ show: true, memoryId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.memoryId) return;

    try {
      const response = await fetch(`/api/memories/${deleteConfirm.memoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMemories(memories.filter(m => m.id !== deleteConfirm.memoryId));
        setDeleteConfirm({ show: false, memoryId: null });
      } else {
        setError('Failed to delete memory');
      }
    } catch (err) {
      setError('Error deleting memory');
    }
  };

  // Fetch posts with tag filtering
  const fetchMemories = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeTags.length > 0) {
        params.append('filterTags', activeTags.join(','));
      }
      const response = await fetch(`/api/memories/feed?${params.toString()}`);
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

  useEffect(() => {
    fetchMemories();
  }, [activeTags]);


  useEffect(() => {
    // Check if user is authenticated
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
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
        return;
      }

      // Only fetch memories if authenticated
      fetchMemories();
    };

    checkAuth();
  }, [navigate]);


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
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
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

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest(`/api/posts/${postId}/like`, { method: 'POST' });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
  });

  const handleCreatePost = (content: string, mediaFile?: File) => {
    createPostMutation.mutate({ content, imageFile: mediaFile });
  };

  const handleLike = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleAddTag = (tag: string) => {
    setActiveTags(prev => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setActiveTags(prev => prev.filter(t => t !== tag));
  };

  const handleComment = (postId: number) => {
    // Implement comment functionality
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: number) => {
    // Implement share functionality
    console.log('Share post:', postId);
  };

  const handleBookmark = (postId: number) => {
    // Implement bookmark functionality
    console.log('Bookmark post:', postId);
  };

  if (!user) {
    // Redirect to login if not authenticated
    // This part is now handled in useEffect, so this might be redundant
    // but keeping it for now as a safeguard.
    // window.location.href = '/login'; 
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
      <ModernMemoriesHeader onCreatePost={() => setShowComposer(true)} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Post Composer Modal */}
        {showComposer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <ModernPostComposer 
                onSubmit={handleCreatePost}
                onClose={() => setShowComposer(false)}
              />
            </div>
          </div>
        )}

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
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      data-testid={`button-edit-memory-${memory.id}`}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() => handleEditMemory(memory.id)}
                    >
                      Edit
                    </button>
                    <button 
                      data-testid={`button-delete-memory-${memory.id}`}
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => handleDeleteMemory(memory.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-12">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl 
                                flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    No memories found
                  </h3>
                  <p className="text-blue-500 mb-6">
                    {activeTags.length > 0 
                      ? 'No memories match your current filters. Try adjusting your search.'
                      : 'Start sharing your tango journey with the community!'
                    }
                  </p>
                  <button
                    onClick={() => setShowComposer(true)}
                    data-testid="button-create-memory"
                    className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 max-w-md w-full">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this memory? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                data-testid="modal-cancel-delete"
                onClick={() => setDeleteConfirm({ show: false, memoryId: null })}
                className="px-6 py-3 rounded-2xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                data-testid="modal-confirm-delete"
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700
                           text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl 
                           transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}