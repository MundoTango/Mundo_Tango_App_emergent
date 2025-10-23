/**
 * STREAM 3: Quick Commit Button
 * One-click commit with AI-generated message
 * MB.MD SIMULTANEOUS Build - October 23, 2025
 */

import { GitCommit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface GitStatus {
  branch: string;
  modifiedFiles: Array<{ status: string; path: string }>;
  lastCommit?: {
    hash: string;
    message: string;
  };
}

export function QuickCommitButton() {
  const { toast } = useToast();

  // Fetch git status
  const { data: gitStatus } = useQuery<GitStatus>({
    queryKey: ['/api/git/status'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Quick commit mutation
  const quickCommitMutation = useMutation({
    mutationFn: async () => {
      // Generate AI commit message
      const messageResponse: any = await apiRequest('/api/git/generate-message', {
        method: 'POST',
      });
      
      const commitMessage = messageResponse.message || messageResponse.fallback || 'Update: Auto-commit via Mr Blue';
      
      // Commit with generated message
      return await apiRequest('/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message: commitMessage }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Changes committed',
        description: 'Your changes have been saved to Git',
      });
      
      // Refresh git status
      queryClient.invalidateQueries({ queryKey: ['/api/git/status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Commit failed',
        description: error.message || 'Failed to commit changes',
        variant: 'destructive',
      });
    },
  });

  // Don't show button if no files changed
  if (!gitStatus?.modifiedFiles || gitStatus.modifiedFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <Button
        onClick={() => quickCommitMutation.mutate()}
        disabled={quickCommitMutation.isPending}
        className="bg-[var(--mrblue-teal)] hover:bg-[var(--mrblue-cyan)] text-white flex-1"
        data-testid="button-quick-commit"
      >
        {quickCommitMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Committing...
          </>
        ) : (
          <>
            <GitCommit className="h-4 w-4 mr-2" />
            Commit {gitStatus.modifiedFiles.length} change{gitStatus.modifiedFiles.length > 1 ? 's' : ''}
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Cmd+Enter</kbd>
      </p>
    </div>
  );
}
