/**
 * AUTO-QUEUE BADGE - Vibe Coding Change Counter
 * Shows number of changes queued for Git commit (Universal Save System)
 * Implements Replit-style vibe coding UX
 * Added: Oct 28, 2025
 */

import { Badge } from '@/components/ui/badge';
import { Save } from 'lucide-react';

interface AutoQueueBadgeProps {
  count: number;
  onClick?: () => void;
}

export function AutoQueueBadge({ count, onClick }: AutoQueueBadgeProps) {
  if (count === 0) return null;
  
  return (
    <div
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 animate-pulse-slow"
      data-testid="badge-auto-queue"
    >
      <Save className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {count} change{count !== 1 ? 's' : ''} queued
      </span>
      <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
        Auto-saved
      </Badge>
    </div>
  );
}

// Custom animation for slower pulse
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse-slow {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.95;
    }
  }
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);
