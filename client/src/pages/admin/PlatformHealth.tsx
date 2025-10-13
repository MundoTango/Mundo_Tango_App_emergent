/**
 * MB.MD TRACK 11.2: Platform Health Dashboard
 * Real-time monitoring: 95% → 100% progress tracking
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HealthMetric {
  category: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  issues: string[];
}

interface PlatformHealth {
  overall: number;
  metrics: HealthMetric[];
  trends: {
    day: number;
    week: number;
    month: number;
  };
}

export default function PlatformHealthDashboard() {
  const { data: health, isLoading } = useQuery<PlatformHealth>({
    queryKey: ['/api/admin/platform-health'],
    refetchInterval: 30000 // Refresh every 30s
  });
  
  if (isLoading) {
    return <div className="p-6">Loading platform health...</div>;
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'good': return <Activity className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Platform Health</h1>
        <Badge variant={health?.overall && health.overall >= 95 ? 'default' : 'secondary'}>
          {health?.overall}% Health
        </Badge>
      </div>
      
      {/* Overall Health Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Platform Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Current</span>
                <span className="text-sm text-muted-foreground">{health?.overall}% / 100%</span>
              </div>
              <Progress value={health?.overall || 0} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">24h Trend</p>
                <p className="text-2xl font-bold text-green-600">+{health?.trends.day}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">7d Trend</p>
                <p className="text-2xl font-bold text-green-600">+{health?.trends.week}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">30d Trend</p>
                <p className="text-2xl font-bold text-green-600">+{health?.trends.month}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Category Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health?.metrics.map((metric) => (
          <Card key={metric.category} data-testid={`health-metric-${metric.category.toLowerCase()}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.category}
                </span>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={metric.score} className="mb-3 h-2" />
              
              {metric.issues.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Issues:</p>
                  {metric.issues.map((issue, idx) => (
                    <p key={idx} className="text-xs text-red-600">• {issue}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      {health && health.overall < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.overall < 95 && (
                <li className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Run API path validation: <code className="bg-gray-100 px-2 py-1 rounded">node scripts/validate-api-paths.mjs</code></span>
                </li>
              )}
              {health.metrics.some(m => m.status === 'warning' || m.status === 'critical') && (
                <li className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Fix critical issues in: {health.metrics.filter(m => m.status === 'critical').map(m => m.category).join(', ')}</span>
                </li>
              )}
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Deploy smart agents (#106-109) for automated optimization</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
