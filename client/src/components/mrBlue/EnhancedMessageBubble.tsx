/**
 * ENHANCED MESSAGE BUBBLE
 * Glassmorphic message bubbles with Aurora Tide gradients
 * MB.MD Track: mrblue-1
 */

import { useState } from 'react';
import { Copy, Edit2, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CodeChangeCard } from './CodeChangeCard';
import type { CodeChange } from '@/lib/vibeApi';

interface MessageAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface EnhancedMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  avatar?: string;
  metadata?: {
    agentMode?: string;
    confidence?: number;
  };
  isStreaming?: boolean; // NEW: Show streaming cursor effect
  codeChanges?: CodeChange[]; // 🚀 VIBE CODING: Inline code changes (Oct 23, 2025)
  onApplyCode?: (change: CodeChange) => Promise<void>; // 🚀 Apply code change callback
  onRejectCode?: (change: CodeChange) => void; // 🚀 Reject code change callback
  onCopy?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onRate?: (rating: 'up' | 'down') => void;
}

export default function EnhancedMessageBubble({
  role,
  content,
  timestamp,
  avatar,
  metadata,
  isStreaming = false,
  codeChanges,
  onApplyCode,
  onRejectCode,
  onCopy,
  onEdit,
  onRegenerate,
  onRate
}: EnhancedMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = (value: 'up' | 'down') => {
    setRating(value);
    onRate?.(value);
  };

  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar (Assistant only) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">MB</span>
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl p-4 backdrop-blur-md ${
            isUser
              ? 'bg-gradient-to-br from-cyan-500/90 to-blue-600/90 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 shadow-lg border border-gray-200/50 dark:border-gray-700/50'
          }`}
          data-testid={`message-bubble-${role}`}
        >
          {/* Metadata Badge */}
          {metadata?.agentMode && !isUser && (
            <Badge
              variant="secondary"
              className="mb-2 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300"
            >
              {/* 🔧 FIX: Show friendly model names */}
              {metadata.agentMode === 'all-models' ? 'Multi-Model Consensus' : 
               metadata.agentMode === 'claude-3-sonnet' ? 'Claude 3.5 Sonnet' :
               metadata.agentMode === 'gpt-4o' ? 'GPT-4o' :
               metadata.agentMode === 'gemini-pro' ? 'Gemini Pro' :
               metadata.agentMode}
            </Badge>
          )}

          {/* Content - with streaming cursor effect */}
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {content}
            {isStreaming && (
              <span className="inline-block w-1 h-4 ml-1 bg-cyan-500 animate-pulse" />
            )}
          </div>

          {/* Confidence Score (Assistant only) */}
          {metadata?.confidence && !isUser && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                  style={{ width: `${metadata.confidence}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {metadata.confidence}% confident
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isUser ? 'text-cyan-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {timestamp}
          </div>
        </div>

        {/* Message Actions (visible on hover) */}
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleCopy}
              data-testid="button-copy-message"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onRegenerate}
                data-testid="button-regenerate"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            
            {onRate && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs ${rating === 'up' ? 'text-green-600' : ''}`}
                  onClick={() => handleRate('up')}
                  data-testid="button-rate-up"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs ${rating === 'down' ? 'text-red-600' : ''}`}
                  onClick={() => handleRate('down')}
                  data-testid="button-rate-down"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )}

        {isUser && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdit}
            data-testid="button-edit-message"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        )}
        
        {/* 🚀 VIBE CODING: Inline code changes (Oct 23, 2025) */}
        {/* ⚠️ FIX (Oct 26): Removed onApply/onReject - changes auto-queue */}
        {codeChanges && codeChanges.length > 0 && (
          <div className="w-full space-y-2">
            {codeChanges.map((change, idx) => (
              <CodeChangeCard
                key={idx}
                filePath={change.filePath}
                diff={change.diff}
              />
            ))}
          </div>
        )}
      </div>

      {/* Avatar (User only) */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {avatar || 'U'}
          </span>
        </div>
      )}
    </div>
  );
}
