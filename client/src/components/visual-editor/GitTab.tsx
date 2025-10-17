/**
 * GIT TAB - Git Integration Panel
 * MB.MD Track 5: Git status, commits, branches
 * 
 * Features: Modified files, commit interface, branch management
 */

import { useState } from 'react';
import { GitBranch, GitCommit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function GitTab() {
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');
  
  // Mock data - in production, fetch from git API
  const modifiedFiles = [
    'client/src/components/visual-editor/TabSystem.tsx',
    'client/src/components/visual-editor/PreviewTab.tsx'
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Git Status</h3>
        <Button variant="outline" size="sm" data-testid="button-git-refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <GitBranch className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700 dark:text-gray-300">Branch:</span>
          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            {branch}
          </code>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Modified Files ({modifiedFiles.length})
          </p>
          <div className="space-y-1">
            {modifiedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs"
              >
                <span className="text-amber-600 dark:text-amber-400 font-mono">M</span>
                <span className="text-gray-700 dark:text-gray-300 truncate">{file}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Commit Message
          </label>
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Visual edit: Update components"
            className="min-h-[80px] resize-none"
            data-testid="textarea-commit-message"
          />
        </div>

        <Button
          disabled={!commitMessage.trim()}
          className="w-full"
          data-testid="button-commit"
        >
          <GitCommit className="w-4 h-4 mr-2" />
          Commit Changes
        </Button>
      </div>

      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">Quick Actions:</p>
        <ul className="space-y-1">
          <li>• Ctrl/Cmd + Enter - Commit changes</li>
          <li>• Ctrl/Cmd + P - Push to remote</li>
          <li>• Ctrl/Cmd + R - Refresh status</li>
        </ul>
      </div>
    </div>
  );
}
