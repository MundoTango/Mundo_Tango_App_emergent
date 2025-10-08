import React, { useState } from 'react';
import { 
  Share2, 
  MessageSquare, 
  Link, 
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Check,
  X
} from 'lucide-react';
import { MTModalBase, MTButton } from '@/components/ui-library';
import { useToast } from '@/hooks/use-toast';
import { useMemorySocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    content: string;
    imageUrl?: string | null;
    user: {
      id: number;
      name: string;
      username: string;
    };
  };
}

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  shareUrl: (url: string, text: string) => string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    shareUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  },
  {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'text-gray-900',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    shareUrl: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    shareUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    shareUrl: (url, text) => `mailto:?subject=${encodeURIComponent('Check out this memory!')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
  }
];

export default function EnhancedShareModal({ isOpen, onClose, post }: EnhancedShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareComment, setShareComment] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { emitShare, isConnected } = useMemorySocket(String(post.id), user?.id?.toString());

  const postUrl = `${window.location.origin}/memories/${post.id}`;
  const shareText = `"${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}" by ${post.user.name}`;

  const handleShareToTimeline = async () => {
    setIsSharing(true);
    try {
      // API call to share post
      await fetch('/api/posts/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          comment: shareComment
        })
      });

      // Emit Socket.io event for real-time updates
      if (user && isConnected) {
        emitShare({
          memoryId: String(post.id),
          userId: String(user.id),
          username: user.username || user.name,
          memoryOwnerId: String(post.user.id)
        });
      }

      toast({
        title: "Shared successfully",
        description: shareComment ? "Post shared with your comment" : "Post shared to your timeline",
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

  const handleSocialShare = (platform: SocialPlatform) => {
    setSelectedPlatform(platform.name);
    const shareUrl = platform.shareUrl(postUrl, shareText);
    
    // Track share event
    if (user && isConnected) {
      emitShare({
        memoryId: String(post.id),
        userId: String(user.id),
        username: user.username || user.name,
        memoryOwnerId: String(post.user.id)
      });
    }
    
    // Open in new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Show success feedback
    setTimeout(() => {
      toast({
        title: `Shared to ${platform.name}`,
        description: "Opening share dialog...",
      });
      setSelectedPlatform(null);
    }, 500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setLinkCopied(true);
      
      // Track copy event
      if (user && isConnected) {
        emitShare({
          memoryId: String(post.id),
          userId: String(user.id),
          username: user.username || user.name,
          memoryOwnerId: String(post.user.id)
        });
      }
      
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setLinkCopied(false), 3000);
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
      size="md"
      variant="ocean"
      animationType="scale"
     
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 mt-ocean-gradient rounded-xl">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mt-ocean-text">
              Share Memory
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Post Preview */}
        <div className="glassmorphic p-4 rounded-xl mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full mt-ocean-gradient flex items-center justify-center text-white font-bold">
              {post.user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {post.user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">
                @{post.user.username}
              </p>
              <p className="text-gray-700 dark:text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                {post.content}
              </p>
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt="Post media" 
                  className="mt-3 rounded-lg max-h-48 object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Add Comment Section */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300 mb-2 block">
            Add your thoughts (optional)
          </label>
          <textarea
            value={shareComment}
            onChange={(e) => setShareComment(e.target.value)}
            placeholder="Say something about this memory..."
            className="w-full px-4 py-3 glassmorphic rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            rows={3}
          />
        </div>

        {/* Share to Timeline Button */}
        <MTButton
          onClick={handleShareToTimeline}
          disabled={isSharing}
          loading={isSharing}
          variant="primary"
          fullWidth
          icon={Share2}
          className="mb-6 mt-ocean-gradient"
         
        >
          Share to My Timeline
        </MTButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">
              Or share via
            </span>
          </div>
        </div>

        {/* Social Media Platforms */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {socialPlatforms.map((platform) => (
            <motion.button
              key={platform.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialShare(platform)}
              className={`p-3 rounded-xl ${platform.bgColor} transition-all duration-200 flex flex-col items-center gap-2 group`}
              data-testid={`share-${platform.name.toLowerCase()}`}
            >
              <AnimatePresence mode="wait">
                {selectedPlatform === platform.name ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className={`w-6 h-6 ${platform.color}`} />
                  </motion.div>
                ) : (
                  <platform.icon className={`w-6 h-6 ${platform.color} group-hover:scale-110 transition-transform`} />
                )}
              </AnimatePresence>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-600 dark:text-gray-300">
                {platform.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={postUrl}
              readOnly
              className="flex-1 px-4 py-3 glassmorphic rounded-xl text-sm text-gray-700 dark:text-gray-600 dark:text-gray-300"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="p-3 mt-ocean-gradient rounded-xl text-white transition-all duration-200"
             
            >
              <AnimatePresence mode="wait">
                {linkCopied ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                  >
                    <Link className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          {linkCopied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 dark:text-green-400 mt-2"
            >
              Link copied to clipboard!
            </motion.p>
          )}
        </div>

        {/* Socket Connection Status */}
        {!isConnected && (
          <div className="mt-4 text-xs text-orange-500 dark:text-orange-400 text-center">
            Real-time share tracking unavailable
          </div>
        )}
      </div>
    </MTModalBase>
  );
}