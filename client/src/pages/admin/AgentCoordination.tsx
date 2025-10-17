import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Users, Brain, Share2, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'learning';
  learnings: number;
  collaborations: number;
  successRate: number;
}

interface Learning {
  id: string;
  pattern: string;
  agentId: string;
  agentName: string;
  confidence: number;
  sharedWith: number;
  createdAt: string;
}

interface RegistryData {
  agents: Agent[];
  stats: {
    totalAgents: number;
    activeAgents: number;
    totalLearnings: number;
    avgSuccessRate: number;
  };
  recentLearnings: Learning[];
}

export default function AgentCoordination() {
  const { toast } = useToast();

  const { data: registryData, isLoading } = useQuery<RegistryData>({
    queryKey: ['/api/agent-coordination/registry'],
    refetchInterval: 5000,
  });

  const collaborateMutation = useMutation({
    mutationFn: async (agentIds: string[]) => {
      return apiRequest('/api/agent-coordination/collaborate', {
        method: 'POST',
        body: JSON.stringify({ agentIds }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Collaboration Initiated",
        description: "Agents are now sharing knowledge",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-coordination/registry'] });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600',
      idle: 'text-gray-600',
      learning: 'text-blue-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="agent-coordination">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Agent Coordination</h1>
          <p className="text-muted-foreground">TRACK 8: Learning Systems & Agent Collaboration</p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/agent-coordination/registry'] })}
          variant="outline"
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {registryData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-agents">{registryData.stats.totalAgents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-active-agents">{registryData.stats.activeAgents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Total Learnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-learnings">{registryData.stats.totalLearnings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-success-rate">
                {registryData.stats.avgSuccessRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agents Registry */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Registry</CardTitle>
          <CardDescription>Active agents and their learning metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-state">Loading agents...</div>
          ) : registryData?.agents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents registered yet. The agent registry will populate as agents come online.
            </div>
          ) : (
            <div className="space-y-3">
              {registryData?.agents?.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`agent-${agent.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <Badge variant="outline">{agent.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {agent.learnings} learnings • {agent.collaborations} collaborations • {agent.successRate.toFixed(1)}% success
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      <span className={getStatusColor(agent.status)}>{agent.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Learnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Learnings</CardTitle>
          <CardDescription>Cross-agent knowledge sharing</CardDescription>
        </CardHeader>
        <CardContent>
          {registryData?.recentLearnings?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No learnings shared yet. Agents will begin sharing knowledge as they discover patterns.
            </div>
          ) : (
            <div className="space-y-3">
              {registryData?.recentLearnings?.map((learning) => (
                <div
                  key={learning.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`learning-${learning.id}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{learning.pattern}</div>
                    <div className="text-sm text-muted-foreground">
                      By {learning.agentName} • Shared with {learning.sharedWith} agents
                    </div>
                  </div>
                  <Badge variant="outline">
                    {(learning.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
