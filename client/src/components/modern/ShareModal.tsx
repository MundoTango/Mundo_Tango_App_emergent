import React, { useState } from 'react';
import { Share2, MessageSquare, Link } from 'lucide-react';
import { MTModalBase, MTButton } from '@/components/ui-library';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/glass/GlassComponents';


interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    content: string;
    user: {
      name: string;
    };
  };
}

export default function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShareToTimeline = async () => {
    setIsSharing(true);
    try {
      // Implement share to timeline logic
      toast({
        title: "Shared successfully",
        description: "Post shared to your timeline",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share post",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareWithComment = async () => {
    setIsSharing(true);
    try {
      // Implement share with comment logic
      toast({
        title: "Opening composer",
        description: "Add your thoughts when sharing",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to open composer",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <MTModalBase
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      variant="ocean"
      animationType="scale"
      data-testid="share-modal"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-900 bg-clip-text text-transparent">
            Share Post
          </h2>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <GlassCard depth={1} className="bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-teal-200/30 dark:border-teal-700/30">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {post.content}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              by {post.user.name}
            </p>
          </GlassCard>

          {/* Actions */}
          <div className="space-y-3">
            <MTButton
              onClick={handleShareToTimeline}
              disabled={isSharing}
              loading={isSharing}
              variant="primary"
              fullWidth
              icon={Share2}
              data-testid="share-timeline"
            >
              Share to Timeline
            </MTButton>

            <MTButton
              onClick={handleShareWithComment}
              disabled={isSharing}
              variant="outline"
              fullWidth
              icon={MessageSquare}
              data-testid="share-comment"
            >
              Share with Comment
            </MTButton>

            <MTButton
              onClick={handleCopyLink}
              variant="outline"
              fullWidth
              icon={Link}
              data-testid="share-copy-link"
            >
              Copy Link
            </MTButton>
          </div>
        </div>
      </div>
    </MTModalBase>
  );
}