/**
 * STREAM 3: Diff Preview Modal
 * Side-by-side code diff viewer with accept/reject actions
 * MB.MD SIMULTANEOUS Build - October 23, 2025
 */

import ReactDiffViewer from 'react-diff-viewer-continued';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode, Check, X } from 'lucide-react';

interface DiffPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  oldCode: string;
  newCode: string;
  onAccept: () => void;
  onReject: () => void;
  isApplying?: boolean;
}

export function DiffPreviewModal({
  isOpen,
  onClose,
  filePath,
  oldCode,
  newCode,
  onAccept,
  onReject,
  isApplying = false
}: DiffPreviewModalProps) {
  // Detect language from file extension
  const getLanguage = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      css: 'css',
      json: 'json',
      html: 'markup',
      md: 'markdown'
    };
    return langMap[ext || ''] || 'javascript';
  };

  const language = getLanguage(filePath);

  // Syntax highlighting renderer
  const renderContent = (str: string) => {
    try {
      const highlighted = Prism.highlight(
        str,
        Prism.languages[language] || Prism.languages.javascript,
        language
      );
      return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    } catch (error) {
      // Fallback to plain text if highlighting fails
      return <span>{str}</span>;
    }
  };

  // Calculate diff stats
  const getStats = () => {
    const oldLines = oldCode.split('\n').length;
    const newLines = newCode.split('\n').length;
    const diff = newLines - oldLines;
    
    return {
      additions: diff > 0 ? diff : 0,
      deletions: diff < 0 ? Math.abs(diff) : 0,
      changes: oldLines
    };
  };

  const stats = getStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileCode className="h-5 w-5 text-[var(--mrblue-teal)]" />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                Review Changes
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filePath}
              </DialogDescription>
            </div>
            
            {/* Stats Badges */}
            <div className="flex gap-2">
              {stats.additions > 0 && (
                <Badge variant="outline" className="bg-[var(--diff-added-bg)] text-[var(--diff-added-text)] border-none">
                  +{stats.additions}
                </Badge>
              )}
              {stats.deletions > 0 && (
                <Badge variant="outline" className="bg-[var(--diff-removed-bg)] text-[var(--diff-removed-text)] border-none">
                  -{stats.deletions}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {/* Diff Display */}
        <div className="flex-1 overflow-auto">
          <ReactDiffViewer
            oldValue={oldCode}
            newValue={newCode}
            splitView={true}
            useDarkTheme={document.documentElement.classList.contains('dark')}
            leftTitle="Before"
            rightTitle="After"
            showDiffOnly={false}
            renderContent={renderContent}
            styles={{
              variables: {
                dark: {
                  diffViewerBackground: '#1F2937',
                  diffViewerColor: '#E5E7EB',
                  addedBackground: 'var(--diff-added-bg)',
                  addedColor: 'var(--diff-added-text)',
                  removedBackground: 'var(--diff-removed-bg)',
                  removedColor: 'var(--diff-removed-text)',
                  wordAddedBackground: 'var(--diff-added-line-bg)',
                  wordRemovedBackground: 'var(--diff-removed-line-bg)',
                  addedGutterBackground: 'var(--diff-added-bg)',
                  removedGutterBackground: 'var(--diff-removed-bg)',
                  gutterBackground: 'var(--diff-gutter-bg)',
                  gutterColor: 'var(--diff-gutter-text)',
                  codeFoldGutterBackground: '#4B5563',
                  codeFoldBackground: '#374151',
                  emptyLineBackground: '#1F2937',
                  codeFoldContentColor: '#9CA3AF',
                },
                light: {
                  diffViewerBackground: '#FFFFFF',
                  diffViewerColor: '#1F2937',
                  addedBackground: '#D1FAE5',
                  addedColor: '#065F46',
                  removedBackground: '#FEE2E2',
                  removedColor: '#991B1B',
                  wordAddedBackground: '#A7F3D0',
                  wordRemovedBackground: '#FECACA',
                  addedGutterBackground: '#D1FAE5',
                  removedGutterBackground: '#FEE2E2',
                  gutterBackground: '#F3F4F6',
                  gutterColor: '#6B7280',
                  codeFoldGutterBackground: '#E5E7EB',
                  codeFoldBackground: '#F3F4F6',
                  emptyLineBackground: '#FFFFFF',
                  codeFoldContentColor: '#6B7280',
                }
              }
            }}
          />
        </div>
        
        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between w-full">
            {/* Helper Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Review the changes carefully before applying
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isApplying}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20"
                data-testid="button-reject-diff"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={onAccept}
                disabled={isApplying}
                className="bg-[var(--mrblue-teal)] hover:bg-[var(--mrblue-cyan)] text-white"
                data-testid="button-accept-diff"
              >
                <Check className="h-4 w-4 mr-2" />
                {isApplying ? 'Applying...' : 'Accept Changes'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
