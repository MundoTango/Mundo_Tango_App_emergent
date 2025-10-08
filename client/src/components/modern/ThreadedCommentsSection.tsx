import React, { useState, useEffect } from 'react';
import { Send, User, MoreVertical, Edit2, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useMemorySocket, useMemoryRealtimeEvents } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/auth-context';

interface Comment {
  id: number | string;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  parentId?: string | null;
  replies?: Comment[];
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface ThreadedCommentsSectionProps {
  postId: number;
  comments: Comment[];
  currentUserId?: number;
  onAddComment: (postId: number, content: string, parentId?: string) => void;
  onEditComment?: (commentId: number | string, content: string) => void;
  onDeleteComment?: (commentId: number | string) => void;
  isAddingComment?: boolean;
}

export default function ThreadedCommentsSection({
  postId,
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isAddingComment = false
}: ThreadedCommentsSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showActions, setShowActions] = useState<number | string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Real-time Socket.io integration
  const { emitComment, emitTyping, isConnected } = useMemorySocket(String(postId), user?.id?.toString());
  const liveUpdates = useMemoryRealtimeEvents();

  // Organize comments into threads
  const threadedComments = React.useMemo(() => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map
    comments.forEach(comment => {
      const id = String(comment.id);
      commentMap.set(id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach(comment => {
      const id = String(comment.id);
      const commentWithReplies = commentMap.get(id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(String(comment.parentId));
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }, [comments]);

  // Handle typing indicators
  useEffect(() => {
    const typingMap = new Map<string, string>();
    liveUpdates.typing.forEach(t => {
      if (t.memoryId === String(postId)) {
        typingMap.set(t.userId, t.username);
      }
    });
    setTypingUsers(typingMap);
  }, [liveUpdates.typing, postId]);

  // Emit typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (user && isConnected) {
      emitTyping(isTyping, user.username || user.name);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(postId, newComment.trim());
      
      // Emit real-time event
      if (user && isConnected) {
        emitComment({
          memoryId: String(postId),
          userId: String(user.id),
          username: user.username || user.name,
          comment: newComment.trim(),
          commentId: `temp-${Date.now()}`,
          memoryOwnerId: String(currentUserId)
        });
      }
      
      setNewComment('');
      handleTyping(false);
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(postId, replyContent.trim(), parentId);
      
      // Emit real-time event
      if (user && isConnected) {
        emitComment({
          memoryId: String(postId),
          userId: String(user.id),
          username: user.username || user.name,
          comment: replyContent.trim(),
          commentId: `temp-reply-${Date.now()}`,
          memoryOwnerId: String(currentUserId)
        });
      }
      
      setReplyContent('');
      setReplyingTo(null);
      handleTyping(false);
    }
  };

  const toggleThread = (commentId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, depth: number = 0): JSX.Element => {
    const isExpanded = expandedThreads.has(String(comment.id));
    const hasReplies = comment.replies && comment.replies.length > 0;
    const commentId = String(comment.id);

    return (
      <motion.div
        key={commentId}
        initial={{ opacity: 0, x: -20 * (depth + 1) }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`${depth > 0 ? 'ml-8 border-l-2 border-cyan-500/20 pl-4' : ''}`}
        data-testid={`comment-${commentId}`}
      >
        <div className="flex gap-3 group mb-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user.profileImage ? (
              <img
                src={comment.user.profileImage}
                alt={comment.user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full mt-ocean-gradient flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            <div className="glassmorphic rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-text)] dark:text-white">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    @{comment.user.username}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    • {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400 italic">(edited)</span>
                  )}
                </div>

                {/* Actions Menu */}
                {currentUserId === comment.userId && (
                  <div className="relative">
                    <button
                      onClick={() = aria-label="Button"> setShowActions(showActions === commentId ? null : commentId)}
                      className="p-1 hover:bg-[var(--color-surface)] dark:bg-gray-900/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      data-testid={`button-comment-actions-${commentId}`}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    {showActions === commentId && (
                      <div className="absolute right-0 mt-2 w-32 bg-[var(--color-surface)] dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
                        <button
                          onClick={() = aria-label="Button"> {
                            setEditingCommentId(commentId);
                            setEditingContent(comment.content);
                            setShowActions(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-700"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() = aria-label="Button"> {
                            onDeleteComment?.(commentId);
                            setShowActions(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Text */}
              {editingCommentId === commentId ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingContent.trim() && onEditComment) {
                    onEditComment(commentId, editingContent.trim());
                    setEditingCommentId(null);
                    setEditingContent('');
                  }
                }}>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-surface)]/50 dark:bg-gray-800/50 rounded-lg resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="px-3 py-1 bg-[var(--color-primary)] text-white rounded-lg text-sm" aria-label="Button">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() = aria-label="Button"> {
                        setEditingCommentId(null);
                        setEditingContent('');
                      }}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-[var(--color-text-secondary)] dark:text-gray-200 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.content}</p>
              )}

              {/* Reply and Thread Actions */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() = aria-label="Button"> setReplyingTo(replyingTo === commentId ? null : commentId)}
                  className="flex items-center gap-1 text-xs text-[var(--color-primary-hover)] hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
                
                {hasReplies && (
                  <button
                    onClick={() = aria-label="Button"> toggleThread(commentId)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--color-text-secondary)] dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
              </div>
            </div>

            {/* Reply Input */}
            {replyingTo === commentId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 ml-8"
              >
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitReply(commentId);
                }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) = aria-label="Input field"> {
                        setReplyContent(e.target.value);
                        handleTyping(e.target.value.length > 0);
                      }}
                      placeholder={`Reply to @${comment.user.username}...`}
                      className="flex-1 px-4 py-2 glassmorphic rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 mt-ocean-gradient text-white rounded-lg disabled:opacity-50"
                     aria-label="Button">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <AnimatePresence>
            {comment.replies!.map(reply => renderComment(reply, depth + 1))}
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  return (
    <div className="glassmorphic rounded-2xl p-6 border border-cyan-500/20" data-testid="comments-section">
      <h3 className="text-lg font-bold text-[var(--color-text)] dark:text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Typing Indicators */}
      {typingUsers.size > 0 && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <div className="flex space-x-1">
            <span className="animate-bounce inline-block w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
            <span className="animate-bounce inline-block w-2 h-2 bg-[var(--color-primary)] rounded-full" style={{ animationDelay: '0.1s' }}></span>
            <span className="animate-bounce inline-block w-2 h-2 bg-[var(--color-primary)] rounded-full" style={{ animationDelay: '0.2s' }}></span>
          </div>
          {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 pr-2">
        <AnimatePresence>
          {threadedComments.map(comment => renderComment(comment))}
        </AnimatePresence>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmitComment} className="mt-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full mt-ocean-gradient flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) = aria-label="Input field"> {
                setNewComment(e.target.value);
                handleTyping(e.target.value.length > 0);
              }}
              onBlur={() => handleTyping(false)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 glassmorphic rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              disabled={isAddingComment}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isAddingComment}
              className="px-4 py-2 mt-ocean-gradient text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
             aria-label="Button">
              <Send className="w-4 h-4" />
              {isAddingComment && <span className="text-xs">Sending...</span>}
            </button>
          </div>
        </div>
      </form>

      {/* Socket Connection Status */}
      {!isConnected && (
        <div className="mt-2 text-xs text-orange-500 dark:text-orange-400">
          Real-time updates unavailable - Connecting...
        </div>
      )}
    </div>
  );
}