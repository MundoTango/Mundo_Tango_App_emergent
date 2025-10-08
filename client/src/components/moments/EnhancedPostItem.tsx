import { useState, useMemo, useEffect, memo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Users,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { Link } from 'wouter';
import { MTCard, MTButton, MTBadge } from '@/components/ui-library';

import { renderWithMentions } from '@/utils/renderWithMentions';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { formatUserLocation } from '@/utils/locationUtils';
import { SimpleLikeButton } from '@/components/ui/SimpleLikeButton';
import { SimpleCommentEditor } from '@/components/ui/SimpleCommentEditor';
import { PostActionsMenu } from '@/components/ui/PostActionsMenu';
// ESA Layer 7: Edit functionality delegated to parent's unified composer (EnhancedPostComposer)
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface Post {
  id: number; // Using integer as stored in database
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    fullName?: string; // Full name for hover tooltip
    username: string;
    profileImage?: string;
    tangoRoles?: string[];
    leaderLevel?: number;
    followerLevel?: number;
    city?: string;
    state?: string;
    country?: string;
    friendshipStatus?: 'accepted' | 'pending' | 'none' | 'following'; // ESA Framework: Friendship status
    connectionType?: string; // ESA Framework: Connection type (friend, follower, etc)
  };
  likes?: number;
  commentsCount?: number;
  isLiked?: boolean;
  hashtags?: string[];
  location?: string;
  hasConsent?: boolean;
  mentions?: Array<{
    type: 'user' | 'event' | 'group';
    id: string;
    display: string;
  }>;
  emotionTags?: string[];
  reactions?: { [key: string]: number };
  currentUserReaction?: string;
  comments?: Array<{
    id: number;
    content: string;
    userId: number;
    user: {
      id: number;
      name: string;
      profileImage?: string;
    };
    createdAt: string;
    mentions?: string[];
  }>;
}

interface PostItemProps {
  post: Post;
  currentUserId?: string; // ESA Framework Layer 4: Current authenticated user ID
  onLike: ((postId: number) => void) | ((post: Post) => void); // Accept both formats for compatibility
  onShare: (post: Post) => void;
  onEdit?: (post: Post) => void; // ESA Layer 7: Handle edit in parent with unified composer
  onDelete?: (postId: number) => void; // Callback after successful deletion
  apiBasePath?: string; // API endpoint base path (default: '/api/posts')
  cacheKeys?: string[]; // Cache keys to invalidate on mutations (default: ['/api/posts/feed', '/api/posts'])
  onComment?: (postId: number) => void; // Optional comment handler
  onBookmark?: (postId: number) => void; // Optional bookmark handler
}

