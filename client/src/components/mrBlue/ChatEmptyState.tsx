/**
 * STREAM 1: Chat Empty State
 * ChatGPT-style empty state with tango-specific suggested prompts
 * MB.MD SIMULTANEOUS Build - October 23, 2025
 */

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface SuggestedPrompt {
  icon: string;
  text: string;
  category: string;
}

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

const suggestedPrompts: SuggestedPrompt[] = [
  {
    icon: '🎨',
    text: 'Help me style this button with MT Ocean colors',
    category: 'Visual Editor'
  },
  {
    icon: '🐛',
    text: 'Debug this component and explain the issue',
    category: 'Code Review'
  },
  {
    icon: '🚀',
    text: 'Deploy my changes to production',
    category: 'Git & Deploy'
  },
  {
    icon: '🎵',
    text: 'Create a new tango event this weekend',
    category: 'Mundo Tango'
  },
  {
    icon: '📊',
    text: 'Show me platform health analytics',
    category: 'Database'
  },
  {
    icon: '💬',
    text: 'Search recent memories about tango',
    category: 'Search'
  }
];

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
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
        Your AI companion for Mundo Tango development
      </p>
      
      {/* Suggested Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {suggestedPrompts.map((prompt, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-all hover:border-[var(--mrblue-teal)] hover:shadow-lg hover:shadow-[var(--mrblue-teal)]/10 group"
            onClick={() => onPromptClick(prompt.text)}
            data-testid={`prompt-card-${index}`}
          >
            <CardContent className="p-4">
              {/* Icon */}
              <div className="text-3xl mb-3">{prompt.icon}</div>
              
              {/* Prompt Text */}
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[var(--mrblue-teal)] transition-colors">
                {prompt.text}
              </p>
              
              {/* Category Badge */}
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {prompt.category}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Helper Text */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-8 text-center">
        Click a prompt to get started, or type your own message below
      </p>
    </div>
  );
}
