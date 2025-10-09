// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Memory Feed (Unified) - Main "/" Route Implementation
// Following ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md specifications
// WITH RESILIENCE ARCHITECTURE - Prevents component failures and blank screens

import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { postsAPI } from '@/lib/api/posts';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '@/lib/theme/theme-provider';
import { useAuth } from '@/contexts/auth-context'; // ESA Framework Layer 4: Use existing auth
import { useTranslation } from 'react-i18next';
import { useMemoriesFeed } from '@/hooks/useMemoriesFeed'; // Track A: Real-time Socket.IO

// RESILIENCE IMPORTS - Platform-wide protection
import { withResilience } from '@/components/resilient/ResilientBoundary';

// ESA Framework Canonical Components - Using standard layouts for consistency
import DashboardLayout from '@/layouts/DashboardLayout';
import PostCreator from '@/components/universal/PostCreator';
// ESA LIFE CEO 61×21 - Using unified feed component following Layer 9 UI Framework
// Phase 3: Migrated to SmartPostFeed (context-based, centralized data hooks)
import SmartPostFeed from '@/components/moments/SmartPostFeed';
const UpcomingEventsSidebar = lazy(() => import('@/components/esa/UpcomingEventsSidebar'));
const FloatingCreateButton = lazy(() => import('@/components/esa/FloatingCreateButton'));
const ShareModal = lazy(() => import('@/components/modern/ShareModal'));

