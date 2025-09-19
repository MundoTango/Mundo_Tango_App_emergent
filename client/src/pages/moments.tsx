import React, { useState, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ModernPostComposer from '@/components/modern/ModernPostComposer';
import EnhancedPostFeed from '@/components/moments/EnhancedPostFeedSimple';
import { MemoryFilters } from '@/components/memories/MemoryFilters';
import UpcomingEventsSidebar from '@/components/events/UpcomingEventsSidebar';
import { Sparkles, Heart, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import toast from 'react-hot-toast';

// Using existing UpcomingEventsSidebar component from ESA Audit Report

function MomentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    filterType: 'all' as 'all' | 'following' | 'nearby',
    tags: [] as string[],
    visibility: 'all' as 'all' | 'public' | 'friends' | 'private'
  });
  const { user } = useAuth();
  
  // ESA Layer 7: Unified composer state management
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState<'create' | 'edit'>('create');
  const [editingPost, setEditingPost] = useState<any>(null);
  
  const handlePostCreated = useCallback(() => {
    // Instead of reloading the page, just refresh the feed
    setRefreshKey(prev => prev + 1);
    setShowComposer(false);
    setEditingPost(null);
    setComposerMode('create');
  }, []);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setRefreshKey(prev => prev + 1); // Refresh feed when filters change
  }, []);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('/api/posts', { 
        method: 'POST',
        body: formData,
      });
      return response;
    },
    onSuccess: () => {
      handlePostCreated();
      toast.success('Memory created successfully!', {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
          borderRadius: '16px',
        },
      });
    },
    onError: () => {
      toast.error('Failed to create memory');
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
      handlePostCreated();
      toast.success('Memory updated successfully!', {
        style: {
          background: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
          color: 'white',
          borderRadius: '16px',
        },
      });
    },
    onError: () => {
      toast.error('Failed to update memory');
    },
  });

  // Handle edit from child components
  const handleEdit = useCallback((post: any) => {
    setEditingPost(post);
    setComposerMode('edit');
    setShowComposer(true);
  }, []);
  return (
    <DashboardLayout>
      {/* Enhanced gradient background with brand colors */}
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50/60 via-cyan-50/40 to-blue-50/30 relative overflow-hidden">
        {/* Floating background elements for visual interest */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-turquoise-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-blue-gray-200/15 to-turquoise-200/15 rounded-full blur-2xl"></div>
        </div>

        {/* Container with enhanced padding and spacing */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6">
          {/* Beautiful header with enhanced typography and icons */}
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-turquoise-500 to-blue-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-turquoise-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Memories
              </h1>
              <Heart className="h-5 w-5 text-cyan-400 animate-bounce" />
            </div>
            <p className="text-xl text-blue-gray-600 font-medium max-w-2xl mx-auto lg:mx-0">
              Share your tango moments, connect with dancers, and create lasting memories together
            </p>
          </div>
          


          {/* Enhanced flexbox layout with better spacing */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Main content area with enhanced styling */}
            <div className="flex-1 lg:max-w-[60%] space-y-6">
              {/* ESA Layer 7: Unified ModernPostComposer for create and edit */}
              {!showComposer ? (
                <Button
                  onClick={() => {
                    setShowComposer(true);
                    setComposerMode('create');
                    setEditingPost(null);
                  }}
                  className="w-full py-6 bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600 text-white font-semibold rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  What's on your mind?
                </Button>
              ) : (
                <ModernPostComposer
                  onSubmit={async (postData) => {
                    const formData = new FormData();
                    formData.append('content', postData.content);
                    formData.append('isPublic', String(postData.isPublic));
                    if (postData.imageFile) {
                      formData.append('image', postData.imageFile);
                    }
                    await createPostMutation.mutateAsync(formData);
                  }}
                  onUpdate={async (postData) => {
                    if (editingPost) {
                      await editPostMutation.mutateAsync({ id: editingPost.id, data: postData });
                    }
                  }}
                  onClose={() => {
                    setShowComposer(false);
                    setEditingPost(null);
                    setComposerMode('create');
                  }}
                  editMode={composerMode === 'edit'}
                  existingPost={editingPost}
                />
              )}
              
              {/* ESA LIFE CEO 61x21 - Memory Filters */}
              <MemoryFilters 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
              
              <EnhancedPostFeed 
                key={refreshKey} 
                filters={filters} 
                onEdit={handleEdit}
              />
            </div>
            
            {/* RIGHT SIDEBAR - ESA Audit Compliant Events */}
            <div className="w-full lg:w-96 lg:flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                <UpcomingEventsSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Export without performance wrapper for now to avoid breaking changes
export default MomentsPage;