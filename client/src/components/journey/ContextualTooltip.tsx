/**
 * Contextual Tooltip Component
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Smart tooltips that show once per user (tracked in localStorage)
 * Supports auto-show, hover, click triggers with dismissal
 */

import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X } from 'lucide-react';

interface ContextualTooltipProps {
  id: string; // Unique tooltip ID for localStorage tracking
  trigger: 'hover' | 'click' | 'auto';
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  autoDismiss?: number; // Auto-dismiss after X seconds
  children: React.ReactNode;
}

export function ContextualTooltip({
  id,
  trigger,
  content,
  position = 'top',
  autoDismiss = 5,
  children
}: ContextualTooltipProps) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen this tooltip
    const seen = localStorage.getItem(`tooltip-${id}`);
    if (seen) {
      setDismissed(true);
    } else if (trigger === 'auto') {
      // Auto-show after 1 second
      setTimeout(() => setShown(true), 1000);
    }
  }, [id, trigger]);

  useEffect(() => {
    if (shown && autoDismiss) {
      const timer = setTimeout(() => handleDismiss(), autoDismiss * 1000);
      return () => clearTimeout(timer);
    }
  }, [shown, autoDismiss]);

  const handleDismiss = () => {
    setShown(false);
    setDismissed(true);
    localStorage.setItem(`tooltip-${id}`, 'true');
  };

  if (dismissed) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip open={shown} onOpenChange={setShown}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-sm" data-testid={`tooltip-${id}`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm">{content}</p>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
              data-testid={`button-dismiss-${id}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            data-testid={`button-dont-show-${id}`}
          >
            Don't show again
          </button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
