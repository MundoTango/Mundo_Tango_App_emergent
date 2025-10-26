/**
 * AGENT #144: Typing Animation Component
 * Minimum 2-second delay for natural conversational feel
 * MB.MD: UX best practices from research
 */

import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  message?: string; // Optional status message
  minDelay?: number; // Minimum delay in milliseconds (default: 2000)
}

export function TypingIndicator({ message = "Mr Blue is thinking...", minDelay = 2000 }: TypingIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Enforce minimum 2-second delay for natural feel
    const timer = setTimeout(() => setIsVisible(true), Math.max(100, minDelay));
    return () => clearTimeout(timer);
  }, [minDelay]);
  
  if (!isVisible) return null;
  
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm max-w-xs">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
        <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '160ms', animationDuration: '1.4s' }} />
        <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '320ms', animationDuration: '1.4s' }} />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>
    </div>
  );
}

/**
 * Status Indicator Component
 * Shows current AI processing state: submitted → streaming → ready → error
 */

type StatusType = 'submitted' | 'streaming' | 'ready' | 'error';

interface StatusIndicatorProps {
  status: StatusType;
  errorMessage?: string;
}

export function StatusIndicator({ status, errorMessage }: StatusIndicatorProps) {
  const statusConfig = {
    submitted: { icon: '📤', text: 'Sending message...', color: 'text-blue-600 dark:text-blue-400' },
    streaming: { icon: '⚡', text: 'Generating response...', color: 'text-teal-600 dark:text-teal-400' },
    ready: { icon: '✅', text: 'Ready', color: 'text-green-600 dark:text-green-400' },
    error: { icon: '❌', text: errorMessage || 'Something went wrong', color: 'text-red-600 dark:text-red-400' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`flex items-center gap-2 text-sm ${config.color}`}>
      <span className="text-base">{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}

/**
 * Error Message Library
 * Varied, helpful error messages with tiered recovery
 */

export const ERROR_MESSAGES = {
  // Level 1: Network/API errors (auto-retry)
  network: [
    "Hmm, I'm having trouble connecting. Let me try again...",
    "Network hiccup! Give me a second to reconnect...",
    "Lost connection for a moment. Reconnecting now...",
  ],
  
  // Level 2: AI model errors (guided assistance)
  modelError: [
    "I'm not sure I understood that correctly. Could you rephrase it?",
    "That's a bit unclear to me. Could you provide more details?",
    "I'm having trouble with that request. Could you try asking differently?",
  ],
  
  // Level 3: Ambiguous requests (offer options)
  ambiguous: [
    "I see a few ways to do that. Which would you prefer?",
    "There are multiple options here. Let me show you the choices...",
    "I can help with that in different ways. What would work best for you?",
  ],
  
  // Level 4: Critical failures (human handoff)
  critical: [
    "This is complex, and I want to make sure we get it right. Would you like to talk to the team?",
    "I'm not confident in my answer here. Let me connect you with someone who can help.",
    "This is beyond my current capabilities. I recommend reaching out to support.",
  ],
};

/**
 * Get a random error message from a category
 */
export function getErrorMessage(category: keyof typeof ERROR_MESSAGES): string {
  const messages = ERROR_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}
