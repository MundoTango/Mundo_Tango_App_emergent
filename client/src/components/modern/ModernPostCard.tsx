import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Clock, Sparkles, Users } from 'lucide-react';
import { format } from 'date-fns';
import { PostActionsMenu } from '@/components/ui/PostActionsMenu';
import ShareModal from './ShareModal';
import { MTCard, MTBadge, MTButton } from '@/components/ui-library';

interface ModernPostCardProps {
  post: {
    id: number;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string | Date;
    user: {
      id: number;
      name: string;
      username: string;
      profileImage?: string | null;
    };
  };
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ModernPostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  isOwner = false,
  onEdit,
  onDelete
}: ModernPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const formatDate = (date: string | Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return format(postDate, 'MMM d, yyyy');
  };

  return (
    <MTCard 
      variant="glass"
      hover={true}
      glow={true}
      rounded="3xl"
      padding="none"
      className="overflow-hidden group relative transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-2 border-teal-200/50 dark:border-teal-700/50"
    >
      
      {/* Floating engagement indicator */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <MTBadge variant="gradient" size="sm" icon={<Sparkles className="w-3 h-3" />} glow={true}>
          Hot
        </MTBadge>
      </div>

      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group/avatar">
              <img
                src={post.user.profileImage || '/api/placeholder/48/48'}
                alt={post.user.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-300 dark:border-teal-600 shadow-lg
                         group-hover/avatar:scale-110 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-teal-400 to-blue-600 
                            rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold bg-gradient-to-r from-teal-600 to-blue-800 dark:from-teal-400 dark:to-blue-600 bg-clip-text text-transparent hover:from-teal-500 hover:to-blue-700 cursor-pointer transition-all text-lg">
                  {post.user.name}
                </h3>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">@{post.user.username}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-teal-600/70 dark:text-teal-400/70">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDate(post.createdAt)}</span>
                <span>•</span>
                <MTBadge variant="glass" size="sm" icon={<Users className="w-3 h-3" />}>
                  Public
                </MTBadge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                {onEdit && (
                  <MTButton
                    onClick={onEdit}
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    data-testid={`button-edit-post-${post.id}`}
                  >
                    Edit
                  </MTButton>
                )}
                {onDelete && (
                  <MTButton
                    onClick={onDelete}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    data-testid={`button-delete-post-${post.id}`}
                  >
                    Delete
                  </MTButton>
                )}
              </>
            )}
            <PostActionsMenu postId={post.id} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
        />
      )}

      {/* Content */}
      <div className="px-8 pb-6">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg font-medium">{post.content}</p>
      </div>

      {/* Media */}
      {post.imageUrl && (
        <div className="px-8 pb-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 shadow-xl">
            <img
              src={post.imageUrl}
              alt="Memory"
              className={`w-full h-auto transition-all duration-700 hover:scale-105 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-8 py-6 border-t-2 border-teal-100/50 dark:border-teal-800/50 bg-gradient-to-r from-teal-50/20 to-blue-50/20 dark:from-teal-900/10 dark:to-blue-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MTButton
              onClick={handleLike}
              variant={isLiked ? "gradient" : "glass"}
              size="md"
              icon={<Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />}
              className={`font-bold ${isLiked ? 'text-white' : ''}`}
            >
              {post.likesCount}
            </MTButton>
            
            <MTButton
              onClick={() => onComment?.(post.id)}
              variant="glass"
              size="md"
              icon={<MessageCircle className="w-5 h-5" />}
              className="font-bold"
            >
              {post.commentsCount}
            </MTButton>
            
            <MTButton
              onClick={() => setShowShareModal(true)}
              variant="glass"
              size="md"
              icon={<Share2 className="w-5 h-5" />}
              className="font-bold"
            >
              {post.sharesCount}
            </MTButton>
          </div>
          
          <MTButton
            onClick={handleBookmark}
            variant={isBookmarked ? "gradient" : "glass"}
            size="sm"
            className="p-3"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-white' : 'text-teal-600'}`} />
          </MTButton>
        </div>

        {/* Engagement stats */}
        <div className="mt-4 pt-4 border-t border-teal-100/50 dark:border-teal-800/50">
          <div className="flex items-center justify-between text-sm">
            <MTBadge variant="gradient" size="sm">
              {post.likesCount + post.commentsCount + post.sharesCount} total engagements
            </MTBadge>
            <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold hover:underline transition-colors">
              See Friendship
            </button>
          </div>
        </div>
      </div>
    </MTCard>
  );
}