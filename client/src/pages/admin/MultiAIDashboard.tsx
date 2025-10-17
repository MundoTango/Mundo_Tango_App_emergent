import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, TrendingUp, Activity } from 'lucide-react';
import type { AIStatusResponse, AIMetricsResponse } from '@shared/multi-ai-types';

export default function MultiAIDashboard() {
  const { data: status, isLoading: statusLoading } = useQuery<AIStatusResponse>({
    queryKey: ['/api/ai/status'],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<AIMetricsResponse>({
    queryKey: ['/api/ai/metrics'],
  });

  if (statusLoading || metricsLoading) {
    return (
      <div className="p-6" data-testid="loading-dashboard">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (isActive: boolean) => isActive ? 'text-green-500' : 'text-red-500';
  const getStatusBadge = (isActive: boolean) => isActive ? 'success' : 'destructive';

  return (
    <div className="p-6 space-y-6" data-testid="multi-ai-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Multi-AI Orchestration
          </h1>
          <p className="text-muted-foreground mt-1">
            Agents #115-117: Router, Ensemble & Meta-Orchestrator
          </p>
        </div>
        <Badge variant={status?.status === 'operational' ? 'default' : 'destructive'} data-testid="status-badge">
          {status?.status.toUpperCase()}
        </Badge>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agent Status */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-500" />
              AI Agents
            </CardTitle>
            <CardDescription>System components status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between" data-testid="agent-orchestrator">
              <span>Orchestrator</span>
              <Badge variant={status?.agents.orchestrator === 'active' ? 'default' : 'secondary'}>
                {status?.agents.orchestrator}
              </Badge>
            </div>
            <div className="flex justify-between" data-testid="agent-router">
              <span>Router</span>
              <Badge variant={status?.agents.router === 'active' ? 'default' : 'secondary'}>
                {status?.agents.router}
              </Badge>
            </div>
            <div className="flex justify-between" data-testid="agent-ensemble">
              <span>Ensemble</span>
              <Badge variant={status?.agents.ensemble === 'active' ? 'default' : 'secondary'}>
                {status?.agents.ensemble}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Model Status */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              AI Models
            </CardTitle>
            <CardDescription>Available LLM providers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center" data-testid="model-claude">
              <span>Claude Sonnet 4.5</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.models.claude || false)}`}></div>
            </div>
            <div className="flex justify-between items-center" data-testid="model-openai">
              <span>GPT-4o</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.models.openai || false)}`}></div>
            </div>
            <div className="flex justify-between items-center" data-testid="model-gemini">
              <span>Gemini 2.5 Pro</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.models.gemini || false)}`}></div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Performance
            </CardTitle>
            <CardDescription>System efficiency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between" data-testid="metric-queries">
              <span>Total Queries</span>
              <span className="font-bold">{metrics?.totalQueries || 0}</span>
            </div>
            <div className="flex justify-between" data-testid="metric-quality">
              <span>Quality Retention</span>
              <span className="font-bold">{((metrics?.qualityRetention || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between" data-testid="metric-latency">
              <span>Avg Latency</span>
              <span className="font-bold">{metrics?.averageLatency || 0}ms</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Usage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Model Usage Distribution
          </CardTitle>
          <CardDescription>
            Query routing patterns across AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics && Object.entries(metrics.modelUsage).map(([model, count]) => {
              const total = Object.values(metrics.modelUsage).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={model} className="space-y-2" data-testid={`usage-${model}`}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{model}</span>
                    <span className="text-muted-foreground">
                      {count} queries ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Savings */}
      {metrics && metrics.costSavings > 0 && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardHeader>
            <CardTitle>💰 Cost Savings</CardTitle>
            <CardDescription>
              Savings from smart routing vs. always using premium models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              ${metrics.costSavings.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              40-85% cost reduction achieved through intelligent model selection
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
