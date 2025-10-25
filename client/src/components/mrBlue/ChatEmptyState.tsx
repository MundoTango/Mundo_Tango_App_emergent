/**
 * STREAM 1: Chat Empty State
 * MB.MD SIMULTANEOUS Build - October 25, 2025
 * Clean minimal interface - no prompts per user request
 */

import { Sparkles } from 'lucide-react';

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export function ChatEmptyState({ onPromptClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8" data-testid="chat-empty-state">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-12 w-12 text-[var(--mrblue-teal)]" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--mrblue-teal)] to-[var(--mrblue-cyan)] bg-clip-text text-transparent">
          Mr Blue
        </h1>
      </div>
      
      {/* Subtitle */}
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
        Your autonomous coding companion
      </p>
      
      {/* Clean instruction */}
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-8 text-center">
        Type a message below to start building
      </p>
    </div>
  );
}
