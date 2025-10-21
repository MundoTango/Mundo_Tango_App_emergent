/**
 * STREAMING RESPONSE INDICATOR
 * Typewriter effect and loading animations
 * MB.MD Track: mrblue-2
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface StreamingIndicatorProps {
  text?: string;
  variant?: 'dots' | 'typing' | 'wave';
}

export function StreamingIndicator({ text, variant = 'dots' }: StreamingIndicatorProps) {
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {text || 'Mr Blue is thinking...'}
        </span>
      </div>
    );
  }

  if (variant === 'typing') {
    return (
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {text || 'Typing...'}
        </span>
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className="flex items-center gap-1 p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-cyan-500 to-blue-600 rounded-full"
            style={{
              height: `${Math.random() * 20 + 10}px`,
              animation: 'wave 1s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
          {text || 'Processing...'}
        </span>
      </div>
    );
  }

  return null;
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 30, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className="inline-block">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-1 h-4 bg-cyan-500 ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
