/**
 * CONVERSATION PERSISTENCE HOOKS
 * React Query hooks for chat projects (Visual Editor mode)
 * 
 * MB.MD Layer #7 (State Management) + Layer #2 (API Structure)
 * October 24, 2025
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatProject {
  id: number;
  name: string;
  description?: string;
  visualEditorMode: boolean;
  lastSelectedElement?: {
    tag: string;
    id?: string;
    className?: string;
    xpath?: string;
    innerHTML?: string;
  };
  lastPreviewPath?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateProjectInput {
  name: string;
  description?: string;
  visualEditorMode?: boolean;
  lastSelectedElement?: any;
  lastPreviewPath?: string;
}

/**
 * Hook to fetch all chat projects (conversations)
 */
export function useChatProjects() {
  return useQuery<ChatProject[]>({
    queryKey: ['/api/chat/projects'],
    queryFn: async () => {
      const res = await fetch('/api/chat/projects', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch chat projects');
      return await res.json();
    },
  });
}

/**
 * Hook to create new chat project
 */
export function useCreateChatProject() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const res = await apiRequest('/api/chat/projects', {
        method: 'POST',
        body: input,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      toast({
        title: 'Conversation Created',
        description: 'New conversation started',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update chat project (e.g., save Visual Editor context)
 */
export function useUpdateChatProject() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateProjectInput> }) => {
      const res = await apiRequest(`/api/chat/projects/${id}`, {
        method: 'PATCH',
        body: data,
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      queryClient.invalidateQueries({ queryKey: [`/api/chat/projects/${variables.id}/messages`] });
    },
  });
}

/**
 * Hook to delete chat project
 */
export function useDeleteChatProject() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/chat/projects/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/projects'] });
      toast({
        title: 'Conversation Deleted',
        description: 'Conversation removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Delete',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get Visual Editor conversations only
 */
export function useVisualEditorConversations() {
  const { data: allProjects, ...rest } = useChatProjects();
  
  const visualEditorProjects = allProjects?.filter(p => p.visualEditorMode) || [];
  
  return {
    data: visualEditorProjects,
    ...rest,
  };
}