function EnhancedPostItem({ 
  post, 
  currentUserId, 
  onLike, 
  onShare, 
  onEdit,
  onDelete,
  apiBasePath = '/api/posts',
  cacheKeys = ['/api/posts/feed', '/api/posts']
}: PostItemProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showShareWithCommentModal, setShowShareWithCommentModal] = useState(false);
  const [shareComment, setShareComment] = useState('');
  const [currentUserReaction, setCurrentUserReaction] = useState(post.currentUserReaction);

  const [comments, setComments] = useState(post.comments || []);

  // Fetch comments when section is opened
  const { data: fetchedComments } = useQuery({
    queryKey: [`${apiBasePath}/${post.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`${apiBasePath}/${post.id}/comments`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data || [];
    },
    enabled: showComments && post.id != null
  });

  // Update comments when fetched
  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  // Calculate age-based opacity for gradual fade effect
  const postAge = useMemo(() => {
    // Safely handle date - default to current date if invalid
    const createdDate = post.createdAt ? new Date(post.createdAt) : new Date();
    if (isNaN(createdDate.getTime())) {
      return 1; // Full opacity if date is invalid
    }
    const daysSinceCreated = differenceInDays(new Date(), createdDate);
    if (daysSinceCreated <= 1) return 1; // Full opacity for recent posts
    if (daysSinceCreated <= 7) return 0.95; // Slight fade for week-old posts
    if (daysSinceCreated <= 30) return 0.85; // More fade for month-old posts
    return 0.75; // Most fade for older posts
  }, [post.createdAt]);



  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'love': 'bg-pink-100 text-pink-800 border-pink-200',
      'excitement': 'bg-orange-100 text-orange-800 border-orange-200',
      'nostalgia': 'bg-purple-100 text-purple-800 border-purple-200',
      'gratitude': 'bg-green-100 text-green-800 border-green-200',
      'inspiration': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMentionIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-3 w-3" />;
      case 'event': return <Calendar className="h-3 w-3" />;
      case 'group': return <Users className="h-3 w-3" />;
      default: return null;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // API Mutations
  const reactionMutation = useMutation({
    mutationFn: async ({ postId, reaction }: { postId: number; reaction: string }) => {
      const response = await fetch(`${apiBasePath}/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          reaction
        })
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all relevant cache keys
      cacheKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content, mentions }: { postId: number; content: string; mentions: string[] }) => {
      const response = await fetch(`${apiBasePath}/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          content,
          mentions 
        })
      });
      return response.json();
    },
    onSuccess: (response) => {
      // Invalidate all relevant cache keys
      cacheKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      // Always invalidate comments for this specific post
      queryClient.invalidateQueries({ queryKey: [`${apiBasePath}/${post.id}/comments`] });
      
      // Add the actual comment returned from server
      if (response.data) {
        setComments(prev => [...prev, response.data]);
      }
      
      setShowComments(true);
      toast({ title: "Comment posted successfully!" });
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ postId, reason, description }: { postId: number; reason: string; description: string }) => {
      const response = await fetch(`${apiBasePath}/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          reason,
          description 
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Report submitted",
        description: "Thank you for your report. We'll review it shortly."
      });
      // Report functionality now handled by PostActionsMenu
    }
  });

  const shareToWallMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: number; comment?: string }) => {
      const response = await fetch(`${apiBasePath}/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          comment: comment || ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to share post: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Post shared to your timeline!" });
      setShowShareOptions(false);
      // Invalidate all relevant cache keys plus user posts
      cacheKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to share post",
        description: error.message || "Please try again"
      });
    }
  });

  // Enhanced handler functions
  const handleReaction = (reactionId: string) => {
    // Facebook-style reactions: like, love, haha, wow, sad, angry
    const facebookReactions: Record<string, string> = {
      'like': '👍',
      'love': '❤️',
      'haha': '😆',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    };
    
    setCurrentUserReaction(reactionId === currentUserReaction ? '' : reactionId);
    reactionMutation.mutate({ postId: post.id, reaction: reactionId });
  };

  const handleComment = (content: string, mentions: string[]) => {
    commentMutation.mutate({ postId: post.id, content, mentions });
  };

  // ESA Layer 7 & 23: Edit handled by parent's unified composer
  const handleEdit = () => {
    // Pass edit request to parent component which will show EnhancedPostComposer
    if (onEdit) {
      console.log('[ESA DEBUG] EnhancedPostItem handleEdit: Calling parent onEdit with post:', post.id);
      onEdit(post);
    } else {
      console.warn('[ESA DEBUG] EnhancedPostItem: No onEdit handler provided by parent');
      toast({
        title: "Edit not available",
        description: "Please use the Memories page to edit posts",
        variant: "destructive"
      });
    }
  };

  // ESA LIFE CEO 61x21 - Enhanced delete handler
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        // Use dynamic apiBasePath for context-aware deletion
        const endpoint = `${apiBasePath}/${post.id}`;
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          toast({ 
            title: "Post deleted",
            description: "Your post has been successfully deleted."
          });
          
          // Invalidate all relevant cache keys
          cacheKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
          
          // Notify parent component of deletion
          if (onDelete) {
            onDelete(post.id);
          }
        } else {
          const errorData = await response.text();
          // Delete failed
          throw new Error('Failed to delete post');
        }
      } catch (error) {
        // Delete error occurred
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleReport = async (reason: string, description: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          postId: post.id, 
          reason, 
          description,
          reportedUserId: post.userId,
          reportType: 'post'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "Report submitted",
        description: "Thank you for reporting. Our admin team will review this post."
      });
      // Report functionality moved to PostActionsMenu
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: "Error", 
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // Don't use native share API, use platform share modal
    setShowShareOptions(true);
  };

  const handleShareToWall = (comment?: string) => {
    shareToWallMutation.mutate({ postId: post.id, comment });
  };

  // ESA LIFE CEO 61x21 - Layer 5 (Authorization) Fix
  // Check if current user is the owner of the post (proper ID comparison)
  const isTestPost = post.content?.includes("TEST POST FOR REPORTING");
  const isOwner = isTestPost ? false : (post.userId === user?.id);
  
  // Debug ownership logic
  console.log('🔐 Post ownership check:', {
    postId: post.id,
    postUserId: post.userId,
    currentUserId: user?.id,
    isOwner: isOwner,
    isTestPost: isTestPost
  });

  const consentGlowClass = post.hasConsent 
    ? 'ring-2 ring-emerald-200 shadow-emerald-100/50 shadow-lg' 
    : '';

  return (
    <MTCard 
      variant="glass"
      hover={true}
      glow={true}
      rounded="3xl"
      padding="none"
      className={`glassmorphic glassmorphic-hover overflow-hidden mb-4 group relative transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-2 border-teal-200/50 dark:border-teal-700/50 ${consentGlowClass}`}
      style={{ opacity: postAge }}
    >
      {/* ESA Framework: Floating engagement indicator from MT Ocean theme */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <MTBadge variant="gradient" size="sm" icon={<Sparkles className="w-3 h-3" />} glow={true}>
          Hot
        </MTBadge>
      </div>
      
      {/* Consent indicator glow effect */}
      {post.hasConsent && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl opacity-30 blur-sm animate-pulse"></div>
      )}
      
      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar with enhanced styling */}
            <div className="relative">
              {post.user?.profileImage ? (
                <img
                  src={post.user.profileImage}
                  alt={post.user.name || 'User'}
                  className="w-14 h-14 object-cover rounded-2xl ring-2 ring-indigo-100 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getAvatarFallback(post.user?.name || 'Anonymous')}
                </div>
              )}
              
              {/* Consent status indicator */}
              {post.hasConsent && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info with enhanced typography */}
            <div className="flex-1">
              <div className="flex flex-col gap-1 mb-1">
                <Link href={`/profile/${post.user?.id || post.userId}`}>
                  <h3 
                    className="font-bold text-xl text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors"
                    title={post.user?.fullName || post.user?.name || 'Anonymous'}
                  >
                    {post.user?.name || 'Anonymous'}
                  </h3>
                </Link>
                <div className="text-gray-500 text-sm">
                  {formatUserLocation({ 
                    city: post.user?.city, 
                    state: post.user?.state, 
                    country: post.user?.country 
                  })}
                </div>
              </div>
              
              {/* Enhanced Emoji Role Display */}
              <RoleEmojiDisplay
                tangoRoles={post.user?.tangoRoles}
                leaderLevel={post.user?.leaderLevel}
                followerLevel={post.user?.followerLevel}
                size="sm"
                maxRoles={5}
                className="mt-1"
              />
            </div>
          </div>

          {/* Enhanced timestamp and actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <time className="text-sm font-medium">
                {(() => {
                  const createdDate = post.createdAt ? new Date(post.createdAt) : new Date();
                  if (isNaN(createdDate.getTime())) {
                    return t('time.recently');
                  }
                  return `${formatDistanceToNow(createdDate)} ${t('time.ago')}`;
                })()}
              </time>
            </div>
            
            {/* ESA LIFE CEO 61x21 - Post Actions Menu with Edit/Delete */}
            <PostActionsMenu
              post={post}
              onEdit={onEdit} // ESA Layer 7: Pass edit to parent's unified composer
              onShare={onShare}
            />
          </div>
        </header>

        {/* Emotions and Location Section */}
        {(post.emotionTags?.length || post.location) && (
          <section className="flex items-center justify-between py-4 px-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
            {/* Emotion tags */}
            {post.emotionTags && post.emotionTags.length > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <div className="flex gap-2 flex-wrap">
                  {post.emotionTags.map((emotion, index) => (
                    <span
                      key={index}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${getEmotionColor(emotion)}
                        hover:scale-105 transition-transform duration-200
                      `}
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-2 text-indigo-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{post.location}</span>
              </div>
            )}
          </section>
        )}

        {/* ESA Fix: Removed purple "Mentioned" section per user request - mentions are already clickable in content */}

        {/* Enhanced Content Section - ESA Layer 7 & 23: Content display only, edit via PostEditCreatorDialog */}
        <section className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed text-lg">
            {renderWithMentions ? renderWithMentions(post.content) : post.content}
          </div>

          {/* ESA LIFE CEO 61x21 - FIXED media display with ALL fields */}
          {(() => {
            // ESA LIFE CEO 61x21 - Check ALL possible media fields
            const mediaEmbeds = (post as any).mediaEmbeds || [];
            const mediaUrls = (post as any).mediaUrls || [];
            const hasDirectMedia = post.imageUrl || post.videoUrl;
            const hasMediaEmbeds = mediaEmbeds.length > 0;
            const hasMediaUrls = mediaUrls.length > 0;
            
            // Debug media processing
            // Processing post media
            
            if (!hasDirectMedia && !hasMediaUrls && !hasMediaEmbeds) return null;
            
            // Collect all media to display
            const allMedia: Array<{url: string, type: 'image' | 'video'}> = [];
            const processedUrls = new Set<string>();
            
            // ESA Framework Layer 13: Type-safe video file detection
            const isVideoFile = (url: string | any): boolean => {
              if (!url) return false;
              const urlString = typeof url === 'string' ? url : String(url || '');
              if (!urlString) return false;
              const lower = urlString.toLowerCase();
              return lower.includes('.mp4') || lower.includes('.mov') || 
                     lower.includes('.webm') || lower.includes('.avi') ||
                     lower.includes('.m4v') || lower.includes('.mkv');
            };
            
            // Helper to add media without duplicates
            const addMedia = (url: string) => {
              if (!url || processedUrls.has(url)) return;
              processedUrls.add(url);
              const type = isVideoFile(url) ? 'video' : 'image';
              allMedia.push({ url, type });
              // Media added to display list
            };
            
            // Priority 1: Process mediaEmbeds (MOST IMPORTANT for new uploads)
            if (hasMediaEmbeds) {
              mediaEmbeds.forEach((url: string) => addMedia(url));
            }
            
            // Priority 2: Process mediaUrls
            if (hasMediaUrls) {
              mediaUrls.forEach((url: string) => addMedia(url));
            }
            
            // Priority 3: Process direct imageUrl (might be a video)
            if (post.imageUrl) {
              addMedia(post.imageUrl);
            }
            
            // Priority 4: Process videoUrl
            if (post.videoUrl) {
              addMedia(post.videoUrl);
            }
            
            if (allMedia.length === 0) return null;
            
            // Render media grid
            return (
              <div className={`mt-6 ${allMedia.length > 1 ? 'grid grid-cols-2 gap-3' : ''}`}>
                {allMedia.slice(0, 4).map((media, index) => (
                  <div key={`${post.id}-media-${index}`} className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-black">
                    {media.type === 'video' ? (
                      <div className="relative w-full">
                        {/* ESA LIFE CEO 61x21 - Loading indicator */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none" id={`loading-${post.id}-${index}`}>
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                        </div>
                        <video
                          src={media.url.startsWith('http') ? media.url : `${window.location.origin}${media.url}`}
                          controls
                          className="w-full h-auto relative z-10"
                          preload="auto"
                          playsInline
                          muted
                          style={{ display: 'block', width: '100%', height: 'auto' }}
                          onError={(e) => {
                            // Video loading error
                            e.currentTarget.style.display = 'none';
                            // Hide loading indicator on error
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                          onLoadedData={(e) => {
                            // Video data loaded
                            // Hide loading indicator when data is loaded
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                          onLoadedMetadata={() => {
                            // Video metadata loaded
                          }}
                          onCanPlay={() => {
                            // Video ready to play
                            // Ensure loading indicator is hidden
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                          onProgress={(e) => {
                            const video = e.currentTarget as HTMLVideoElement;
                            const buffered = video.buffered;
                            if (buffered.length > 0) {
                              const bufferedEnd = buffered.end(buffered.length - 1);
                              const duration = video.duration;
                              if (duration > 0) {
                                const percent = (bufferedEnd / duration) * 100;
                                // Buffering progress
                              }
                            }
                          }}
                          onWaiting={() => {
                            // Video buffering
                            // Show loading indicator when buffering
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'flex';
                          }}
                          onPlaying={() => {
                            // Video playing
                            // Hide loading indicator when playing
                            const loader = document.getElementById(`loading-${post.id}-${index}`);
                            if (loader) loader.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Image load error
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          // Image loaded successfully
                        }}
                      />
                    )}
                  </div>
                ))}
                {allMedia.length > 4 && (
                  <div className="rounded-2xl bg-gray-100 flex items-center justify-center p-4">
                    <span className="text-gray-600 font-medium">+{allMedia.length - 4} more</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {post.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  #
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Enhanced Action Bar */}
        <footer className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Simple Like System */}
            <SimpleLikeButton
              postId={post.id}
              currentReaction={currentUserReaction}
              reactions={post.reactions}
              onReact={handleReaction}
            />

            {/* Comment button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length || 0}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {/* ESA LIFE CEO 61×21 - See Friendship button (Layer 24: Social Features Agent) */}
            {(() => {
              // ESA Debug: Log all post user data
              if (post.user && (post.user.id === 1 || post.user.id === 5)) {
                console.log('[ESA UI] Post user data:', {
                  postId: post.id,
                  user: post.user,
                  hasFS: 'friendshipStatus' in (post.user || {}),
                  fStatus: post.user?.friendshipStatus,
                  currentUserId: currentUserId,
                  parsedCurrent: parseInt(currentUserId || '0')
                });
              }
              
              // Show button only for accepted friendships (not for own posts)
              if (post.user?.friendshipStatus === 'accepted' && 
                  post.user?.id !== parseInt(currentUserId || '0')) {
                return (
                  <Link 
                    href={`/friendship/${post.user.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium bg-gradient-to-r from-teal-500/10 to-cyan-600/10 text-teal-600 hover:from-teal-500/20 hover:to-cyan-600/20 hover:text-teal-700 transition-all duration-200 border border-teal-200/30 hover:border-teal-300/50"
                    data-testid={`button-see-friendship-${post.user.id}`}
                    title={t('memories.post.viewFriendshipWith', { name: post.user?.name })}
                  >
                    <Users className="h-5 w-5" />
                    <span>{t('memories.post.seeFriendship')}</span>
                  </Link>
                );
              }
              return null;
            })()}
          </div>

          <div className="flex items-center gap-2">
            {/* Right side actions if needed */}
          </div>
        </footer>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 space-y-4">
            {/* Comment Editor */}
            <SimpleCommentEditor
              postId={post.id}
              onSubmit={(content) => handleComment(content, [])}
              placeholder={t('memories.post.commentPlaceholder')}
            />

            {/* Existing Comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getAvatarFallback(comment.user?.name || t('memories.post.anonymous'))}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.user?.name || t('memories.post.anonymous')}</span>
                        <span className="text-xs text-gray-500">
                          {(() => {
                            const commentDate = comment.createdAt ? new Date(comment.createdAt) : new Date();
                            if (isNaN(commentDate.getTime())) {
                              return t('memories.post.recently');
                            }
                            return formatDistanceToNow(commentDate, { addSuffix: true });
                          })()}
                        </span>
                      </div>
                      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: comment.content }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal removed due to type conflicts */}

        {/* Report functionality now handled by PostActionsMenu */}

        {/* Share Options Dialog */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
              <h3 className="text-xl font-bold mb-4">{t('memories.share.sharePost')}</h3>
              
              <div className="space-y-3">
                {/* Share to Timeline */}
                <button
                  onClick={() => handleShareToWall()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Share2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('memories.share.shareToTimeline')}</p>
                    <p className="text-sm text-gray-600">{t('memories.share.shareToTimelineDesc')}</p>
                  </div>
                </button>

                {/* Share with Comment */}
                <button
                  onClick={() => {
                    setShowShareOptions(false);
                    setShowShareWithCommentModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-full">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('memories.share.shareWithComment')}</p>
                    <p className="text-sm text-gray-600">{t('memories.share.shareWithCommentDesc')}</p>
                  </div>
                </button>

                {/* Copy Link */}
                <button
                  onClick={async () => {
                    try {
                      const shareUrl = `/posts/${post.id}`;
                      const fullUrl = `${window.location.origin}${shareUrl}`;
                      
                      // Try modern clipboard API first
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(fullUrl);
                      } else {
                        // Fallback for older browsers
                        const textArea = document.createElement("textarea");
                        textArea.value = fullUrl;
                        textArea.style.position = "fixed";
                        textArea.style.left = "-999999px";
                        textArea.style.top = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();
                      }
                      
                      toast({ title: t('memories.share.linkCopied') });
                      setShowShareOptions(false);
                    } catch (error) {
                      toast({ 
                        title: t('memories.share.linkCopyFailed'),
                        description: t('memories.share.pleaseTryAgain') 
                      });
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Share2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t('memories.share.copyLink')}</p>
                    <p className="text-sm text-gray-600">{t('memories.share.copyLinkDesc')}</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowShareOptions(false)}
                className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('memories.share.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Share with Comment Modal */}
        {showShareWithCommentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                {t('memories.share.shareWithComment')}
              </h3>
              
              {/* Original Post Preview */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getAvatarFallback(post.user?.name || t('memories.post.anonymous'))}
                  </div>
                  <span className="font-medium text-sm">{post.user?.name}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.content}
                </p>
              </div>

              {/* Comment Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('memories.share.addThoughtsOptional')}
                </label>
                <textarea
                  value={shareComment}
                  onChange={(e) => setShareComment(e.target.value)}
                  placeholder={t('memories.share.whatDoYouThink')}
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowShareWithCommentModal(false);
                    setShareComment('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('memories.share.cancel')}
                </button>
                <button
                  onClick={() => {
                    handleShareToWall(shareComment);
                    setShowShareWithCommentModal(false);
                    setShareComment('');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-colors"
                >
                  {t('memories.share.share')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ESA Layer 7 & 23: Edit handled by parent component's unified composer */}
    </MTCard>
  );
}

export default memo(EnhancedPostItem);