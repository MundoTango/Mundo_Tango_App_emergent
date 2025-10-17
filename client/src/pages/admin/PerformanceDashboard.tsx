import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Database, TrendingUp, RefreshCw } from 'lucide-react';

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface Alert {
  id: string;
  type: 'high_response_time' | 'high_memory' | 'high_cpu';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

interface DashboardData {
  metrics: PerformanceMetric[];
  currentStats: {
    avgResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
  alerts: Alert[];
}

export default function PerformanceDashboard() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/performance/dashboard'],
    refetchInterval: 3000, // Poll every 3 seconds for real-time
  });

  const { data: alertsData } = useQuery<{ alerts: Alert[] }>({
    queryKey: ['/api/performance/alerts'],
    refetchInterval: 5000,
  });

  const getSeverityColor = (severity: string) => {
    return severity === 'critical' ? 'text-red-600' : 'text-yellow-600';
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="performance-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Performance Dashboard</h1>
          <p className="text-muted-foreground">TRACK 6: Real-Time Performance Monitoring & Alerts</p>
        </div>
        <Button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/performance/dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['/api/performance/alerts'] });
          }}
          variant="outline"
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Stats */}
      {dashboardData?.currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-response-time">
                {dashboardData.currentStats.avgResponseTime}ms
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-memory">
                {dashboardData.currentStats.memoryUsage}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-cpu">
                {dashboardData.currentStats.cpuUsage}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Active Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-connections">
                {dashboardData.currentStats.activeConnections}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trend</CardTitle>
          <CardDescription>Last 24 hours performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center" data-testid="loading-state">
              Loading metrics...
            </div>
          ) : dashboardData?.metrics?.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No performance data available yet. Metrics will appear as the system collects data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.metrics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" name="Response Time (ms)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Alerts</CardTitle>
          <CardDescription>Real-time threshold violations</CardDescription>
        </CardHeader>
        <CardContent>
          {alertsData?.alerts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts. System performance is within normal parameters.
            </div>
          ) : (
            <div className="space-y-3">
              {alertsData?.alerts?.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.message}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
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
