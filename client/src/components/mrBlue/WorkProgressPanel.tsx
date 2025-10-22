/**
 * WORK PROGRESS PANEL
 * Phase 3 - Stream 3: Real-time Agent Work Display
 * Shows live agent progress during work (like Replit)
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, X } from 'lucide-react';

interface AgentTask {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface WorkProgressPanelProps {
  agentId?: number;
  agentName?: string;
  onClose?: () => void;
}

export function WorkProgressPanel({ agentId, agentName, onClose }: WorkProgressPanelProps) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  // Simulate real-time task updates (will be replaced with WebSocket)
  useEffect(() => {
    if (!agentId) return;

    // Mock tasks for demonstration
    const mockTasks: AgentTask[] = [
      { id: '1', content: 'Analyzing codebase structure', status: 'completed' },
      { id: '2', content: 'Generating commit message', status: 'in_progress' },
      { id: '3', content: 'Validating changes', status: 'pending' },
      { id: '4', content: 'Pushing to GitHub', status: 'pending' }
    ];

    setTasks(mockTasks);
    setCurrentTask('Generating commit message');

    // Auto-complete tasks (simulation)
    const timer = setTimeout(() => {
      setTasks(prev => prev.map(t => ({ ...t, status: 'completed' })));
      setCurrentTask('');
    }, 5000);

    return () => clearTimeout(timer);
  }, [agentId]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !agentId) return null;

  return (
    <Card className="border-cyan-500/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            {agentName || `Agent #${agentId}`} is working...
          </CardTitle>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            data-testid="button-close-progress"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{completedTasks} / {tasks.length} tasks</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Current Task */}
        {currentTask && (
          <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-md">
            <div className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
              {currentTask}
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-2 text-xs"
              data-testid={`task-${task.id}`}
            >
              {task.status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              {task.status === 'in_progress' && (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500 flex-shrink-0" />
              )}
              {task.status === 'pending' && (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              <span className={
                task.status === 'completed'
                  ? 'text-gray-500 line-through'
                  : 'text-gray-700 dark:text-gray-300'
              }>
                {task.content}
              </span>
              {task.status === 'in_progress' && (
                <Badge variant="secondary" className="text-xs ml-auto">
                  Working...
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
