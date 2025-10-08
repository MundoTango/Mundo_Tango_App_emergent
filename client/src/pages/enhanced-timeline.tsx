"use client";

import { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next';;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
// ESA Layer 7: Input and Textarea handled by BeautifulPostCreator internally
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import WhatsOnYourMind from "@/components/feed/WhatsOnYourMind";
import PostLikeComment from "@/components/feed/PostLikeComment";
import EnhancedPostItem from "@/components/moments/EnhancedPostItem";
// ESA Layer 7: Import full-featured EnhancedPostComposer with ReactQuill rich text editor
import EnhancedPostComposer from "@/components/moments/EnhancedPostComposer";
// ESA Layer 7: Edit functionality handled by BeautifulPostCreator in edit mode
// ESA Layer 7: Icons handled by BeautifulPostCreator internally
import DashboardLayout from "@/layouts/DashboardLayout";

interface Post {
  id: number; // Must be number to work with EnhancedPostItem
  userId: number; // Required field for EnhancedPostItem
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  likes: number;
  isLiked: boolean;
  comments: number;
  commentsCount?: number; // EnhancedPostItem uses commentsCount
  shares: number;
  createdAt: string;
  visibility: string;
  isSaved?: boolean;
}

const EnhancedTimeline = () => {
  const { t } = useTranslation();
  console.log("🚀 EnhancedTimeline component is rendering!");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log("🔍 User data:", user);
  
  // Debug log to confirm page is loading
  console.log("🎯 EnhancedTimeline page loaded!");
  
  const [visibility, setVisibility] = useState("Public");
  const [createPostModal, setCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  // ESA Layer 7: All post content state handled by BeautifulPostCreator

  // Fetch posts with visibility filter
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/feed", visibility],
    queryFn: async () => {
      const visibilityParam = visibility === "All" ? "" : visibility.toLowerCase();
      const response = await fetch(`/api/posts/feed?visibility=${visibilityParam}`);
      return response.json();
    },
  });

  const posts: Post[] = postsData?.data || [];
  
  // Debug log to check post IDs
  console.log('📊 Posts received:', posts.map(p => ({ id: p.id, content: p.content.substring(0, 50) })));

  // ESA Layer 7: Create and update mutations handled by BeautifulPostCreator

  const handleCreatePost = () => {
    setEditingPost(null);
    setCreatePostModal(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setCreatePostModal(true);
  };

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  const handleLikePost = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const handleSharePost = (postId: string) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Check out this tango moment!",
        url: postUrl,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      navigator.clipboard.writeText(postUrl);
      toast({ 
        title: "Link copied!",
        description: "Post link has been copied to clipboard."
      });
    }
  };

  // ESA Layer 7: Post content management handled by BeautifulPostCreator

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[var(--color-surface-elevated)]">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="grid grid-cols-12 gap-6">
          {/* Main Timeline */}
          <div className="col-span-12 lg:col-span-9">
            <div className="space-y-6">
              {/* What's on your mind */}
              <WhatsOnYourMind
                visibility={visibility}
                setVisibility={setVisibility}
                onCreatePost={handleCreatePost}
              />

              {/* Posts Feed */}
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="bg-[var(--color-surface)] dark:bg-gray-900">
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No posts available</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Add a banner to confirm we're on Timeline page */}
                    <div className="bg-green-100 border-4 border-green-600 p-4 rounded-lg mb-4">
                      <h2 className="text-xl font-bold text-green-800 mb-2">✅ TIMELINE PAGE - FACEBOOK DESIGN ACTIVE ✅</h2>
                      <p className="text-green-700">You're now viewing the Timeline with the new Facebook-inspired design!</p>
                    </div>
                    {posts.map((post, index) => (
                      <EnhancedPostItem
                        key={post.id}
                        post={post}
                        onLike={() => handleLikePost(post.id)}
                        onShare={() => handleSharePost(post.id)}
                        onEdit={handleEditPost}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Events */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6">
              {/* Events sidebar removed - using ESAMemoryFeed's UpcomingEventsSidebar instead */}
            </div>
          </div>
        </div>
      </div>

      {/* ESA Layer 7 & 23: Unified Create/Edit Post Modal using EnhancedPostComposer with full features */}
      <Dialog open={createPostModal} onOpenChange={setCreatePostModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
          <div className="bg-[var(--color-surface)] dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl">
            <EnhancedPostComposer 
              editMode={!!editingPost}
              existingPost={editingPost ? {
                id: editingPost.id,
                content: editingPost.content,
                location: editingPost.location,
                // ESA: Normalize visibility to lowercase for EnhancedPostComposer
                visibility: (editingPost.visibility || 'public').toLowerCase() as 'public' | 'friends' | 'private',
                imageUrl: editingPost.imageUrl,
                videoUrl: editingPost.videoUrl
              } : undefined}
              onPostCreated={() => {
                setCreatePostModal(false);
                setEditingPost(null);
                queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
                toast({
                  title: {t('states.success', 'Success')},
                  description: "Your post has been created!"
                });
              }}
              onPostUpdated={(id: number) => {
                setCreatePostModal(false);
                setEditingPost(null);
                queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
                toast({
                  title: "Success", 
                  description: "Your post has been updated!"
                });
              }}
              onClose={() => {
                setCreatePostModal(false);
                setEditingPost(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Add display name for debugging
EnhancedTimeline.displayName = 'EnhancedTimeline';

export default EnhancedTimeline;