/**
 * ESA LIFE CEO 61x21 - Post Edit Creator Dialog
 * Layer 7 & 23: Unified post editing using BeautifulPostCreator
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
import { queryClient } from '@lib/queryClient';

interface PostEditCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: number;
    content: string;
    location?: string;
    visibility?: 'public' | 'friends' | 'private';
    hashtags?: string[];
    media?: Array<{ url: string; type: string; }>;
  };
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export function PostEditCreatorDialog({ 
  open, 
  onOpenChange, 
  post,
  user 
}: PostEditCreatorDialogProps) {
  
  const handleEditComplete = () => {
    // ESA Layer 7: Invalidate cache to refresh feed with updated post
    queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    queryClient.invalidateQueries({ queryKey: [`/api/post/${post.id}`] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
        <BeautifulPostCreator
          editMode={true}
          existingPost={post}
          onEditComplete={handleEditComplete}
          user={user}
          context={{ type: 'feed' }}
        />
      </DialogContent>
    </Dialog>
  );
}