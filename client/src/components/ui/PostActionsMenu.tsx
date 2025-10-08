/**
 * ESA LIFE CEO 61x21 - Post Actions Menu
 * Comprehensive post actions with edit/delete for authors and report for non-authors
 */

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Flag, 
  Share2, 
  Bookmark, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  UserX,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PostActionsMenuProps {
  post: {
    id: number;
    userId: number;
    content: string;
    visibility?: 'public' | 'friends' | 'private';
    user: {
      id: number;
      name: string;
      username: string;
    };
  };
  onEdit?: (post: any) => void;
  onShare?: (post: any) => void;
}

export function PostActionsMenu({ post, onEdit, onShare }: PostActionsMenuProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // ESA Layer 7: Handle both post.userId and post.user.id for ownership check
  const postOwnerId = post.userId || post.user?.id;
  const isAuthor = user?.id && postOwnerId && user.id === postOwnerId;
  
  // ESA Debug: Log ownership check details
  if (process.env.NODE_ENV === 'development') {
    console.log('[ESA PostActionsMenu] Ownership check:', {
      currentUserId: user?.id,
      postUserId: post.userId,
      postUserId_alt: post.user?.id,
      isAuthor,
      postId: post.id,
      userName: user?.name,
      postAuthorName: post.user?.name
    });
  }

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/posts/${post.id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Report post mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reason }: { reason: string }) => {
      return apiRequest('/api/reports', {
        method: 'POST',
        body: {
          type: 'post',
          targetId: post.id,
          reason: reason,
          description: `Reported post by ${post.user.name} (@${post.user.username})`
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for reporting this content. Our team will review it.",
      });
      setShowReportDialog(false);
      setReportReason('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/users/${post.userId}/block`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "User blocked",
        description: `You will no longer see posts from ${post.user.name}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Post link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSavePost = async () => {
    try {
      await apiRequest('/api/saved-posts', {
        method: 'POST',
        body: { postId: post.id }
      });
      toast({
        title: "Post saved",
        description: "Post has been saved to your collection.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const reportReasons = [
    'Spam or misleading content',
    'Harassment or bullying',
    'Inappropriate content',
    'Copyright infringement',
    'Violence or dangerous content',
    'Hate speech',
    'Other'
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0 hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-200 rounded-full transition-all duration-200"
           data-testid="button-h-10">
            <MoreVertical className="h-5 w-5 text-gray-700 hover:text-indigo-600 dark:text-neutral-600 dark:text-neutral-300" />
            <span className="sr-only">Post options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isAuthor ? (
            // Author actions
            <>
              <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                console.log('[ESA FRAMEWORK] Edit post clicked in PostActionsMenu', {
                  timestamp: new Date().toISOString(),
                  postId: post.id,
                  postContent: post.content?.substring(0, 50),
                  hasOnEdit: !!onEdit,
                  onEditType: typeof onEdit,
                  onEditFunction: onEdit?.toString()?.substring(0, 100)
                });
                console.log('[ESA FRAMEWORK] About to call onEdit callback...');
                if (onEdit) {
                  console.log('[ESA FRAMEWORK] Calling onEdit with post:', post);
                  onEdit(post);
                  console.log('[ESA FRAMEWORK] onEdit callback called successfully');
                } else {
                  console.error('[ESA FRAMEWORK ERROR] No onEdit callback provided to PostActionsMenu!');
                  alert('ESA Framework Violation: Edit functionality not properly configured. The rich text editor (react-quill) must be used for all edit operations.');
                }
              }}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-600">Delete post</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* ESA 61x21: Removed duplicate "Share post" and "Copy link" - already available via Share button */}
              <DropdownMenuItem onClick={handleSavePost}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save post
              </DropdownMenuItem>
              {post.visibility && (
                <DropdownMenuItem disabled>
                  {post.visibility === 'public' ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Public post
                    </>
                  ) : post.visibility === 'friends' ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Friends only
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Private post
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </>
          ) : (
            // Non-author actions
            <>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* ESA 61x21: Removed duplicate "Share post" and "Copy link" - already available via Share button */}
              <DropdownMenuItem onClick={handleSavePost}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-red-600">Safety</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="mr-2 h-4 w-4 text-orange-500" />
                <span className="text-orange-600">Report post</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => blockUserMutation.mutate()}>
                <UserX className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-600">Block {post.user.name}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} data-testid="link-element">
        <AlertDialogContent data-testid="link-element">
          <AlertDialogHeader data-testid="link-element">
            <AlertDialogTitle data-testid="link-element">Delete this post?</AlertDialogTitle>
            <AlertDialogDescription data-testid="link-element">
              This action cannot be undone. This will permanently delete your post and remove it from all feeds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-testid="link-element">
            <AlertDialogCancel data-testid="link-element">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() = data-testid="link-element"> deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog} data-testid="link-element">
        <AlertDialogContent data-testid="link-element">
          <AlertDialogHeader data-testid="link-element">
            <AlertDialogTitle data-testid="link-element">Report this post</AlertDialogTitle>
            <AlertDialogDescription data-testid="link-element">
              Help us understand what's happening with this post. What issue are you reporting?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) = data-testid="input-element"> setReportReason(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 dark:border-neutral-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-neutral-600 dark:text-neutral-300">{reason}</span>
                </label>
              ))}
            </div>
          </div>
          <AlertDialogFooter data-testid="link-element">
            <AlertDialogCancel onClick={() = data-testid="link-element"> setReportReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() = data-testid="link-element"> reportMutation.mutate({ reason: reportReason })}
              disabled={!reportReason || reportMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}