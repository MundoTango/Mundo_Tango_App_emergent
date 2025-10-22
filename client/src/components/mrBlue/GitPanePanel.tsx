/**
 * GIT PANE PANEL
 * Agent #126 - Git Operations Specialist
 * Replit-style Git interface with file diffs, commit, push
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, GitCommit, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface GitStatus {
  branch: string;
  modifiedFiles: Array<{ status: string; path: string }>;
  lastCommit: {
    hash: string;
    author: string;
    message: string;
    timestamp: string;
  };
}

export function GitPanePanel() {
  const { toast } = useToast();
  const [commitMessage, setCommitMessage] = useState('');
  const [generatingMessage, setGeneratingMessage] = useState(false);

  // Fetch Git status
  const { data: gitStatus, isLoading, refetch } = useQuery<GitStatus>({
    queryKey: ['/api/git/status'],
    refetchInterval: 5000 // Auto-refresh every 5s
  });

  // Generate AI commit message
  const generateMessage = async () => {
    setGeneratingMessage(true);
    try {
      const response = await fetch('/api/git/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await response.json();
      setCommitMessage(data.message || data.fallback);
    } catch (error) {
      toast({
        title: 'Failed to generate commit message',
        variant: 'destructive'
      });
    } finally {
      setGeneratingMessage(false);
    }
  };

  // Commit mutation
  const commitMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/git/commit', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Changes committed',
        description: 'Your changes have been committed to Git'
      });
      setCommitMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/git/status'] });
    },
    onError: () => {
      toast({
        title: 'Commit failed',
        variant: 'destructive'
      });
    }
  });

  // Push mutation
  const pushMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/git/push', {
        method: 'POST',
        body: JSON.stringify({ branch: gitStatus?.branch || 'main' })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Pushed to GitHub',
        description: 'Your changes are now on GitHub'
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Push failed',
        description: error.message || 'Failed to push to GitHub',
        variant: 'destructive'
      });
    }
  });

  // Checkpoint mutation (Phase 3 - Stream 1)
  const checkpointMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/git/checkpoint', {
        method: 'POST',
        body: JSON.stringify({ message: 'Auto-checkpoint: Agent work complete' })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Checkpoint created',
        description: 'Workspace saved + Git commit created'
      });
      refetch();
    },
    onError: () => {
      toast({
        title: 'Checkpoint failed',
        variant: 'destructive'
      });
    }
  });

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Commit message required',
        variant: 'destructive'
      });
      return;
    }
    commitMutation.mutate(commitMessage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const hasChanges = (gitStatus?.modifiedFiles.length || 0) > 0;

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-black/30">
      {/* Header */}
      <div className="p-4 border-b border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-600" />
            <span className="font-medium text-sm">{gitStatus?.branch || 'main'}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-git-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modified Files */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold mb-2">
            {hasChanges ? `${gitStatus.modifiedFiles.length} files changed` : 'No changes'}
          </h3>
          
          {gitStatus?.modifiedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/50 rounded text-sm"
              data-testid={`git-file-${idx}`}
            >
              {file.status === 'M' && <span className="text-yellow-600">M</span>}
              {file.status === 'A' && <span className="text-green-600">A</span>}
              {file.status === 'D' && <span className="text-red-600">D</span>}
              <span className="font-mono text-xs truncate">{file.path}</span>
            </div>
          ))}
        </div>

        {/* Last Commit */}
        {gitStatus?.lastCommit && gitStatus.lastCommit.message && (
          <div className="mt-6 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded">
            <div className="flex items-start gap-2">
              <GitCommit className="w-4 h-4 text-cyan-600 mt-1" />
              <div className="flex-1">
                <div className="text-xs font-semibold">{gitStatus.lastCommit.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {gitStatus.lastCommit.author} · {new Date(gitStatus.lastCommit.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Commit Area */}
      {hasChanges && (
        <div className="p-4 border-t border-cyan-200 dark:border-cyan-800 space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message..."
              className="flex-1 min-h-[60px]"
              data-testid="input-commit-message"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={generateMessage}
              disabled={generatingMessage}
              data-testid="button-generate-message"
              title="Generate AI commit message"
            >
              {generatingMessage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-lg">✨</span>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || commitMutation.isPending}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600"
              data-testid="button-commit"
            >
              {commitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Commit
            </Button>
            
            <Button
              onClick={() => pushMutation.mutate()}
              disabled={pushMutation.isPending}
              variant="outline"
              data-testid="button-push"
            >
              {pushMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Push
            </Button>
          </div>

          <Button
            onClick={() => checkpointMutation.mutate()}
            disabled={checkpointMutation.isPending}
            variant="secondary"
            className="w-full"
            data-testid="button-checkpoint"
          >
            {checkpointMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <span className="mr-2">📸</span>
            )}
            Create Checkpoint
          </Button>
        </div>
      )}
    </div>
  );
}
