/**
 * Smart Agents Real-Time Dashboard
 * MB.MD PHASE 5 - TRACK 21
 * 
 * Live demonstration and monitoring interface
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Brain, Zap, MessageSquare, TrendingUp, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function SmartAgentsDashboard() {
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  // Fetch agent status
  const { data: agentStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/smart-agents/status'],
    refetchInterval: autoRefresh ? 3000 : false
  });

  // Fetch orchestrator stats
  const { data: orchestratorStats } = useQuery({
    queryKey: ['/api/smart-agents/orchestrator/stats'],
    refetchInterval: autoRefresh ? 3000 : false
  });

  // Fetch collaboration stats
  const { data: collaborationStats } = useQuery({
    queryKey: ['/api/smart-agents/collaboration/stats'],
    refetchInterval: autoRefresh ? 3000 : false
  });

  const agents = [
    {
      id: 106,
      name: 'API Path Validator v2',
      icon: Activity,
      color: 'text-blue-500',
      description: 'Auto-fixes API path mismatches'
    },
    {
      id: 107,
      name: 'Batch Query Optimizer',
      icon: Zap,
      color: 'text-yellow-500',
      description: 'ML-powered query optimization'
    },
    {
      id: 108,
      name: 'WebSocket Manager',
      icon: Brain,
      color: 'text-purple-500',
      description: 'Real-time connection pooling'
    },
    {
      id: 109,
      name: 'Cache Intelligence',
      icon: TrendingUp,
      color: 'text-green-500',
      description: 'Neural cache prediction'
    }
  ];

  const triggerAgent = async (agentId: number) => {
    try {
      await fetch(`/api/smart-agents/${agentId}/trigger`, { method: 'POST' });
      refetchStatus();
    } catch (error) {
      console.error('Failed to trigger agent:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background dark:bg-gray-900" data-testid="smart-agents-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">
            Smart Agents Dashboard
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">
            Real-time monitoring and control for AI agents
          </p>
        </div>
        
        <Button
          onClick={() => setAutoRefresh(!autoRefresh)}
          variant={autoRefresh ? "default" : "outline"}
          data-testid="button-toggle-autorefresh"
        >
          {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {autoRefresh ? 'Pause' : 'Resume'} Auto-Refresh
        </Button>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700",
              selectedAgent === agent.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedAgent(agent.id)}
            data-testid={`card-agent-${agent.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <agent.icon className={cn("w-8 h-8", agent.color)} />
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  #{agent.id}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2 dark:text-white">{agent.name}</CardTitle>
              <CardDescription className="dark:text-gray-400">{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerAgent(agent.id);
                }}
                data-testid={`button-trigger-${agent.id}`}
              >
                Trigger Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="orchestrator" className="w-full">
        <TabsList className="dark:bg-gray-800">
          <TabsTrigger value="orchestrator" data-testid="tab-orchestrator">
            Parallel Execution
          </TabsTrigger>
          <TabsTrigger value="collaboration" data-testid="tab-collaboration">
            Agent Collaboration
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            Execution Logs
          </TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">
            Performance Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orchestrator" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Parallel Orchestrator Status</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Worker pool and task queue monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Max Workers</p>
                  <p className="text-2xl font-bold dark:text-white">
                    {orchestratorStats?.maxWorkers || 4}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Busy Workers</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {orchestratorStats?.busyWorkers || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Queued Tasks</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {orchestratorStats?.queuedTasks || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {orchestratorStats?.totalCompleted || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MessageSquare className="w-5 h-5" />
                Agent Collaboration System
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Inter-agent messaging and shared knowledge graph
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Total Messages</p>
                  <p className="text-2xl font-bold dark:text-white">
                    {collaborationStats?.totalMessages || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Knowledge Nodes</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {collaborationStats?.knowledgeNodes || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Active Agents</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {collaborationStats?.registeredAgents || 4}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Solutions Found</p>
                  <p className="text-2xl font-bold text-green-500">
                    {collaborationStats?.knowledgeByType?.solutions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Real-time agent execution logs will appear here...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Agent performance metrics and analytics will be displayed here...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
