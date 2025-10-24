import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  FileCode, 
  Search, 
  Wrench, 
  FlaskConical, 
  Shield,
  Check,
  Loader2
} from 'lucide-react';

interface AutonomousStep {
  id: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface AutonomousProgressPanelProps {
  isActive: boolean;
  currentStep?: string;
  steps: AutonomousStep[];
  checkpointCount: number;
  onCancel?: () => void;
}

const stepIcons: Record<string, typeof Bot> = {
  read: FileCode,
  search: Search,
  write: Wrench,
  test: FlaskConical,
  checkpoint: Shield,
  default: Bot
};

/**
 * Real-time progress display for autonomous mode
 * Shows current action, step history, checkpoint count
 */
export function AutonomousProgressPanel({ 
  isActive, 
  currentStep, 
  steps, 
  checkpointCount,
  onCancel 
}: AutonomousProgressPanelProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const totalSteps = steps.length || 1;
    setProgress((completedSteps / totalSteps) * 100);
  }, [steps, isActive]);

  if (!isActive && steps.length === 0) {
    return null;
  }

  const getStepIcon = (action: string) => {
    const key = Object.keys(stepIcons).find(k => action.toLowerCase().includes(k));
    const Icon = key ? stepIcons[key] : stepIcons.default;
    return Icon;
  };

  const getStatusColor = (status: AutonomousStep['status']) => {
    switch (status) {
      case 'running': return 'bg-teal-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card 
      className="p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 border-teal-500/30"
      data-testid="panel-autonomous-progress"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-teal-500 animate-pulse" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Autonomous Mode
            </h3>
            {isActive && (
              <Badge variant="outline" className="bg-teal-500/20 text-teal-500 border-teal-500/50">
                Active
              </Badge>
            )}
          </div>
          {/* FIX #4: VISUAL FEEDBACK - Show current action */}
          {currentStep && isActive && (
            <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{currentStep}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="h-3 w-3" />
            <span data-testid="text-checkpoint-count">{checkpointCount} checkpoints</span>
          </div>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" data-testid="progress-autonomous" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {Math.round(progress)}% complete • {steps.filter(s => s.status === 'completed').length}/{steps.length} steps
            </p>
          </div>
        )}

        {/* Current Step */}
        {currentStep && isActive && (
          <div className="flex items-center gap-2 p-2 rounded bg-teal-500/20 border border-teal-500/30">
            <Loader2 className="h-4 w-4 text-teal-500 animate-spin" />
            <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-current-step">
              {currentStep}
            </span>
          </div>
        )}

        {/* Step History */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {steps.map((step) => {
            const Icon = getStepIcon(step.action);
            return (
              <div
                key={step.id}
                className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-gray-800/50"
                data-testid={`step-${step.id}`}
              >
                <Icon className="h-4 w-4 text-gray-500" />
                <span className="text-sm flex-1 text-gray-700 dark:text-gray-300">
                  {step.action}
                </span>
                <Badge className={getStatusColor(step.status)} variant="secondary">
                  {step.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                  {step.status === 'running' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {step.status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        {isActive && onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded border border-red-500/30 transition-colors"
            data-testid="button-cancel-autonomous"
          >
            Cancel Autonomous Mode
          </button>
        )}
      </div>
    </Card>
  );
}
