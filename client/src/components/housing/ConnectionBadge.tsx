import { Users, Heart, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  type ConnectionDegree, 
  getConnectionLabel, 
  getConnectionBadgeColor,
  isValidConnectionDegree 
} from '@/utils/friendshipHelpers';

interface ConnectionBadgeProps {
  connectionDegree: number;
  closenessScore?: number;
  compact?: boolean;
}

export function ConnectionBadge({ connectionDegree, closenessScore = 0, compact = false }: ConnectionBadgeProps) {
  const validDegree: ConnectionDegree = isValidConnectionDegree(connectionDegree) 
    ? connectionDegree 
    : -1;

  const label = getConnectionLabel(validDegree, compact ? 'short' : 'long');
  const { bgClass, textClass } = getConnectionBadgeColor(validDegree);
  
  const getIcon = () => {
    if (validDegree === -1) return UserPlus;
    if (validDegree === 1) return Heart;
    return Users;
  };

  const Icon = getIcon();

  const tooltipContent = validDegree > 0 && closenessScore > 0 
    ? `${label} • Closeness: ${closenessScore}/100` 
    : label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`${bgClass} ${textClass} flex items-center gap-1.5 px-2.5 py-1 border-0`}
            data-testid={`badge-connection-${validDegree}`}
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
