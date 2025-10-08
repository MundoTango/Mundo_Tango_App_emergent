import React, { useState } from 'react';
import { Send, User, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { GlassCard } from '@/components/glass/GlassComponents';


interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface CommentsSectionProps {
  postId: number;
  comments: Comment[];
  currentUserId?: number;
  onAddComment: (postId: number, content: string) => void;
  onEditComment?: (commentId: number, content: string) => void;
  onDeleteComment?: (commentId: number) => void;
  isAddingComment?: boolean;
}

export default function ModernCommentsSection({
  postId,
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isAddingComment = false
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showActions, setShowActions] = useState<number | null>(null);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(postId, newComment.trim());
      setNewComment('');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setShowActions(null);
  };

  const handleSaveEdit = (commentId: number) => {
    if (editingContent.trim() && onEditComment) {
      onEditComment(commentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
      setShowActions(null);
    }
  };

  return (
    <GlassCard depth={1} className="rounded-2xl p-4 border border-white/10"
      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 group"
              data-testid={`comment-${comment.id}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.user.profileImage ? (
                  <img
                    src={comment.user.profileImage}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-ocean-400)] to-cyan-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1">
                <div className="bg-[var(--color-surface)] dark:bg-gray-900/5 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-white/40">
                        @{comment.user.username}
                      </span>
                    </div>
                    
                    {/* Actions Menu */}
                    {currentUserId === comment.userId && (
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === comment.id ? null : comment.id)} aria-label="Button"
                          className="p-1 hover:bg-[var(--color-surface)] dark:bg-gray-900/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          data-testid={`button-comment-actions-${comment.id}`}
                        >
                          <MoreVertical className="w-4 h-4 text-white/60" />
                        </button>
                        
                        {showActions === comment.id && (
                          <GlassCard depth={3} className="absolute right-0 top-8 rounded-xl shadow-xl border border-white/20 py-1 z-10">
                            <button
                              onClick={() => handleEditComment(comment)} aria-label="Button"
                              className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--color-surface)] dark:bg-gray-900/10 text-white/80 text-sm w-full text-left"
                              data-testid={`button-edit-comment-${comment.id}`}
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)} aria-label="Button"
                              className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--color-surface)] dark:bg-gray-900/10 text-red-400 text-sm w-full text-left"
                              data-testid={`button-delete-comment-${comment.id}`}
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
                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingContent}
                        onChange={(e) = aria-label="Input field"> setEditingContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(comment.id)}
                        className="flex-1 bg-[var(--color-surface)] dark:bg-gray-900/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-400/50"
                        autoFocus
                        data-testid={`input-edit-comment-${comment.id}`}
                      />
                      <button
                        onClick={() => handleSaveEdit(comment.id)} aria-label="Button"
                        className="px-2 py-1 bg-teal-400/20 hover:bg-teal-400/30 text-teal-400 rounded-lg text-sm"
                        data-testid={`button-save-comment-${comment.id}`}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent('');} aria-label="Button"}
                        className="px-2 py-1 bg-[var(--color-surface)] dark:bg-gray-900/10 hover:bg-[var(--color-surface)] dark:bg-gray-900/20 text-white/60 rounded-lg text-sm"
                        data-testid={`button-cancel-edit-${comment.id}`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-white/80">
                      {comment.content}
                      {comment.isEdited && (
                        <span className="text-xs text-white/40 ml-2">(edited)</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="mt-1 px-3">
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-4 text-white/40 text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) = aria-label="Input field"> setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 bg-[var(--color-surface)] dark:bg-gray-900/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50"
          disabled={isAddingComment}
          data-testid="input-new-comment"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isAddingComment}
          className="px-4 py-2 bg-gradient-to-r from-[var(--color-ocean-400)] to-cyan-600 hover:from-[var(--color-primary)] hover:to-cyan-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          data-testid="button-submit-comment"
         aria-label="Button">
          <Send className="w-4 h-4" />
          {isAddingComment ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}