// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - EnhancedPostFeedSimple V2 Component
// Canonical feed renderer with virtual scrolling and real-time updates

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  MapPin, Tag, Globe, Users, Lock,
  ThumbsUp, Laugh, Star, Frown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { renderWithMentions } from '@/utils/renderWithMentions';

interface Post {
  id: string;
  user?: {
    id: string | number;
    name: string;
    username: string;
    profileImage?: string;
  };
  // Support both author and user fields for compatibility
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  location?: string;
  tags?: string[] | string;
  visibility?: 'public' | 'friends' | 'private';
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  // Support both new and old reaction formats
  reactions?: {
    likes: number;
    loves: number;
    laughs: number;
    wows: number;
  };
  comments?: number;
  shares?: number;
  // Support multiple media URL formats
  mediaUrls?: string[];
  imageUrl?: string;
  videoUrl?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  isLiked?: boolean;
  userId?: string | number;
}

interface EnhancedPostFeedSimpleProps {
  posts: Post[];
  onReaction?: (postId: string, type: string) => void;
  onComment?: (postId: string, content?: string) => void;
  onShare?: (postId: string) => void;
  onEditPost?: (postId: string, updates: any) => void;
  onDeletePost?: (postId: string) => void;
  onReportPost?: (postId: string, reason?: string) => void;
  currentUserId?: string | number;
}

