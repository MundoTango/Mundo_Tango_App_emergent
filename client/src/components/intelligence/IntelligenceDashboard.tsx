/**
 * INTELLIGENCE DASHBOARD
 * MB.MD Phase 9 - Track 74
 * 
 * Real-time metrics and insights from all intelligence agents
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Network, Zap, AlertCircle } from 'lucide-react';

export default function IntelligenceDashboard() {
  const { data: agentsData } = useQuery<{ agents: any[] }>({
    queryKey: ['/api/phase9/agents/metadata'],
    refetchInterval: 10000, // Update every 10s
  });

  const agents = agentsData?.agents || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Intelligence Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time insights from 6 specialized intelligence agents
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent: any) => (
          <Card key={agent.id} data-testid={`agent-card-${agent.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {agent.name}
              </CardTitle>
              <CardDescription>v{agent.version}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {agent.capabilities?.slice(0, 3).map((cap: string) => (
                  <Badge key={cap} variant="secondary" className="text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>
              
              {agent.expertSources && (
                <div className="text-xs text-muted-foreground">
                  <strong>Expert Sources:</strong>
                  <div className="mt-1">
                    {agent.expertSources.slice(0, 2).map((source: string) => (
                      <div key={source}>• {source}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="metric-agents-active">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Intelligence network</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-capabilities">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.reduce((sum: number, a: any) => sum + (a.capabilities?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">System-wide</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-expert-sources">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expert Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.reduce((sum: number, a: any) => sum + (a.expertSources?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Research-backed</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common intelligence operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <button
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              data-testid="button-cross-phase-sync"
            >
              <Network className="h-4 w-4" />
              <span className="text-sm">Sync Cross-Phase</span>
            </button>
            
            <button
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              data-testid="button-predict-plan"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Predict Plan</span>
            </button>
            
            <button
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              data-testid="button-adjust-priority"
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm">Adjust Priorities</span>
            </button>
            
            <button
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              data-testid="button-map-dependencies"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Map Dependencies</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
