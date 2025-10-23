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
import { Check, X, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeChangeCardProps {
  filePath: string;
  diff: string;
  onApply: () => Promise<void>;
  onReject: () => void;
  isApplying?: boolean;
}

export function CodeChangeCard({
  filePath,
  diff,
  onApply,
  onReject,
  isApplying = false
}: CodeChangeCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isApplyingLocal, setIsApplyingLocal] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    setIsApplyingLocal(true);
    try {
      await onApply();
      toast({
        title: 'Changes applied! ✅',
        description: `Updated ${filePath}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to apply changes',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsApplyingLocal(false);
    }
  };

  const handleReject = () => {
    toast({
      title: 'Changes rejected',
      description: 'No modifications were made'
    });
    onReject();
  };

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

          {/* Actions */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 border-t border-gray-700">
            <Button
              size="sm"
              variant="default"
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              onClick={handleApply}
              disabled={isApplying || isApplyingLocal}
              data-testid="button-apply-code"
            >
              <Check className="w-4 h-4 mr-1" />
              {isApplying || isApplyingLocal ? 'Applying...' : 'Apply'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={handleReject}
              disabled={isApplying || isApplyingLocal}
              data-testid="button-reject-code"
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
