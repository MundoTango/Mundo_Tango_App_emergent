/**
 * CODE CHANGE CARD - Inline diff viewer for chat messages
 * MB.MD SIMULTANEOUS - Mr Blue + Vibe Coding Integration
 * 
 * Chat-optimized version of DiffPreviewCard
 * Smaller, focused, inline in conversation flow
 * 
 * Created: October 23, 2025
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, FileCode } from 'lucide-react';

interface CodeChangeCardProps {
  filePath: string;
  diff: string;
  // ⚠️ FIX (Oct 26): Removed onApply/onReject - changes auto-queue to SAVE button
  // onApply: () => Promise<void>;
  // onReject: () => void;
  // isApplying?: boolean;
}

export function CodeChangeCard({
  filePath,
  diff
}: CodeChangeCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // ⚠️ FIX (Oct 26): Removed Apply/Reject handlers
  // Changes now auto-queue to main SAVE button via VisualEditorContext
  // No need for inline "Apply" button - confusing UX

  // Parse diff to highlight additions/deletions
  const renderDiff = (diffString: string) => {
    const lines = diffString.split('\n');
    return lines.map((line, idx) => {
      let className = 'text-gray-300';
      let prefix = '';

      if (line.startsWith('+')) {
        className = 'text-green-400 bg-green-500/10';
        prefix = '+ ';
      } else if (line.startsWith('-')) {
        className = 'text-red-400 bg-red-500/10';
        prefix = '- ';
      } else if (line.startsWith('@@')) {
        className = 'text-cyan-400 font-bold';
      }

      return (
        <div key={idx} className={`px-2 ${className}`}>
          {prefix}{line}
        </div>
      );
    });
  };

  return (
    <Card 
      className="mt-2 border border-teal-500/30 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm overflow-hidden"
      data-testid="code-change-card"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-800/80 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-teal-400" />
          <code className="text-xs font-mono text-gray-300">{filePath}</code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          data-testid="button-toggle-diff"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>

      {/* Diff Content */}
      {isExpanded && (
        <>
          <div className="bg-gray-900 p-3 max-h-64 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre">
              {renderDiff(diff)}
            </pre>
          </div>

          {/* ⚠️ FIX (Oct 26): Removed Apply/Reject buttons */}
          {/* Changes auto-queue to main SAVE button - no inline actions needed */}
          <div className="px-3 py-2 bg-gray-800/80 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              💡 This change is queued. Click <span className="font-semibold text-teal-400">SAVE</span> (top right) to apply.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
