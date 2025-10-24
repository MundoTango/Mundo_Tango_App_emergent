import { Switch } from '@/components/ui/switch';
import { Bot, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutonomousToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle switch to enable/disable autonomous mode
 * Shows safety info in tooltip
 */
export function AutonomousToggle({ enabled, onChange, disabled }: AutonomousToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30">
            {enabled ? (
              <Bot className="h-4 w-4 text-teal-500 animate-pulse" data-testid="icon-autonomous-active" />
            ) : (
              <Shield className="h-4 w-4 text-gray-400" data-testid="icon-autonomous-inactive" />
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Autonomous
            </span>
            <Switch
              checked={enabled}
              onCheckedChange={onChange}
              disabled={disabled}
              data-testid="switch-autonomous-mode"
              className="data-[state=checked]:bg-teal-500"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Autonomous Mode
            </p>
            <p className="text-xs text-gray-400">
              {enabled ? (
                <>Mr Blue can autonomously read, write, and test code. All destructive actions require approval.</>
              ) : (
                <>Enable to let Mr Blue autonomously solve coding tasks. Creates checkpoints before changes.</>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <Shield className="h-3 w-3" />
              <span>Protected: Checkpoints • Approval Gates • Rollback</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
