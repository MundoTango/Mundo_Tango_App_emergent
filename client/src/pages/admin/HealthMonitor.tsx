import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceHealth {
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
    uptime?: number;
  }>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  timestamp: string;
}

export default function HealthMonitor() {
  const { toast } = useToast();

  // Fetch health status
  const { data: healthData, isLoading } = useQuery<ServiceHealth>({
    queryKey: ['/api/health/monitor'],
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Heal service mutation
  const healMutation = useMutation({
    mutationFn: async (serviceName: string) => {
      return apiRequest('/api/health/heal', {
        method: 'POST',
        body: JSON.stringify({ serviceName }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Healing Initiated",
        description: `Service ${data.service} healing ${data.healed ? 'successful' : 'in progress'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/health/monitor'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="health-monitor-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Service Health Monitor</h1>
          <p className="text-muted-foreground">TRACK 2: Auto-Healing & Service Monitoring</p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/health/monitor'] })}
          variant="outline"
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{healthData.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-healthy">{healthData.summary.healthy}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600">Degraded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-degraded">{healthData.summary.degraded}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Unhealthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="stat-unhealthy">{healthData.summary.unhealthy}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Real-time monitoring of all platform services</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-state">Loading services...</div>
          ) : healthData?.services?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No services being monitored. Health monitoring will be implemented soon.
            </div>
          ) : (
            <div className="space-y-4">
              {healthData?.services?.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`service-${service.name}`}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Last checked: {new Date(service.lastCheck).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(service.status)}
                    {service.status !== 'healthy' && (
                      <Button
                        size="sm"
                        onClick={() => healMutation.mutate(service.name)}
                        disabled={healMutation.isPending}
                        data-testid={`button-heal-${service.name}`}
                      >
                        {healMutation.isPending ? 'Healing...' : 'Auto-Heal'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
