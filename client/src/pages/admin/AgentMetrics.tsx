/**
 * ESA 61x21 Multi-Agent System Metrics Dashboard
 * Comprehensive monitoring and analytics for the agent system
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Layers,
  MemoryStick,
  Network,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Brain,
  Shield,
  Server,
  Code,
  Package,
  MessageSquare,
  Search,
  BarChart3,
  Bot,
  AlertCircle,
  Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import { Helmet } from 'react-helmet';

// Color scheme for agents
const AGENT_COLORS = {
  infrastructure: '#3B82F6',
  frontend: '#10B981',
  background: '#F59E0B',
  realtime: '#8B5CF6',
  business: '#EF4444',
  analytics: '#06B6D4',
  life_ceo: '#F97316',
  platform: '#84CC16',
  master: '#EC4899',
};

const SEVERITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

interface AgentMetric {
  id: string;
  name: string;
  successRate: number;
  avgResponseTime: number;
  layers: number[];
  status?: string;
  healthy?: boolean;
}

interface HealthCheck {
  status: string;
  timestamp: number;
  uptime: number;
  agents: AgentMetric[];
  system: {
    memory: any;
    cpu: any;
    nodeVersion: string;
  };
  metrics: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageProcessingTime: number;
  };
  recentErrors: Array<{
    timestamp: number;
    agentId: string;
    error: string;
    severity: string;
  }>;
  checks: {
    database: boolean;
    agents: number;
    totalAgents: number;
  };
}

interface Analytics {
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    healthScore: number;
    activeAgents: number;
    totalLayers: number;
  };
  agentPerformance: AgentMetric[];
  topPatterns: Array<{ name: string; count: number }>;
  recentErrors: Array<{
    timestamp: number;
    agentId: string;
    error: string;
    severity: string;
  }>;
  tokenUsage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    costEstimate: number;
    byModel: Record<string, number>;
    byAgent: Record<string, number>;
  };
  queueDepth: {
    totalQueues: number;
    activeJobs: number;
    waitingJobs: number;
    completedJobs: number;
    failedJobs: number;
  };
  timestamp: number;
}

export default function AgentMetrics() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch health check data
  const { data: health, isLoading: healthLoading } = useQuery<HealthCheck>({
    queryKey: ['/api/esa-agents/health'],
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/esa-agents/analytics'],
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Auto-refresh control
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/esa-agents/health'] });
        queryClient.invalidateQueries({ queryKey: ['/api/esa-agents/analytics'] });
      }, refreshInterval);
      return (
    <>
      <Helmet>
        <title>Agent Metrics | Life CEO</title>
      </Helmet>
      
    </>
  ) => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Loading state
  if (healthLoading || analyticsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Prepare chart data
  const agentPerformanceData = analytics?.agentPerformance?.map(agent => ({
    name: agent.name.split(' ')[0],
    successRate: agent.successRate,
    responseTime: agent.avgResponseTime,
    layers: agent.layers.length,
  })) || [];

  const errorsByAgent = analytics?.recentErrors?.reduce((acc: any, error) => {
    acc[error.agentId] = (acc[error.agentId] || 0) + 1;
    return acc;
  }, {}) || {};

  const errorChartData = Object.entries(errorsByAgent).map(([agentId, count]) => ({
    agent: agentId,
    errors: count,
  }));

  const patternChartData = analytics?.topPatterns?.slice(0, 8) || [];

  const queueMetrics = [
    { name: 'Active', value: analytics?.queueDepth?.activeJobs || 0, color: '#3B82F6' },
    { name: 'Waiting', value: analytics?.queueDepth?.waitingJobs || 0, color: '#F59E0B' },
    { name: 'Completed', value: analytics?.queueDepth?.completedJobs || 0, color: '#10B981' },
    { name: 'Failed', value: analytics?.queueDepth?.failedJobs || 0, color: '#EF4444' },
  ];

  // Calculate overall status
  const overallStatus = health?.status || 'unknown';
  const statusColor = overallStatus === 'healthy' ? 'text-green-500' : 
                      overallStatus === 'degraded' ? 'text-yellow-500' : 'text-red-500';
  const statusIcon = overallStatus === 'healthy' ? CheckCircle : 
                    overallStatus === 'degraded' ? AlertCircle : AlertTriangle;
  const StatusIcon = statusIcon;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ESA 61x21 Agent Monitoring</h1>
            <p className="text-gray-500 mt-2">
              Real-time monitoring and analytics for the multi-agent system
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Badge variant={overallStatus === 'healthy' ? 'default' : 'destructive'}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {overallStatus.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
             
            >
              {autoRefresh ? 'Pause' : 'Resume'} Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.summary?.totalRequests?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {health?.agents?.length || 0} agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.summary?.avgResponseTime?.toFixed(2) || 0}ms
            </div>
            <Progress 
              value={Math.min((analytics?.summary?.avgResponseTime || 0) / 10, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((100 - (analytics?.summary?.errorRate || 0)).toFixed(1))}%
            </div>
            <Progress 
              value={100 - (analytics?.summary?.errorRate || 0)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${statusColor}`}>
              {analytics?.summary?.healthScore || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.checks?.agents || 0}/{health?.checks?.totalAgents || 0} agents healthy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Agent Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Success rate and response time by agent</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <RadarChart data={agentPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Success Rate" 
                      dataKey="successRate" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Queue Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Queue Status</CardTitle>
                <CardDescription>Current job distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <PieChart>
                    <Pie
                      data={queueMetrics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {queueMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Current system status and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(Date.now() - (health?.uptime || 0) * 1000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Node Version</span>
                    <span className="text-sm font-medium">{health?.system?.nodeVersion}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="text-sm font-medium">
                      {((health?.system?.memory?.heapUsed || 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Jobs</span>
                    <span className="text-sm font-medium">{health?.metrics?.totalJobs || 0}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Agents</span>
                    <span className="text-sm font-medium">
                      {health?.checks?.agents || 0}/{health?.checks?.totalAgents || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <Badge variant={health?.checks?.database ? 'default' : 'destructive'}>
                      {health?.checks?.database ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {health?.agents?.map((agent) => (
              <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedAgent(agent.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {agent.name}
                      </CardTitle>
                      <CardDescription>
                        Agent ID: {agent.id}
                      </CardDescription>
                    </div>
                    <Badge variant={agent.healthy ? 'default' : 'destructive'}>
                      {agent.healthy ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Layers</span>
                      <span className="text-sm font-medium">
                        {agent.layers?.join(', ') || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="text-sm font-medium">{agent.successRate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Response</span>
                      <span className="text-sm font-medium">{agent.avgResponseTime?.toFixed(0)}ms</span>
                    </div>
                    <Progress value={agent.successRate} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Agent response times over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="400">
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="responseTime" fill="#3B82F6" name="Response Time (ms)" />
                  <Bar dataKey="successRate" fill="#10B981" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Errors by Agent</CardTitle>
                <CardDescription>Distribution of errors across agents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <BarChart data={errorChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Last 10 error events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {health?.recentErrors?.slice(0, 10).map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>
                          {error.agentId} - {error.severity}
                        </AlertTitle>
                        <AlertDescription>
                          {error.error}
                          <br />
                          <span className="text-xs">
                            {formatDistanceToNow(error.timestamp)} ago
                          </span>
                        </AlertDescription>
                      </Alert>
                    ))}
                    {(!health?.recentErrors || health.recentErrors.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No recent errors</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Queues Tab */}
        <TabsContent value="queues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queue Metrics</CardTitle>
              <CardDescription>Job processing statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">
                    {analytics?.queueDepth?.activeJobs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Active Jobs</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {analytics?.queueDepth?.waitingJobs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Waiting Jobs</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {analytics?.queueDepth?.completedJobs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Completed Jobs</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">
                    {analytics?.queueDepth?.failedJobs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Failed Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Applied Patterns</CardTitle>
              <CardDescription>Most frequently used design patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="400">
                <BarChart data={patternChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}