// Aurora Tide Design System - Track A: Core Components
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn } from '@/components/animations/FramerMotionWrappers';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// Core component without error boundary
function ESAMemoryFeedCore() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const { user } = useAuth(); // ESA Framework Layer 4: Get authenticated user
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shareModalPost, setShareModalPost] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Track A: Real-time Socket.IO connection
  const { connectionStatus } = useMemoriesFeed();
  
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

  // Create post mutation with FormData support
  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => postsAPI.createPost(formData),
    onSuccess: (_data, formData) => {
      toast({ 
        title: t('memories.memoryShared'),
        description: t('memories.memorySharedDesc')
      });
      // ESA Layer 5: Invalidate feed queries
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      
      // ESA Layer 8: Invalidate group feed if contextType is group
      const contextType = formData.get('contextType');
      const contextId = formData.get('contextId');
      if (contextType === 'group' && contextId) {
        queryClient.invalidateQueries({ queryKey: ['/api/groups', parseInt(contextId as string), 'posts'] });
      }
      
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      toast({ 
        title: t('memories.error'),
        description: error.message || t('memories.uploadFailed'),
        variant: "destructive"
      });
    }
  });

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
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Refresh feed - PostFeed will handle re-fetching
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



  // ESA LIFE CEO 61×21 - Layer 9: Handle post edit with rich text editor
  const handleEditPost = (post: any) => {
    console.log('[ESA Layer 9] Opening edit modal with react-quill for post:', post.id);
    setEditingPost(post);
    setShowEditModal(true);
  };

  // ESA Layer 9: Memoize context to prevent PostFeed re-renders
  const feedContext = useMemo(() => ({ type: 'feed' as const }), []);
  
  // Aurora Tide - Track A: Scroll reveal animations for feed items
  const feedContainerRef = useScrollReveal('.memory-feed-item', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15
  });
  
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
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Page Header - Feed Only */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-teal-500" aria-hidden="true" />
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  {t('memories.title')}
                </span>
                {/* Track A: Real-time connection indicator */}
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-4 w-4 text-green-500" title="Real-time updates active" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" title="Reconnecting..." />
                )}
              </h1>
              {/* Track C: Accessibility - Keyboard shortcuts hint for screen readers */}
              <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400" aria-label="Keyboard shortcuts">
                <span className="sr-only">{t('memories.keyboardShortcuts')}</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+N</kbd> {t('memories.newPost')}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Main Content - Grid or Feed View */}
              <main className="lg:col-span-2" role="main" aria-label="Memories feed">
                <div className="space-y-4 lg:space-y-6">
                  {/* Post Creator - Always visible per ESA Framework */}
                  {!showCreateModal && (
                    <FadeIn delay={0.1}>
                      <GlassCard depth={2} className="overflow-hidden" role="region" aria-label="Create new memory">
                        <PostCreator 
                      user={{
                        id: parseInt(currentUserId) || 1,
                        name: 'Pierre Dubois',
                        username: 'pierre_dancer',
                        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre'
                      }}
                      onSubmit={(data) => {
                        // ESA Layer 13 FIX: Handle internal media URLs properly
                        console.log('🔍 [ESAMemoryFeed] Received data.content:', data.content);
                        console.log('🏠 [ESAMemoryFeed] Internal media URLs:', data.internalMediaUrls?.length || 0);
                        console.log('📸 [ESAMemoryFeed] Legacy media files:', data.media?.length || 0);

                        // If we have internal URLs, use the direct endpoint (JSON)
                        if (data.internalMediaUrls && data.internalMediaUrls.length > 0) {
                          const postData = {
                            content: data.content,
                            visibility: data.visibility,
                            location: data.location,
                            tags: data.tags,
                            mentions: data.mentions,
                            emotions: data.emotions,
                            mediaUrls: data.internalMediaUrls, // Use uploaded URLs
                            isRecommendation: data.isRecommendation,
                            recommendationType: data.recommendationType,
                            // ESA Layer 8: Forward context fields from PostCreator
                            contextType: data.contextType,
                            contextId: data.contextId
                          };
                          
                          // Use direct endpoint for URL-based media
                          fetch('/api/posts/direct', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(postData)
                          })
                            .then(async res => {
                              if (!res.ok) {
                                const errorText = await res.text();
                                throw new Error(`Failed to create post: ${res.status} - ${errorText}`);
                              }
                              return res.json();
                            })
                            .then(() => {
                              // ESA Layer 5: Invalidate feed queries
                              queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
                              queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
                              
                              // ESA Layer 8: Invalidate group feed if contextType is group
                              if (postData.contextType === 'group' && postData.contextId) {
                                queryClient.invalidateQueries({ queryKey: ['/api/groups', parseInt(postData.contextId), 'posts'] });
                              }
                              
                              setShowCreateModal(false);
                              toast({
                                title: "✨ Memory Created!",
                                description: "Your memory with media has been shared"
                              });
                            })
                            .catch(err => {
                              console.error('Error creating post:', err);
                              toast({
                                title: "Failed to Create Memory",
                                description: err.message || "Please try again",
                                variant: "destructive"
                              });
                            });
                        } 
                        // Otherwise use FormData for legacy file uploads
                        else {
                          const formData = new FormData();
                          formData.append('content', data.content);
                          formData.append('visibility', data.visibility);
                          if (data.location) formData.append('location', data.location);
                          if (data.tags.length > 0) formData.append('tags', JSON.stringify(data.tags));
                          if (data.mentions && data.mentions.length > 0) {
                            formData.append('mentions', JSON.stringify(data.mentions));
                          }
                          if (data.emotions && data.emotions.length > 0) {
                            formData.append('emotions', JSON.stringify(data.emotions));
                          }
                          if (data.isRecommendation) {
                            formData.append('isRecommendation', 'true');
                            if (data.recommendationType) {
                              formData.append('recommendationType', data.recommendationType);
                            }
                          }
                          // ESA Layer 8: Forward context fields from PostCreator
                          if (data.contextType) {
                            formData.append('contextType', data.contextType);
                          }
                          if (data.contextId) {
                            formData.append('contextId', data.contextId);
                          }
                          // Add media files
                          data.media.forEach(file => {
                            formData.append('images', file);
                          });
                          createPostMutation.mutate(formData);
                        }
                      }}
                      onPostCreated={() => {
                        // Optional callback after successful post
                        setShowCreateModal(false);
                      }}
                      context={feedContext}
                    />
                    </GlassCard>
                  </FadeIn>
                  )}
                  
                  {/* Posts Display */}
                  {/* Posts Feed - Context-Based Mode (PostFeed handles all fetching/pagination) */}
                  <section 
                    ref={feedContainerRef} 
                    className="memory-feed-container"
                    role="feed"
                    aria-label="Memory posts feed"
                    aria-live="polite"
                  >
                    <SmartPostFeed 
                      context={feedContext}
                      showFilters={true}
                      showSearch={true}
                      onEdit={handleEditPost}
                    />
                  </section>
                </div>
              </main>

              {/* Right Sidebar - Events */}
              <aside 
                className="lg:col-span-1 hidden lg:block" 
                role="complementary" 
                aria-label="Upcoming events sidebar"
              >
                <Suspense fallback={
                  <div className="animate-pulse" role="status" aria-label="Loading events">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <span className="sr-only">Loading upcoming events...</span>
                  </div>
                }>
                  <UpcomingEventsSidebar />
                </Suspense>
              </aside>
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
          theme={currentTheme.id}
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
              ✏️ {t('memories.edit.title')}
            </h2>
            
            {/* BeautifulPostCreator with edit mode and react-quill */}
            <PostCreator
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
                  title: "Memory Updated",
                  description: "Your changes have been saved"
                });
                queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
                queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
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