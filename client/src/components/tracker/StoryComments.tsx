// ESA Agent #65: Story Comments Component
// Reuses postComments pattern with rich text, @mentions, attachments, threading

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Paperclip, AtSign, Reply, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type Comment = {
  id: number;
  storyId: number;
  userId: number;
  comment: string;
  parentCommentId: number | null;
  attachments: any[];
  mentions: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
};

interface StoryCommentsProps {
  storyId: number;
}

export function StoryComments({ storyId }: StoryCommentsProps) {
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: commentsData, isLoading } = useQuery<{ success: boolean; data: Comment[] }>({
    queryKey: ['/api/tracker/stories', storyId, 'comments'],
  });

  const comments = commentsData?.data || [];

  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { comment: string; parentCommentId?: number | null; mentions?: string[] }) => {
      return apiRequest(`/api/tracker/stories/${storyId}/comments`, 'POST', commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/stories', storyId, 'comments'] });
      setCommentText('');
      setReplyTo(null);
      toast({ title: 'Comment added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add comment', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!commentText.trim()) return;

    // Extract @mentions from comment text
    const mentionRegex = /@([\w-]+)/g;
    const mentions = [...commentText.matchAll(mentionRegex)].map(match => match[1]);

    createCommentMutation.mutate({
      comment: commentText,
      parentCommentId: replyTo,
      mentions: mentions.length > 0 ? mentions : undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  // Group comments by parent/child
  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const getReplies = (parentId: number) => comments.filter(c => c.parentCommentId === parentId);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mt-4'}`} data-testid={`comment-${comment.id}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-turquoise-400/20 to-ocean-500/20 text-turquoise-300 text-xs">
          U{comment.userId}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white">User {comment.userId}</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">Edited</Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
            {comment.comment}
          </p>

          {comment.mentions && comment.mentions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {comment.mentions.map((mention, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-turquoise-500/10 text-turquoise-300 border-turquoise-500/20">
                  <AtSign className="h-3 w-3 mr-1" />
                  {mention}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2 ml-3">
          <button
            onClick={() => setReplyTo(comment.id)}
            className="text-xs text-gray-400 hover:text-turquoise-300 transition-colors flex items-center gap-1"
            data-testid={`button-reply-${comment.id}`}
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
        </div>

        {/* Nested Replies */}
        {getReplies(comment.id).map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply={true} />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-turquoise-300" />
          <h3 className="text-lg font-semibold text-white">Comments</h3>
        </div>
        <p className="text-sm text-gray-400">Loading comments...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-turquoise-300" />
        <h3 className="text-lg font-semibold text-white">Comments</h3>
        <Badge variant="outline" className="ml-auto text-xs border-gray-600">
          {comments.length}
        </Badge>
      </div>

      {/* Comment Input */}
      <div className="mb-6">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-turquoise-300">Replying to comment</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyTo(null)}
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
        
        <div className="relative">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Write a comment... (Use @username to mention, Ctrl+Enter to send)"
            className="min-h-[100px] bg-slate-900/50 border-gray-700 text-white placeholder:text-gray-500 pr-24"
            data-testid="textarea-comment"
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-turquoise-300"
              title="Add attachment"
              disabled
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-turquoise-300"
              title="Mention someone"
              onClick={() => setCommentText(commentText + '@')}
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button
            onClick={handleSubmit}
            disabled={!commentText.trim() || createCommentMutation.isPending}
            className="bg-gradient-to-r from-turquoise-500 to-ocean-500 hover:from-turquoise-600 hover:to-ocean-600"
            data-testid="button-submit-comment"
          >
            <Send className="h-4 w-4 mr-2" />
            {createCommentMutation.isPending ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-1">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          topLevelComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </GlassCard>
  );
}
