import { Users, Heart, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionBadgeProps {
  connectionDegree: number;
  closenessScore?: number;
  compact?: boolean;
}

export function ConnectionBadge({ connectionDegree, closenessScore = 0, compact = false }: ConnectionBadgeProps) {
  const getBadgeInfo = () => {
    if (connectionDegree === -1) {
      return {
        label: 'Not connected',
        icon: UserPlus,
        variant: 'secondary' as const,
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      };
    }
    
    if (connectionDegree === 1) {
      return {
        label: compact ? '1st' : '1st degree friend',
        icon: Heart,
        variant: 'default' as const,
        className: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0'
      };
    }
    
    if (connectionDegree === 2) {
      return {
        label: compact ? '2nd' : '2nd degree connection',
        icon: Users,
        variant: 'secondary' as const,
        className: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-0'
      };
    }
    
    if (connectionDegree === 3) {
      return {
        label: compact ? '3rd' : '3rd degree connection',
        icon: Users,
        variant: 'outline' as const,
        className: 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white border-0'
      };
    }
    
    return {
      label: 'Connected',
      icon: Users,
      variant: 'outline' as const,
      className: 'border-gray-300 dark:border-gray-600'
    };
  };

  const { label, icon: Icon, variant, className } = getBadgeInfo();

  const tooltipContent = connectionDegree > 0 && closenessScore > 0 
    ? `${label} • Closeness: ${closenessScore}/100` 
    : label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={variant} 
            className={`${className} flex items-center gap-1.5 px-2.5 py-1`}
            data-testid={`badge-connection-${connectionDegree}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="font-medium">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
