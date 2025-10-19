/**
 * Achievement Badge Component
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Display earned badges and milestones with tooltips
 * Shows achievement icons, names, and earn dates
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementBadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
  };
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function AchievementBadge({
  badge,
  size = 'md',
  showTooltip = true
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const BadgeContent = (
    <div 
      className="flex flex-col items-center gap-2"
      data-testid={`achievement-${badge.id}`}
    >
      <span className={sizeClasses[size]}>{badge.icon}</span>
      <Badge variant="secondary" className="text-xs">
        {badge.name}
      </Badge>
    </div>
  );

  if (!showTooltip) return BadgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <p className="text-xs text-muted-foreground">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Example badges configuration
export const ACHIEVEMENT_BADGES = {
  'first-post': {
    icon: '📝',
    name: 'Storyteller',
    description: 'Created your first post'
  },
  'popular': {
    icon: '⭐',
    name: 'Popular',
    description: 'Received 10 likes on your posts'
  },
  'social-dancer': {
    icon: '💃',
    name: 'Social Dancer',
    description: 'RSVP\'d to your first event'
  },
  'organizer': {
    icon: '🎯',
    name: 'Organizer',
    description: 'Created your first event'
  },
  'well-connected': {
    icon: '🤝',
    name: 'Well Connected',
    description: 'Made 10 friends'
  },
  'explorer': {
    icon: '🔍',
    name: 'Explorer',
    description: 'Completed 10 searches'
  },
  'J1-complete': {
    icon: '🎉',
    name: 'Welcome Aboard!',
    description: 'Completed registration journey'
  },
  'J2-complete': {
    icon: '🏆',
    name: 'Platform Master',
    description: 'Explored all core features'
  }
};
