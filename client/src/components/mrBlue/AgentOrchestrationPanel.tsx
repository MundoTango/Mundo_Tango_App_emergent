import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Square, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentOrchestrationPanelProps {
  className?: string;
}

interface MBMDPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

interface ActiveAgent {
  id: string;
  name: string;
  type: 'Foundation' | 'Core' | 'Business' | 'Intelligence' | 'Life CEO';
  status: 'running' | 'idle' | 'error';
  currentTask?: string;
}

export default function AgentOrchestrationPanel({ className }: AgentOrchestrationPanelProps) {
  // Mock data - in production this would come from the backend
  const mbmdPhases: MBMDPhase[] = [
    { id: 'mapping', name: 'Mapping', status: 'completed', progress: 100 },
    { id: 'breakdown', name: 'Breakdown', status: 'completed', progress: 100 },
    { id: 'mitigation', name: 'Mitigation', status: 'active', progress: 65 },
    { id: 'deployment', name: 'Deployment', status: 'pending', progress: 0 },
  ];
  
  const activeAgents: ActiveAgent[] = [
    { id: 'mb73', name: 'Mr Blue Core', type: 'Foundation', status: 'running', currentTask: 'Processing user query' },
    { id: 'mb74', name: 'Tour Guide', type: 'Core', status: 'idle' },
    { id: 'mb2', name: 'Luma Labs 3D', type: 'Intelligence', status: 'running', currentTask: 'Generating avatar' },
    { id: 'a5', name: 'Search Algorithm', type: 'Business', status: 'idle' },
  ];
  
  const overallProgress = Math.round(mbmdPhases.reduce((sum, p) => sum + p.progress, 0) / mbmdPhases.length);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <Card className={`p-4 bg-white/90 dark:bg-black/40 backdrop-blur-md border-cyan-200/50 dark:border-cyan-500/30 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Play className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Agent Orchestration
          </h3>
          <Badge variant="outline" className="text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400">
            {activeAgents.filter(a => a.status === 'running').length} Active
          </Badge>
        </div>
        
        {/* MB.MD Phase Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">MB.MD Progress</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          
          <div className="grid grid-cols-4 gap-1 mt-2">
            {mbmdPhases.map((phase) => (
              <div
                key={phase.id}
                className={`p-2 rounded text-center transition-all ${
                  phase.status === 'active'
                    ? 'bg-cyan-500/20 border border-cyan-500/50'
                    : phase.status === 'completed'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300/30 dark:border-gray-700/30'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getStatusIcon(phase.status)}
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{phase.name}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{phase.progress}%</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Agents */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Active Agents</div>
          <div className="space-y-1.5">
            {activeAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2 p-2 rounded bg-gray-100/50 dark:bg-gray-800/30 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
                data-testid={`agent-${agent.id}`}
              >
                <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{agent.name}</div>
                  {agent.currentTask && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{agent.currentTask}</div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 shrink-0">
                  {agent.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* Workflow Controls */}
        <div className="flex gap-2 pt-2 border-t border-gray-300/50 dark:border-gray-700/50">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-cyan-400/50 dark:border-cyan-500/30 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            data-testid="button-workflow-start"
          >
            <Play className="h-3 w-3 mr-1" />
            Start Workflow
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            data-testid="button-workflow-pause"
          >
            <Square className="h-3 w-3 mr-1" />
            Pause
          </Button>
        </div>
      </div>
    </Card>
  );
}
