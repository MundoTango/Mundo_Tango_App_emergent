// ESA Agent #67: GitHub Integration UI Components
// Shows GitHub links, badges, and sync buttons for stories/tasks

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink, GitBranch, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface GitHubIssueLinkProps {
  issueNumber?: number | null;
  issueUrl?: string | null;
  repoName?: string | null;
  syncedAt?: string | null;
}

export function GitHubIssueLink({ issueNumber, issueUrl, repoName, syncedAt }: GitHubIssueLinkProps) {
  if (!issueNumber || !issueUrl) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg" data-testid="github-issue-link">
      <Github className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline flex items-center gap-1"
          data-testid="link-github-issue"
        >
          {repoName}#{issueNumber}
          <ExternalLink className="h-3 w-3" />
        </a>
        {syncedAt && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(syncedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

interface GitHubPRBadgeProps {
  prNumber?: number | null;
  prUrl?: string | null;
  branch?: string | null;
  syncedAt?: string | null;
}

export function GitHubPRBadge({ prNumber, prUrl, branch, syncedAt }: GitHubPRBadgeProps) {
  if (!prNumber || !prUrl) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg" data-testid="github-pr-badge">
      <GitBranch className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline flex items-center gap-1"
          data-testid="link-github-pr"
        >
          PR #{prNumber} {branch && `(${branch})`}
          <ExternalLink className="h-3 w-3" />
        </a>
        {syncedAt && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(syncedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

interface SyncToGitHubButtonProps {
  storyId: number;
  storyKey: string;
  existingIssueNumber?: number | null;
}

export function SyncToGitHubButton({ storyId, storyKey, existingIssueNumber }: SyncToGitHubButtonProps) {
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/tracker/stories/${storyId}/sync-github`, {
        method: 'POST',
        body: { owner, repo },
      });
    },
    onSuccess: (response: any) => {
      const data = response?.data;
      toast({
        title: 'Story synced to GitHub',
        description: `Created issue #${data?.issueNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tracker/stories/${storyId}`] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Sync failed',
        description: error.message || 'Failed to sync story to GitHub',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-sync-github">
          <Github className="h-4 w-4 mr-2" />
          {existingIssueNumber ? 'Update GitHub Issue' : 'Create GitHub Issue'}
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-sync-github">
        <DialogHeader>
          <DialogTitle>
            {existingIssueNumber ? 'Update GitHub Issue' : 'Create GitHub Issue'}
          </DialogTitle>
          <DialogDescription>
            {existingIssueNumber
              ? `Update GitHub issue #${existingIssueNumber} with latest story data`
              : `Create a new GitHub issue for story ${storyKey}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="owner">Repository Owner</Label>
            <Input
              id="owner"
              placeholder="username or organization"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              data-testid="input-repo-owner"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo">Repository Name</Label>
            <Input
              id="repo"
              placeholder="repository-name"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              data-testid="input-repo-name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={!owner || !repo || syncMutation.isPending}
            data-testid="button-confirm-sync"
          >
            {syncMutation.isPending ? 'Syncing...' : existingIssueNumber ? 'Update Issue' : 'Create Issue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LinkPRButtonProps {
  taskId: number;
  existingPRNumber?: number | null;
}

export function LinkPRButton({ taskId, existingPRNumber }: LinkPRButtonProps) {
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [prNumber, setPRNumber] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/tracker/tasks/${taskId}/link-pr`, {
        method: 'POST',
        body: { owner, repo, prNumber: parseInt(prNumber) },
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Task linked to PR',
        description: `Linked to PR #${prNumber}`,
      });
      // Invalidate both task and parent story queries
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/stories'] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Link failed',
        description: error.message || 'Failed to link task to PR',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-link-pr">
          <GitBranch className="h-4 w-4 mr-2" />
          {existingPRNumber ? 'Update PR Link' : 'Link to PR'}
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-link-pr">
        <DialogHeader>
          <DialogTitle>Link Task to Pull Request</DialogTitle>
          <DialogDescription>
            Link this task to an existing GitHub Pull Request
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pr-owner">Repository Owner</Label>
            <Input
              id="pr-owner"
              placeholder="username or organization"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              data-testid="input-pr-owner"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-repo">Repository Name</Label>
            <Input
              id="pr-repo"
              placeholder="repository-name"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              data-testid="input-pr-repo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-number">Pull Request Number</Label>
            <Input
              id="pr-number"
              type="number"
              placeholder="123"
              value={prNumber}
              onChange={(e) => setPRNumber(e.target.value)}
              data-testid="input-pr-number"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => linkMutation.mutate()}
            disabled={!owner || !repo || !prNumber || linkMutation.isPending}
            data-testid="button-confirm-link"
          >
            {linkMutation.isPending ? 'Linking...' : 'Link PR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
