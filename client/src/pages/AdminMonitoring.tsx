/**
 * Mundo Tango ESA LIFE CEO - Admin Monitoring Dashboard
 * Phase 14: Unified Monitoring Interface
 * 
 * Real-time system monitoring and analytics dashboard
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  Activity, AlertCircle, CheckCircle, Clock, Cpu, Database,
  HardDrive, Info, Layers, MemoryStick, Server, TrendingUp,
  Users, Zap, AlertTriangle, Shield, Globe, Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Types
interface SystemMetrics {
  cpu: { usage: number; cores: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  uptime: number;
  activeConnections: number;
  requestRate: number;
  errorRate: number;
  responseTime: { p50: number; p95: number; p99: number };
}

interface AgentMetrics {
  agentId: string;
  layer: number;
  requests: number;
  avgResponseTime: number;
  successRate: number;
  tokensUsed: number;
  cost: number;
  status: 'healthy' | 'degraded' | 'down';
}

interface AlertData {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  timestamp: string;
  resolved: boolean;
}

interface WebVitalsData {
  lcp: { value: number; rating: string };
  fid: { value: number; rating: string };
  cls: { value: number; rating: string };
  ttfb: { value: number; rating: string };
}

export default function AdminMonitoring() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch system metrics
  const { data: systemMetrics, refetch: refetchSystem } = useQuery({
    queryKey: ['/api/monitoring/system'],
    refetchInterval: autoRefresh ? 10000 : false,
  });
  
  // Fetch agent metrics
  const { data: agentMetrics } = useQuery({
    queryKey: ['/api/monitoring/agents'],
    refetchInterval: autoRefresh ? 15000 : false,
  });
  
  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ['/api/monitoring/alerts'],
    refetchInterval: autoRefresh ? 5000 : false,
  });
  
  // Fetch Web Vitals
  const { data: webVitals } = useQuery({
    queryKey: ['/api/monitoring/web-vitals'],
    refetchInterval: autoRefresh ? 30000 : false,
  });
  
  // Fetch time series data
  const { data: timeSeries } = useQuery({
    queryKey: ['/api/monitoring/timeseries', selectedTimeRange],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('common.system_monitoring')}</h1>
          <p className="text-gray-500">{t('common.esa_life_ceo_61x21_realtime_monitoring_dashboard')}</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            {autoRefresh ? <Activity className="w-4 h-4 animate-pulse" /> : <Clock className="w-4 h-4" />}
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="1h">{t('common.last_1_hour')}</option>
            <option value="6h">{t('common.last_6_hours')}</option>
            <option value="24h">{t('common.last_24_hours')}</option>
            <option value="7d">{t('common.last_7_days')}</option>
          </select>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('common.system_status')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('common.operational')}</div>
            <p className="text-xs text-muted-foreground">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('common.active_alerts')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts?.filter((a: AlertData) => !a.resolved).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts?.filter((a: AlertData) => a.severity === 'critical').length || 0} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('common.request_rate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.requestRate?.toFixed(0) || 0} req/s
            </div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics?.errorRate?.toFixed(2) || 0}% error rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('common.active_users')}</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.activeConnections || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              WebSocket connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Monitoring Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
          <TabsTrigger value="agents">{t('common.agents')}</TabsTrigger>
          <TabsTrigger value="performance">{t('common.performance')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('common.alerts')}</TabsTrigger>
          <TabsTrigger value="webvitals">{t('common.web_vitals')}</TabsTrigger>
          <TabsTrigger value="logs">{t('common.logs')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>{t('common.resource_usage')}</CardTitle>
                <CardDescription>{t('common.system_resource_utilization')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t('common.cpu_usage')}</span>
                    <span className="text-sm">{systemMetrics?.cpu?.usage || 0}%</span>
                  </div>
                  <Progress value={systemMetrics?.cpu?.usage || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t('common.memory_usage')}</span>
                    <span className="text-sm">{systemMetrics?.memory?.percentage || 0}%</span>
                  </div>
                  <Progress value={systemMetrics?.memory?.percentage || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t('common.disk_usage')}</span>
                    <span className="text-sm">{systemMetrics?.disk?.percentage || 0}%</span>
                  </div>
                  <Progress value={systemMetrics?.disk?.percentage || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('common.response_time')}</CardTitle>
                <CardDescription>{t('common.api_response_time_percentiles')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'P50', value: systemMetrics?.responseTime?.p50 || 0 },
                    { name: 'P95', value: systemMetrics?.responseTime?.p95 || 0 },
                    { name: 'P99', value: systemMetrics?.responseTime?.p99 || 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Request Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.request_rate_over_time')}</CardTitle>
              <CardDescription>{t('common.http_requests_per_second')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeries?.requestRate || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.61layer_agent_performance')}</CardTitle>
              <CardDescription>{t('common.realtime_agent_metrics_across_all_layers')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {agentMetrics?.map((agent: AgentMetrics) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          agent.status === 'healthy' ? 'default' :
                          agent.status === 'degraded' ? 'secondary' : 'destructive'
                        }>
                          Layer {agent.layer}
                        </Badge>
                        <div>
                          <p className="font-medium">{agent.agentId}</p>
                          <p className="text-sm text-gray-500">
                            {agent.requests} requests • {agent.avgResponseTime.toFixed(0)}ms avg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.successRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">{t('common.success_rate')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.tokensUsed}</p>
                          <p className="text-xs text-gray-500">{t('common.tokens')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${agent.cost.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{t('common.cost')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Agent Usage Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('common.token_usage_by_agent')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agentMetrics?.slice(0, 8) || []}
                      dataKey="tokensUsed"
                      nameKey="agentId"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {agentMetrics?.slice(0, 8).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('common.agent_response_times')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={agentMetrics?.slice(0, 6) || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="agentId" />
                    <Radar
                      name="Response Time"
                      dataKey="avgResponseTime"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* Memory Usage Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.memory_usage')}</CardTitle>
              <CardDescription>{t('common.heap_and_rss_memory_consumption')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries?.memory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="heapUsed" stroke="#8884d8" name="Heap Used" />
                  <Line type="monotone" dataKey="heapTotal" stroke="#82ca9d" name="Heap Total" />
                  <Line type="monotone" dataKey="rss" stroke="#ffc658" name="RSS" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Database Performance */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.database_query_performance')}</CardTitle>
              <CardDescription>{t('common.query_execution_times_by_operation')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeries?.database || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="operation" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="p50" fill="#8884d8" name="P50" />
                  <Bar dataKey="p95" fill="#82ca9d" name="P95" />
                  <Bar dataKey="p99" fill="#ffc658" name="P99" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.active_alerts')}</CardTitle>
              <CardDescription>{t('common.current_system_alerts_and_warnings')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                <div className="space-y-2">
                  {alerts?.filter((a: AlertData) => !a.resolved).map((alert: AlertData) => (
                    <Alert key={alert.id} variant={
                      alert.severity === 'critical' ? 'destructive' : 'default'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.title}</span>
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'warning' ? 'secondary' : 'default'
                        }>
                          {alert.severity}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <p>{alert.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {alert.category} • {format(new Date(alert.timestamp), 'PPpp')}
                        </p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Web Vitals Tab */}
        <TabsContent value="webvitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('common.largest_contentful_paint')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals?.lcp?.value || 0}ms
                </div>
                <Badge variant={
                  webVitals?.lcp?.rating === 'good' ? 'default' :
                  webVitals?.lcp?.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                }>
                  {webVitals?.lcp?.rating || 'Unknown'}
                </Badge>
              </CardContent>
            </Card>

            {/* FID */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('common.first_input_delay')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals?.fid?.value || 0}ms
                </div>
                <Badge variant={
                  webVitals?.fid?.rating === 'good' ? 'default' :
                  webVitals?.fid?.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                }>
                  {webVitals?.fid?.rating || 'Unknown'}
                </Badge>
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('common.cumulative_layout_shift')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals?.cls?.value || 0}
                </div>
                <Badge variant={
                  webVitals?.cls?.rating === 'good' ? 'default' :
                  webVitals?.cls?.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                }>
                  {webVitals?.cls?.rating || 'Unknown'}
                </Badge>
              </CardContent>
            </Card>

            {/* TTFB */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('common.time_to_first_byte')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webVitals?.ttfb?.value || 0}ms
                </div>
                <Badge variant={
                  webVitals?.ttfb?.rating === 'good' ? 'default' :
                  webVitals?.ttfb?.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                }>
                  {webVitals?.ttfb?.rating || 'Unknown'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Web Vitals Trends */}
          <Card>
            <CardHeader>
              <CardTitle>{t('common.web_vitals_trends')}</CardTitle>
              <CardDescription>{t('common.core_web_vitals_over_time')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries?.webVitals || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="lcp" stroke="#8884d8" name="LCP" />
                  <Line type="monotone" dataKey="fid" stroke="#82ca9d" name="FID" />
                  <Line type="monotone" dataKey="cls" stroke="#ffc658" name="CLS" />
                  <Line type="monotone" dataKey="ttfb" stroke="#ff7c7c" name="TTFB" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.system_logs')}</CardTitle>
              <CardDescription>{t('common.realtime_system_log_stream')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                <div className="space-y-1 font-mono text-sm">
                  <p className="text-gray-500">{t('common.20250914_115400_info_system_monitoring_initialized')}</p>
                  <p className="text-green-500">{t('common.20250914_115401_success_all_health_checks_passed')}</p>
                  <p className="text-blue-500">{t('common.20250914_115402_debug_agent_layer_35_processing_re')}</p>
                  <p className="text-yellow-500">{t('common.20250914_115403_warn_cache_hit_rate_below_threshol')}</p>
                  <p className="text-gray-500">{t('common.20250914_115404_info_websocket_connection_establis')}</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];