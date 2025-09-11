/**
 * UnifiedMemories.tsx
 * 
 * A unified memories page that combines the best components from both
 * moments.tsx and ModernMemoriesPage.tsx implementations.
 * 
 * Features:
 * - BeautifulPostCreator for post creation
 * - EnhancedPostFeedSimple for feed display
 * - MemoryFilters for filtering functionality
 * - UpcomingEventsSidebar for events display
 * - MT Ocean theme with turquoise-to-cyan gradients
 * - Real backend API integration
 */

import React, { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
import EnhancedPostFeedSimple from '@/components/moments/EnhancedPostFeedSimple';
import { MemoryFilters } from '@/components/memories/MemoryFilters';
import UpcomingEventsSidebar from '@/components/events/UpcomingEventsSidebar';
import { Sparkles, Heart, Camera, Users, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function UnifiedMemories() {
  // Authentication and hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    filterType: 'all' as 'all' | 'following' | 'nearby',
    tags: [] as string[],
    visibility: 'all' as 'all' | 'public' | 'friends' | 'private'
  });

  // Create post mutation with real API endpoint
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      emotions?: string[];
      location?: string;
      tags: string[];
      mentions?: string[];
      media: File[];
      visibility: string;
      isRecommendation: boolean;
      recommendationType?: string;
      priceRange?: string;
    }) => {
      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('visibility', postData.visibility);
      formData.append('isPublic', postData.visibility === 'public' ? 'true' : 'false');

      // Add tags
      if (postData.tags && postData.tags.length > 0) {
        formData.append('hashtags', JSON.stringify(postData.tags));
      }

      // Add location
      if (postData.location) {
        formData.append('location', postData.location);
      }

      // Add emotions
      if (postData.emotions && postData.emotions.length > 0) {
        formData.append('emotionTags', JSON.stringify(postData.emotions));
      }

      // Add mentions
      if (postData.mentions && postData.mentions.length > 0) {
        formData.append('mentions', JSON.stringify(postData.mentions));
      }

      // Add recommendation data
      if (postData.isRecommendation) {
        formData.append('isRecommendation', 'true');
        if (postData.recommendationType) {
          formData.append('recommendationType', postData.recommendationType);
        }
        if (postData.priceRange) {
          formData.append('priceRange', postData.priceRange);
        }
      }

      // Add media files
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach((file) => {
          formData.append('media', file);
        });
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Show success toast
      toast({
        title: "Success! 🎉",
        description: "Your memory has been shared with the community",
        className: "bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white border-none",
      });

      // Refresh the feed
      setRefreshKey(prev => prev + 1);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error: Error) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle post creation
  const handlePostCreated = useCallback((postData: any) => {
    createPostMutation.mutate(postData);
  }, [createPostMutation]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setRefreshKey(prev => prev + 1); // Refresh feed when filters change
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      // User will be redirected by auth guard if needed
      console.log('Waiting for authentication...');
    }
  }, [user]);

  return (
    <DashboardLayout>
      {/* MT Ocean Theme - Enhanced gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50/60 via-cyan-50/40 to-blue-50/30 relative overflow-hidden">
        {/* Animated floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-turquoise-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-75"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-blue-gray-200/15 to-turquoise-200/15 rounded-full blur-2xl animate-pulse delay-150"></div>
          <div className="absolute top-32 right-1/4 w-56 h-56 bg-gradient-to-r from-turquoise-300/15 to-cyan-300/15 rounded-full blur-3xl animate-pulse delay-300"></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6">
          {/* Beautiful Header Section */}
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-xl shadow-lg">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-turquoise-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Unified Memories
              </h1>
              <Heart className="h-6 w-6 text-cyan-400 animate-bounce" />
            </div>
            <p className="text-xl text-blue-gray-600 font-medium max-w-2xl mx-auto lg:mx-0">
              Share your tango moments, connect with dancers, and create lasting memories together
            </p>
            
            {/* Quick Stats Bar */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <Camera className="h-4 w-4 text-turquoise-500" />
                <span className="text-sm font-medium text-gray-700">Share Moments</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <Users className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium text-gray-700">Connect with Dancers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Global Community</span>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT COLUMN - Main Feed Area */}
            <div className="flex-1 lg:max-w-[60%] space-y-6">
              {/* Post Creator Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-1">
                <BeautifulPostCreator 
                  context={{ type: 'feed' }}
                  user={user || undefined}
                  onSubmit={handlePostCreated}
                />
              </div>
              
              {/* Memory Filters Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50">
                <MemoryFilters 
                  onFiltersChange={handleFiltersChange}
                  initialFilters={filters}
                />
              </div>
              
              {/* Posts Feed */}
              <div className="space-y-4">
                {createPostMutation.isPending && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center">
                    <div className="inline-flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-turquoise-500"></div>
                      <span className="text-gray-600 font-medium">Creating your memory...</span>
                    </div>
                  </div>
                )}
                
                <EnhancedPostFeedSimple 
                  key={refreshKey} 
                  filters={filters}
                />
              </div>
            </div>
            
            {/* RIGHT COLUMN - Sidebar */}
            <div className="w-full lg:w-96 lg:flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                {/* Upcoming Events Sidebar */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-turquoise-500 to-cyan-500 p-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Upcoming Events
                    </h3>
                  </div>
                  <UpcomingEventsSidebar />
                </div>

                {/* Community Highlights (Optional) */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Community Highlights
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Active Dancers</span>
                      <span className="font-semibold text-turquoise-600">2,847</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Memories Shared</span>
                      <span className="font-semibold text-cyan-600">12,495</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Events This Week</span>
                      <span className="font-semibold text-blue-600">24</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UnifiedMemories;