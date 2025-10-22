/**
 * REPLIT GIT INTEGRATION
 * Stream G: Native Replit Git UI integration
 * Opens Replit's Git pane + shows git status via shell commands
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, GitBranch, RefreshCw, Loader2, FileText } from 'lucide-react';

interface GitFileChange {
  status: string;
  path: string;
}

interface GitStatusResponse {
  branch: string;
  modifiedFiles: GitFileChange[];
  ahead: number;
  behind: number;
}

export function ReplitGitIntegration() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Git status via real backend API (Stream C - Oct 22, 2025)
  const { data: gitStatus, isLoading, refetch } = useQuery<GitStatusResponse>({
    queryKey: ['/api/git/status', refreshKey],
    queryFn: async () => {
      const res = await fetch('/api/git/status', { credentials: 'include' });
      if (!res.ok) throw new Error(`Git status failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5s
  });

  const openReplitGitPane = () => {
    // Open Replit's native Git pane
    // Note: This opens in the same workspace, Replit handles the UI
    window.open('https://replit.com/@workspace/git', '_blank');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status.trim()) {
      case 'M': return 'text-yellow-600'; // Modified
      case 'A': return 'text-green-600';  // Added
      case 'D': return 'text-red-600';    // Deleted
      case '??': return 'text-blue-600';  // Untracked
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.trim()) {
      case 'M': return 'Modified';
      case 'A': return 'Added';
      case 'D': return 'Deleted';
      case '??': return 'Untracked';
      default: return status;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-500" />
              Git Status
            </div>
            {gitStatus && (
              <div className="text-sm font-normal text-gray-600">
                Branch: <span className="font-mono font-medium">{gitStatus.branch}</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Manage your Git workflow with Replit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                try {
                  const res = await fetch('/api/git/push', {
                    method: 'POST',
                    credentials: 'include'
                  });
                  if (!res.ok) throw new Error('Push failed');
                  alert('✅ Syncing to GitHub...');
                  handleRefresh();
                } catch (error) {
                  alert('❌ Sync failed. Please try again.');
                }
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              data-testid="button-sync-github"
            >
              <GitBranch className="w-4 h-4" />
              Sync to GitHub
            </Button>
            <Button
              onClick={openReplitGitPane}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-open-replit-git"
            >
              <ExternalLink className="w-4 h-4" />
              Open Replit Git Pane
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              data-testid="button-refresh-git-status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Modified Files */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
            </div>
          ) : gitStatus?.modifiedFiles && gitStatus.modifiedFiles.length > 0 ? (
            <div>
              <div className="text-sm font-medium mb-2">
                Changed Files ({gitStatus.modifiedFiles.length})
              </div>
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {gitStatus.modifiedFiles.map((file: GitFileChange, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm"
                      data-testid={`git-file-${idx}`}
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className={`font-mono text-xs ${getStatusColor(file.status)}`}>
                        {getStatusLabel(file.status)}
                      </span>
                      <span className="font-mono text-xs flex-1">{file.path}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <GitBranch className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Working tree clean</p>
              <p className="text-xs text-gray-400">No changes to commit</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg text-sm">
            <p className="text-purple-900 dark:text-purple-100">
              💡 <strong>To commit:</strong> Click "Open Replit Git Pane" to use Replit's visual Git interface with AI-powered commit messages.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
