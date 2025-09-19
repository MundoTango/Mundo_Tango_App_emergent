/**
 * ESA LIFE CEO 61×21 - Modern Edit Memory Modal
 * Layer 7 & 23: Uses BeautifulPostCreator for consistent UI/UX
 * 
 * This component wraps BeautifulPostCreator in edit mode to provide
 * a consistent editing experience across all post/memory operations.
 */

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: any;
  onSave: (id: number, data: any) => void;
}

export default function ModernEditMemoryModal({ isOpen, onClose, memory, onSave }: EditMemoryModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (!isOpen || !memory) return null;

  // Transform memory data to match BeautifulPostCreator's expected format
  const existingPost = {
    id: memory.id,
    content: memory.content || '',
    location: memory.location,
    visibility: memory.isPublic ? 'public' as const : 'private' as const,
    hashtags: memory.hashtags || [],
    media: memory.imageUrl || memory.videoUrl ? [
      {
        url: memory.imageUrl || memory.videoUrl,
        type: memory.videoUrl ? 'video' : 'image'
      }
    ] : []
  };

  const handleEditComplete = () => {
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    queryClient.invalidateQueries({ queryKey: [`/api/posts/${memory.id}`] });
    
    // Close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
        <BeautifulPostCreator
          editMode={true}
          existingPost={existingPost}
          onEditComplete={handleEditComplete}
          user={user ? {
            id: user.id,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage || undefined
          } : undefined}
          context={{ type: 'memory' }}
        />
      </DialogContent>
    </Dialog>
  );
}