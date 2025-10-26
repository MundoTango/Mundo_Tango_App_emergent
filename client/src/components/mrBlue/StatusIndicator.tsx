/**
 * AGENT #144 (UX/A11y): Enhanced Status Indicator
 * 
 * Replit-style status indicator with stop button
 * Shows: submitted → streaming → ready → error states
 * Research: docs/research/UX_PATTERNS_RESEARCH.md
 */

import { Loader2, StopCircle, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypingIndicator } from './TypingIndicator';

export type StatusType = 'idle' | 'submitted' | 'streaming' | 'ready' | 'error';

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  toolStatus?: string;
  onStop?: () => void;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  message, 
  toolStatus, 
  onStop,
  className = ''
}: StatusIndicatorProps) {
  // Show nothing when idle
  if (status === 'idle') return null;

  return (
    <div className={`space-y-2 ${className}`} data-testid="status-indicator">
      {/* Main Status */}
      {status === 'submitted' && (
        <TypingIndicator message={message || "Mr Blue is thinking..."} />
      )}

      {status === 'streaming' && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100 truncate">
              {message || "Generating response..."}
            </span>
          </div>
          {onStop && (
            <Button
              onClick={onStop}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-8 px-3 hover:bg-cyan-100 dark:hover:bg-cyan-800"
              data-testid="button-stop-generation"
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
        </div>
      )}

      {status === 'ready' && (
        <div 
          className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in duration-300"
          data-testid="status-ready"
        >
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-900 dark:text-green-100">
            {message || "Ready"}
          </span>
        </div>
      )}

      {status === 'error' && (
        <div 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          data-testid="status-error"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-900 dark:text-red-100">
            {message || "An error occurred"}
          </span>
        </div>
      )}

      {/* Tool Status (sub-indicator) */}
      {toolStatus && status === 'streaming' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm animate-pulse">
          <span className="text-xl" aria-hidden="true">🔧</span>
          <span className="text-blue-800 dark:text-blue-200">{toolStatus}</span>
        </div>
      )}
    </div>
  );
}