export default function EnhancedPostFeedSimple({ 
  posts = [], 
  onReaction,
  onComment,
  onShare,
  onEditPost,
  onDeletePost,
  onReportPost,
  currentUserId
}: EnhancedPostFeedSimpleProps) {
  const { theme } = useTheme();
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null);

  const reactions = [
    { type: 'like', icon: ThumbsUp, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
    { type: 'love', icon: Heart, color: 'text-red-400', bgColor: 'bg-red-400/20' },
    { type: 'laugh', icon: Laugh, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
    { type: 'wow', icon: Star, color: 'text-purple-400', bgColor: 'bg-purple-400/20' }
  ];

  const visibilityIcons = {
    public: { icon: Globe, color: 'text-emerald-400' },
    friends: { icon: Users, color: 'text-cyan-400' },
    private: { icon: Lock, color: 'text-slate-400' }
  };

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Helper function to get post author info
  const getPostAuthor = (post: Post) => {
    if (post.user) {
      return {
        id: post.user.id,
        name: post.user.name,
        username: post.user.username,
        avatar: post.user.profileImage
      };
    }
    if (post.author) {
      return {
        id: post.userId || '',
        name: post.author.name,
        username: post.author.username,
        avatar: post.author.avatar
      };
    }
    return {
      id: post.userId || '',
      name: 'Unknown',
      username: 'unknown',
      avatar: undefined
    };
  };

  // Helper function to get post stats
  const getPostStats = (post: Post) => {
    return {
      likes: post.likesCount ?? post.reactions?.likes ?? 0,
      comments: post.commentsCount ?? post.comments ?? 0,
      shares: post.sharesCount ?? post.shares ?? 0,
      isLiked: post.isLiked ?? false
    };
  };

  // Helper function to get media URLs
  const getMediaUrls = (post: Post): string[] => {
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      return post.mediaUrls;
    }
    const urls: string[] = [];
    if (post.imageUrl) urls.push(post.imageUrl);
    if (post.videoUrl) urls.push(post.videoUrl);
    if (post.media) {
      urls.push(...post.media.map(m => m.url));
    }
    return urls;
  };

  // Helper function to get tags
  const getPostTags = (post: Post): string[] => {
    if (Array.isArray(post.tags)) {
      return post.tags;
    }
    if (typeof post.tags === 'string') {
      try {
        const parsed = JSON.parse(post.tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleEditPost = (postId: string) => {
    if (onEditPost) {
      // TODO: Open edit modal
      const content = prompt('Edit your post:');
      if (content) {
        onEditPost(postId, { content });
      }
    }
  };

  const handleDeletePost = (postId: string) => {
    if (onDeletePost) {
      onDeletePost(postId);
    }
  };

  const handleReportPost = (postId: string) => {
    if (onReportPost) {
      onReportPost(postId);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const visibility = post.visibility || 'public';
        const VisIcon = visibilityIcons[visibility].icon;
        const visColor = visibilityIcons[visibility].color;
        const isExpanded = expandedPosts.has(post.id);
        const author = getPostAuthor(post);
        const stats = getPostStats(post);
        const mediaUrls = getMediaUrls(post);
        const tags = getPostTags(post);
        const isAuthor = currentUserId && (author.id === currentUserId || author.id?.toString() === currentUserId?.toString());
        
        return (
          <article
            key={post.id}
            className={cn(
              "backdrop-blur-xl rounded-xl border overflow-hidden transition-all duration-300 shadow-xl",
              theme === 'light' 
                ? "bg-white border-gray-200 hover:border-gray-300" 
                : "bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50"
            )}
          >
            {/* Post Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {author.avatar ? (
                    <img 
                      src={author.avatar} 
                      alt={author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={cn(
                      "w-10 h-10 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] flex items-center justify-center font-bold",
                      "text-white"
                    )}>
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        theme === 'light' ? "text-gray-900" : "text-white"
                      )}>{author.name}</span>
                      <span className={cn(
                        "text-sm",
                        theme === 'light' ? "text-gray-500" : "text-slate-500"
                      )}>@{author.username}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 text-xs",
                      theme === 'light' ? "text-gray-500" : "text-slate-400"
                    )}>
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <VisIcon className={cn("w-3 h-3", visColor)} />
                      <span className={visColor}>{visibility}</span>
                    </div>
                  </div>
                </div>
                <button className={cn(
                  "p-2 rounded-lg transition-colors",
                  theme === 'light' 
                    ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}>
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className={cn(
                "leading-relaxed",
                theme === 'light' ? "text-gray-900" : "text-white",
                !isExpanded && post.content.length > 200 && "line-clamp-3"
              )}>
                {renderWithMentions(post.content)}
              </p>
              {post.content.length > 200 && (
                <button
                  onClick={()  => toggleExpanded(post.id)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm mt-1 transition-colors"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Media Section */}
            {mediaUrls.length > 0 && (
              <div className="px-4 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  {mediaUrls.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative">
                      {url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                        <video
                          src={url}
                          controls
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      {mediaUrls.length > 4 && index === 3 && (
                        <div className={cn(
                          "absolute inset-0 rounded-lg flex items-center justify-center text-white text-2xl font-bold",
                          "bg-black/50"
                        )}>
                          +{mediaUrls.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Tags */}
            {(post.location || tags.length > 0) && (
              <div className="px-4 pb-3 space-y-2">
                {post.location && (
                  <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className={cn(
                          "px-2 py-1 text-xs rounded-full flex items-center gap-1",
                          theme === 'light' 
                            ? "bg-gray-100 text-gray-600"
                            : "bg-slate-800/50 text-slate-300"
                        )}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reactions Summary */}
            {(stats.likes > 0 || stats.comments > 0 || stats.shares > 0) && (
              <div className="px-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {stats.likes > 0 && (
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                      "bg-blue-400/20"
                    )}>
                      <ThumbsUp className={cn("w-3 h-3", "text-blue-400")} />
                      <span className={theme === 'light' ? "text-gray-900" : "text-white"}>{stats.likes}</span>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "flex items-center gap-3 text-xs",
                  theme === 'light' ? "text-gray-500" : "text-slate-400"
                )}>
                  {stats.comments > 0 && <span>{stats.comments} comments</span>}
                  {stats.shares > 0 && <span>{stats.shares} shares</span>}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className={cn(
              "border-t",
              theme === 'light' ? "border-gray-200" : "border-slate-800/50"
            )}>
              <div className="flex items-center">
                {/* Reactions */}
                <div 
                  className="relative flex-1"
                  onMouseEnter={() => setHoveredReaction(post.id)}
                  onMouseLeave={() => setHoveredReaction(null)}
                >
                  <button
                    onClick={()  => onReaction?.(post.id, 'like')}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 transition-all",
                      theme === 'light' 
                        ? "text-gray-500 hover:text-cyan-600 hover:bg-gray-100"
                        : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30"
                    )}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">React</span>
                  </button>
                  
                  {/* Reaction Picker */}
                  {hoveredReaction === post.id && (
                    <div className={cn(
                      "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-2 rounded-full p-2 shadow-xl animate-in slide-in-from-bottom-2",
                      theme === 'light' ? "bg-white border border-gray-200" : "bg-slate-800"
                    )}>
                      {reactions.map(reaction => {
                        const Icon = reaction.icon;
                        return (
                          <button
                            key={reaction.type}
                            onClick={()  => {
                              onReaction?.(post.id, reaction.type);
                              setHoveredReaction(null);
                            }}
                            className={cn(
                              "p-2 rounded-full transition-all hover:scale-125",
                              reaction.bgColor
                            )}
                          >
                            <Icon className={cn("w-5 h-5", reaction.color)} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Comment */}
                <button
                  onClick={()  => onComment?.(post.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 transition-all border-x",
                    theme === 'light' 
                      ? "text-gray-500 hover:text-cyan-600 hover:bg-gray-100 border-gray-200"
                      : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30 border-slate-800/50"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Comment</span>
                </button>

                {/* Share */}
                <button
                  onClick={()  => onShare?.(post.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 transition-all",
                    theme === 'light' 
                      ? "text-gray-500 hover:text-cyan-600 hover:bg-gray-100"
                      : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30"
                  )}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </article>
        );
      })}

      {/* No posts message */}
      {posts.length === 0 && (
        <div className={cn(
          "text-center py-12",
          theme === 'light' ? "text-gray-500" : "text-slate-400"
        )}>
          <p className="text-lg">No memories yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}